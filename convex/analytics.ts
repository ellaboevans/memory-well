import { query } from "./_generated/server";
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
