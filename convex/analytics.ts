import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const dayCountValidator = v.object({
  date: v.string(),
  count: v.number(),
});

export const getDashboardMetrics = query({
  args: {
    days: v.optional(v.union(v.literal(7), v.literal(30), v.literal(90))),
  },
  returns: v.object({
    series: v.array(dayCountValidator),
    total: v.number(),
    last7: v.number(),
    last30: v.number(),
    last90: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { series: [], total: 0, last7: 0, last30: 0, last90: 0 };
    }

    const walls = await ctx.db
      .query("walls")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    if (walls.length === 0) {
      return { series: [], total: 0, last7: 0, last30: 0, last90: 0 };
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const windowDays = args.days ?? 30;
    const cutoff = now - windowDays * dayMs;
    const counts: Record<string, number> = {};

    for (const wall of walls) {
      const entries = await ctx.db
        .query("entries")
        .withIndex("by_wall_created", (q) =>
          q.eq("wallId", wall._id).gte("createdAt", cutoff),
        )
        .collect();

      for (const entry of entries) {
        const dayKey = new Date(entry.createdAt).toISOString().slice(0, 10);
        counts[dayKey] = (counts[dayKey] ?? 0) + 1;
      }
    }

    const series = Array.from({ length: windowDays }, (_, i) => {
      const date = new Date(now - (windowDays - 1 - i) * dayMs)
        .toISOString()
        .slice(0, 10);
      return { date, count: counts[date] ?? 0 };
    });

    const total = series.reduce((sum, day) => sum + day.count, 0);
    const last7 = series.slice(-7).reduce((sum, day) => sum + day.count, 0);
    const last30 = series.slice(-30).reduce((sum, day) => sum + day.count, 0);
    const last90 = series.slice(-90).reduce((sum, day) => sum + day.count, 0);

    return { series, total, last7, last30, last90 };
  },
});

export const trackWallView = mutation({
  args: {
    wallId: v.id("walls"),
    visitorId: v.string(),
    countryCode: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const wall = await ctx.db.get(args.wallId);
    if (!wall) return null;

    const recent = await ctx.db
      .query("wallViews")
      .withIndex("by_wall_visitor", (q) =>
        q.eq("wallId", args.wallId).eq("visitorId", args.visitorId),
      )
      .order("desc")
      .take(1);

    const now = Date.now();
    const last = recent[0];
    if (last && now - last.createdAt < 6 * 60 * 60 * 1000) {
      return null;
    }

    await ctx.db.insert("wallViews", {
      wallId: args.wallId,
      visitorId: args.visitorId,
      countryCode: args.countryCode,
      country: args.country,
      region: args.region,
      city: args.city,
      timezone: args.timezone,
      userAgent: args.userAgent,
      referrer: args.referrer,
      createdAt: now,
    });

    return null;
  },
});

export const getWallGeoInsights = query({
  args: {
    wallId: v.id("walls"),
    days: v.optional(v.union(v.literal(7), v.literal(30), v.literal(90))),
  },
  returns: v.object({
    totalViews: v.number(),
    uniqueVisitors: v.number(),
    series: v.array(dayCountValidator),
    countries: v.array(
      v.object({
        countryCode: v.optional(v.string()),
        country: v.optional(v.string()),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalViews: 0, uniqueVisitors: 0, series: [], countries: [] };
    }

    const wall = await ctx.db.get(args.wallId);
    if (!wall || wall.ownerId !== userId) {
      return { totalViews: 0, uniqueVisitors: 0, series: [], countries: [] };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if ((profile?.tier ?? "free") !== "premium") {
      return { totalViews: 0, uniqueVisitors: 0, series: [], countries: [] };
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const windowDays = args.days ?? 30;
    const cutoff = now - windowDays * dayMs;

    const views = await ctx.db
      .query("wallViews")
      .withIndex("by_wall_created", (q) =>
        q.eq("wallId", args.wallId).gte("createdAt", cutoff),
      )
      .collect();

    const counts: Record<string, number> = {};
    const countryCounts = new Map<
      string,
      { country?: string; count: number }
    >();
    const uniqueVisitors = new Set<string>();

    for (const view of views) {
      uniqueVisitors.add(view.visitorId);
      const dayKey = new Date(view.createdAt).toISOString().slice(0, 10);
      counts[dayKey] = (counts[dayKey] ?? 0) + 1;
      const key = view.countryCode ?? "unknown";
      const entry = countryCounts.get(key);
      if (entry) {
        entry.count += 1;
      } else {
        countryCounts.set(key, { country: view.country, count: 1 });
      }
    }

    const countries = Array.from(countryCounts.entries())
      .map(([countryCode, data]) => ({
        countryCode: countryCode === "unknown" ? undefined : countryCode,
        country: data.country,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const series = Array.from({ length: windowDays }, (_, i) => {
      const date = new Date(now - (windowDays - 1 - i) * dayMs)
        .toISOString()
        .slice(0, 10);
      return { date, count: counts[date] ?? 0 };
    });

    return {
      totalViews: views.length,
      uniqueVisitors: uniqueVisitors.size,
      series,
      countries,
    };
  },
});
