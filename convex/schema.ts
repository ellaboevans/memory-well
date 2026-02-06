import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profile (extends auth user)
  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Memory walls
  walls: defineTable({
    ownerId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    theme: v.object({
      primaryColor: v.string(),
      backgroundColor: v.string(),
      fontFamily: v.string(),
    }),
    visibility: v.union(v.literal("private"), v.literal("public")),
    acceptingEntries: v.boolean(),
    entryWindowStart: v.optional(v.number()),
    entryWindowEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  // Guest entries/signatures
  entries: defineTable({
    wallId: v.id("walls"),
    name: v.string(),
    message: v.optional(v.string()),
    signatureImageId: v.optional(v.id("_storage")),
    stickers: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    isVerified: v.boolean(),
    isHidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_wall", ["wallId"])
    .index("by_wall_created", ["wallId", "createdAt"]),

  // Wall view analytics (geo insights)
  wallViews: defineTable({
    wallId: v.id("walls"),
    visitorId: v.string(),
    countryCode: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_wall_created", ["wallId", "createdAt"])
    .index("by_wall_country", ["wallId", "countryCode"])
    .index("by_wall_visitor", ["wallId", "visitorId"]),

  // Purchases for billing (Polar.sh - one-time payment)
  subscriptions: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_polar_customer", ["polarCustomerId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
