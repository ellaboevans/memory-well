import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const verificationStatusValidator = v.object({
  email: v.optional(v.string()),
  emailVerified: v.boolean(),
});

export const meVerificationStatus = query({
  args: {},
  returns: v.union(verificationStatusValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      email: user.email,
      emailVerified: user.emailVerificationTime !== undefined,
    };
  },
});
