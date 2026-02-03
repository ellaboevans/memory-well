import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Entry validator for return types
const entryValidator = v.object({
  _id: v.id("entries"),
  _creationTime: v.number(),
  wallId: v.id("walls"),
  name: v.string(),
  message: v.optional(v.string()),
  signatureImageId: v.optional(v.id("_storage")),
  stickers: v.optional(v.array(v.string())),
  email: v.optional(v.string()),
  isVerified: v.boolean(),
  isHidden: v.boolean(),
  createdAt: v.number(),
});

/**
 * List entries for a wall (public, excludes hidden for non-owners)
 */
export const listByWall = query({
  args: {
    wallId: v.id("walls"),
    limit: v.optional(v.number()),
  },
  returns: v.array(entryValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const wall = await ctx.db.get(args.wallId);

    if (!wall) return [];

    const isOwner = userId && wall.ownerId === userId;
    const limit = args.limit ?? 100;

    const entries = await ctx.db
      .query("entries")
      .withIndex("by_wall_created", (q) => q.eq("wallId", args.wallId))
      .order("desc")
      .take(limit);

    // Filter hidden entries for non-owners
    if (isOwner) {
      return entries;
    }

    return entries.filter((entry) => !entry.isHidden);
  },
});

/**
 * Get entry count for a wall
 */
export const countByWall = query({
  args: { wallId: v.id("walls") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_wall", (q) => q.eq("wallId", args.wallId))
      .collect();

    return entries.filter((e) => !e.isHidden).length;
  },
});

/**
 * Create a new entry (public - no auth required)
 */
export const create = mutation({
  args: {
    wallId: v.id("walls"),
    name: v.string(),
    message: v.optional(v.string()),
    signatureImageId: v.optional(v.id("_storage")),
    stickers: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
  },
  returns: v.id("entries"),
  handler: async (ctx, args) => {
    const wall = await ctx.db.get(args.wallId);

    if (!wall) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Wall not found" });
    }

    if (!wall.acceptingEntries) {
      throw new ConvexError({
        code: "WALL_CLOSED",
        message: "This wall is no longer accepting entries",
      });
    }

    // Check time window
    const now = Date.now();
    if (wall.entryWindowStart && now < wall.entryWindowStart) {
      throw new ConvexError({
        code: "WALL_NOT_OPEN",
        message: "This wall is not yet accepting entries",
      });
    }
    if (wall.entryWindowEnd && now > wall.entryWindowEnd) {
      throw new ConvexError({
        code: "WALL_CLOSED",
        message: "The entry window for this wall has closed",
      });
    }

    return await ctx.db.insert("entries", {
      wallId: args.wallId,
      name: args.name,
      message: args.message,
      signatureImageId: args.signatureImageId,
      stickers: args.stickers,
      email: args.email,
      isVerified: false,
      isHidden: false,
      createdAt: now,
    });
  },
});

/**
 * Toggle entry visibility (owner only)
 */
export const toggleHidden = mutation({
  args: { entryId: v.id("entries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Entry not found" });
    }

    const wall = await ctx.db.get(entry.wallId);
    if (wall?.ownerId !== userId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized" });
    }

    await ctx.db.patch(args.entryId, { isHidden: !entry.isHidden });
    return null;
  },
});

/**
 * Toggle entry verification (owner only)
 */
export const toggleVerified = mutation({
  args: { entryId: v.id("entries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Entry not found" });
    }

    const wall = await ctx.db.get(entry.wallId);
    if (wall?.ownerId !== userId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized" });
    }

    await ctx.db.patch(args.entryId, { isVerified: !entry.isVerified });
    return null;
  },
});

/**
 * Delete an entry (owner only)
 */
export const remove = mutation({
  args: { entryId: v.id("entries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Entry not found" });
    }

    const wall = await ctx.db.get(entry.wallId);
    if (wall?.ownerId !== userId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not authorized" });
    }

    await ctx.db.delete(args.entryId);
    return null;
  },
});

/**
 * Generate an upload URL for signature images
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get signature image URL from storage ID
 */
export const getSignatureUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
