import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the current user's purchase/subscription info
 */
export const getMySubscription = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("subscriptions"),
      _creationTime: v.number(),
      userId: v.id("users"),
      polarCustomerId: v.string(),
      polarOrderId: v.optional(v.string()),
      status: v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("past_due"),
        v.literal("trialing"),
      ),
      currentPeriodEnd: v.optional(v.number()),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/**
 * Handle one-time order paid (from webhook)
 */
export const handleOrderPaid = mutation({
  args: {
    polarCustomerId: v.string(),
    email: v.string(),
    polarOrderId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (!user) {
      console.log("User not found for email:", args.email);
      return null;
    }

    // Check if purchase record exists
    const existingPurchase = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingPurchase) {
      // Update existing record
      await ctx.db.patch(existingPurchase._id, {
        status: "active",
        polarCustomerId: args.polarCustomerId,
        polarOrderId: args.polarOrderId,
      });
    } else {
      // Create new purchase record
      await ctx.db.insert("subscriptions", {
        userId: user._id,
        polarCustomerId: args.polarCustomerId,
        polarOrderId: args.polarOrderId,
        status: "active",
        createdAt: Date.now(),
      });
    }

    // Upgrade user profile to premium (lifetime)
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, { tier: "premium" });
    }

    return null;
  },
});
