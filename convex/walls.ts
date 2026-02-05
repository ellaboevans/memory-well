import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Theme validator
const themeValidator = v.object({
  primaryColor: v.string(),
  backgroundColor: v.string(),
  fontFamily: v.string(),
});

// Wall validator for return types
const wallValidator = v.object({
  _id: v.id("walls"),
  _creationTime: v.number(),
  ownerId: v.id("users"),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  coverImageId: v.optional(v.id("_storage")),
  theme: themeValidator,
  visibility: v.union(v.literal("private"), v.literal("public")),
  acceptingEntries: v.boolean(),
  entryWindowStart: v.optional(v.number()),
  entryWindowEnd: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Wall with entry count for lists
const wallWithCountValidator = v.object({
  _id: v.id("walls"),
  _creationTime: v.number(),
  ownerId: v.id("users"),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  coverImageId: v.optional(v.id("_storage")),
  theme: themeValidator,
  visibility: v.union(v.literal("private"), v.literal("public")),
  acceptingEntries: v.boolean(),
  entryWindowStart: v.optional(v.number()),
  entryWindowEnd: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  entryCount: v.number(),
});

const MAX_FREE_WALLS = 3;

/**
 * List all walls owned by the current user
 */
export const listMyWalls = query({
  args: {},
  returns: v.array(wallWithCountValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const walls = await ctx.db
      .query("walls")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    // Get entry counts for each wall
    const wallsWithCounts = await Promise.all(
      walls.map(async (wall) => {
        const entries = await ctx.db
          .query("entries")
          .withIndex("by_wall", (q) => q.eq("wallId", wall._id))
          .collect();
        return {
          ...wall,
          entryCount: entries.length,
        };
      }),
    );

    return wallsWithCounts;
  },
});

/**
 * Get a wall by its slug (public access)
 */
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(wallValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walls")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get a wall by ID (owner only)
 */
export const get = query({
  args: { wallId: v.id("walls") },
  returns: v.union(wallValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const wall = await ctx.db.get(args.wallId);

    if (!wall) return null;

    // Only owner can view private walls via ID
    if (wall.visibility === "private" && wall.ownerId !== userId) {
      return null;
    }

    return wall;
  },
});

/**
 * Create a new wall
 */
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    theme: v.optional(themeValidator),
  },
  returns: v.id("walls"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    // Check wall limit for free users
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const tier = profile?.tier ?? "free";

    if (tier === "free") {
      const existingWalls = await ctx.db
        .query("walls")
        .withIndex("by_owner", (q) => q.eq("ownerId", userId))
        .collect();

      if (existingWalls.length >= MAX_FREE_WALLS) {
        throw new ConvexError({
          code: "WALL_LIMIT_REACHED",
          message: `Free users can only create ${MAX_FREE_WALLS} walls. Upgrade to Premium for unlimited walls.`,
        });
      }
    }

    // Check slug uniqueness
    const existingSlug = await ctx.db
      .query("walls")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingSlug) {
      throw new ConvexError({
        code: "SLUG_TAKEN",
        message: "This URL is already taken. Please choose another.",
      });
    }

    const now = Date.now();

    return await ctx.db.insert("walls", {
      ownerId: userId,
      slug: args.slug,
      title: args.title,
      description: args.description,
      theme: args.theme ?? {
        primaryColor: "#ffffff",
        backgroundColor: "#0a0a0a",
        fontFamily: "Geist",
      },
      visibility: "private",
      acceptingEntries: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a wall
 */
export const update = mutation({
  args: {
    wallId: v.id("walls"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.union(v.id("_storage"), v.null())),
    theme: v.optional(themeValidator),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    acceptingEntries: v.optional(v.boolean()),
    entryWindowStart: v.optional(v.union(v.number(), v.null())),
    entryWindowEnd: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const wall = await ctx.db.get(args.wallId);
    if (!wall) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Wall not found" });
    }

    if (wall.ownerId !== userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Not authorized to edit this wall",
      });
    }

    const { wallId, ...updates } = args;

    // Filter out undefined values but keep null (for explicitly clearing fields like coverImageId)
    // Convert null to undefined since the schema uses v.optional() which expects undefined, not null
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, value ?? undefined]),
    );

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(wallId, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

/**
 * Delete a wall
 */
export const remove = mutation({
  args: { wallId: v.id("walls") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const wall = await ctx.db.get(args.wallId);
    if (!wall) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Wall not found" });
    }

    if (wall.ownerId !== userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Not authorized to delete this wall",
      });
    }

    // Delete all entries for this wall
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_wall", (q) => q.eq("wallId", args.wallId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    await ctx.db.delete(args.wallId);
    return null;
  },
});
/**
 * Generate an upload URL for cover images
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get cover image URL from storage ID
 */
export const getCoverImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
