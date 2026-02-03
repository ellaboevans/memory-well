import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Profile validator for return types - includes displayName alias for name
const profileValidator = v.object({
  _id: v.id("profiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.optional(v.string()),
  displayName: v.optional(v.string()),
  email: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  tier: v.union(v.literal("free"), v.literal("premium")),
  createdAt: v.number(),
});

/**
 * Get the current user's profile
 */
export const me = query({
  args: {},
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Get user data
    const user = await ctx.db.get(userId);

    if (!profile) {
      // Return a placeholder - the ensureProfile mutation will create it
      return null;
    }

    return {
      ...profile,
      displayName: profile.name,
      email: user?.email,
    };
  },
});

/**
 * Ensure the current user has a profile (create if missing)
 */
export const ensureProfile = mutation({
  args: {},
  returns: v.id("profiles"),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Get user data for name
    const user = await ctx.db.get(userId);

    return await ctx.db.insert("profiles", {
      userId,
      name: user?.name ?? undefined,
      tier: "free",
      createdAt: Date.now(),
    });
  },
});

/**
 * Create or update the current user's profile
 */
export const upsertProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      avatarUrl: args.avatarUrl,
      tier: "free",
      createdAt: Date.now(),
    });
  },
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      name: args.displayName,
      avatarUrl: args.avatarUrl,
    });

    return null;
  },
});
