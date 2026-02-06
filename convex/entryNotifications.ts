import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { render } from "@react-email/render";
import EntryVerifiedEmail from "../emails/EntryVerifiedEmail";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME || "Memory Well";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const sendEntryVerifiedEmail = internalAction({
  args: {
    email: v.string(),
    entryName: v.optional(v.string()),
    wallTitle: v.string(),
    wallUrl: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const subject = `Your entry was verified on ${args.wallTitle}`;
    const greeting = args.entryName ? `Hi ${args.entryName},` : "Hi there,";

    const text = `${greeting}\n\nYour entry has been verified by the wall owner.\n\nView the wall: ${args.wallUrl}\n\nThanks,\n${FROM_NAME}`;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.NEXT_PUBLIC_APP_DOMAIN
        ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
        : undefined);
    const html = await render(
      EntryVerifiedEmail({
        brandName: FROM_NAME,
        greeting,
        wallTitle: args.wallTitle,
        wallUrl: args.wallUrl,
        baseUrl,
      }),
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [args.email],
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Resend API error (${response.status}): ${errorBody || "Unknown error"}`,
      );
    }

    return null;
  },
});
