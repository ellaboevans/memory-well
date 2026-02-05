import { action, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getEmailByUserId = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.email ?? null;
  },
});

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
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

    if (args.newPassword.length < 8) {
      throw new ConvexError({
        code: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters",
      });
    }

    const email = await ctx.runQuery(internal.account.getEmailByUserId, {
      userId,
    });
    if (!email) {
      throw new ConvexError({
        code: "NO_EMAIL",
        message: "Email not found for account",
      });
    }

    await retrieveAccount(ctx, {
      provider: "password",
      account: { id: email, secret: args.currentPassword },
    });

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: email, secret: args.newPassword },
    });

    const sessionId = await getAuthSessionId(ctx);
    if (sessionId) {
      await invalidateSessions(ctx, { userId, except: [sessionId] });
    }

    return null;
  },
});
