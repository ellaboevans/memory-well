import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { components, internal } from "./_generated/api";
import { Crons } from "@convex-dev/crons";
import { v } from "convex/values";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME || "Memory Well";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const crons = new Crons(components.crons);

const getBaseUrl = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_DOMAIN;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }
  return baseUrl.replace(/\/$/, "");
};

const wallSummaryValidator = v.object({
  wallId: v.id("walls"),
  title: v.string(),
  slug: v.string(),
  entryCount: v.number(),
});

export const getOwnerDigestData = internalQuery({
  args: {
    ownerId: v.id("users"),
    since: v.number(),
  },
  returns: v.union(
    v.object({
      ownerId: v.id("users"),
      ownerEmail: v.string(),
      ownerName: v.optional(v.string()),
      totalEntries: v.number(),
      wallSummaries: v.array(wallSummaryValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const owner = await ctx.db.get("users", args.ownerId);
    if (!owner?.email) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.ownerId))
      .unique();

    const walls = await ctx.db
      .query("walls")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    if (walls.length === 0) {
      return {
        ownerId: args.ownerId,
        ownerEmail: owner.email,
        ownerName: profile?.name,
        totalEntries: 0,
        wallSummaries: [],
      };
    }

    const wallSummaries = [];
    let totalEntries = 0;

    for (const wall of walls) {
      const entries = await ctx.db
        .query("entries")
        .withIndex("by_wall_created", (q) =>
          q.eq("wallId", wall._id).gte("createdAt", args.since),
        )
        .collect();

      if (entries.length > 0) {
        wallSummaries.push({
          wallId: wall._id,
          title: wall.title,
          slug: wall.slug,
          entryCount: entries.length,
        });
        totalEntries += entries.length;
      }
    }

    return {
      ownerId: args.ownerId,
      ownerEmail: owner.email,
      ownerName: profile?.name,
      totalEntries,
      wallSummaries,
    };
  },
});

export const listOwnerIdsWithWalls = internalQuery({
  args: {},
  returns: v.array(v.id("users")),
  handler: async (ctx) => {
    const walls = await ctx.db.query("walls").collect();
    const ownerIds = Array.from(new Set(walls.map((wall) => wall.ownerId)));
    return ownerIds;
  },
});

export const sendOwnerDigestEmails = internalAction({
  args: {
    period: v.union(v.literal("weekly"), v.literal("monthly")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const now = Date.now();
    const periodDays = args.period === "weekly" ? 7 : 30;
    const since = now - periodDays * 24 * 60 * 60 * 1000;

    const baseUrl = getBaseUrl();
    const ownerIds = await ctx.runQuery(
      internal.ownerDigests.listOwnerIdsWithWalls,
      {},
    );

    for (const ownerId of ownerIds) {
      const digest = await ctx.runQuery(
        internal.ownerDigests.getOwnerDigestData,
        {
          ownerId,
          since,
        },
      );

      if (!digest || digest.totalEntries === 0) {
        continue;
      }

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const startDate = dateFormatter.format(new Date(since));
      const endDate = dateFormatter.format(new Date(now));

      const greeting = digest.ownerName
        ? `Hi ${digest.ownerName},`
        : "Hi there,";

      const summaries = digest.wallSummaries
        .slice(0, 10)
        .map((wall) => {
          const entryLabel = wall.entryCount === 1 ? "entry" : "entries";
          return `- ${wall.title}: ${wall.entryCount} new ${entryLabel} (${baseUrl}/dashboard/walls/${wall.wallId})`;
        })
        .join("\n");

      const subject = `Your ${args.period} Memory Well digest`;

      const text = `${greeting}\n\nHere’s your ${args.period} digest from ${startDate} to ${endDate}.\n\nTotal new entries: ${digest.totalEntries}\n\n${summaries}\n\nView your dashboard: ${baseUrl}/dashboard\n\nThanks,\n${FROM_NAME}`;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [digest.ownerEmail],
          subject,
          text,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Resend API error (${response.status}): ${errorBody || "Unknown error"}`,
        );
      }
    }

    return null;
  },
});

const OWNER_DIGEST_CRONS = [
  {
    name: "owner-digest-weekly",
    schedule: { kind: "cron", cronspec: "0 12 * * 1" },
    period: "weekly",
  },
  {
    name: "owner-digest-monthly",
    schedule: { kind: "cron", cronspec: "0 12 1 * *" },
    period: "monthly",
  },
] as const;

export const registerOwnerDigestCrons = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const cronJob of OWNER_DIGEST_CRONS) {
      const existing = await crons.get(ctx, { name: cronJob.name });
      if (existing) {
        continue;
      }

      await crons.register(
        ctx,
        cronJob.schedule,
        internal.ownerDigests.sendOwnerDigestEmails,
        { period: cronJob.period },
        cronJob.name,
      );
    }

    return null;
  },
});

// Public action for manual setup via `npx convex run`.
export const setupOwnerDigestCrons = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.runMutation(internal.ownerDigests.registerOwnerDigestCrons, {});
    return null;
  },
});

// Public action for manual testing via `npx convex run`.
export const sendOwnerDigestTest = action({
  args: {
    period: v.union(v.literal("weekly"), v.literal("monthly")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runAction(internal.ownerDigests.sendOwnerDigestEmails, {
      period: args.period,
    });
    return null;
  },
});
