import type { EmailConfig } from "@convex-dev/auth/server";
import { render } from "@react-email/render";
import PasswordResetEmail from "../emails/PasswordResetEmail";
import { internal } from "./_generated/api";

const OTP_LENGTH = 8;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME || "Memory Well";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const OTP_ALPHABET = "0123456789";
const generateOtp = (): string => {
  const bytes = new Uint8Array(OTP_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(
    bytes,
    (byte) => OTP_ALPHABET[byte % OTP_ALPHABET.length],
  ).join("");
};

export const ResendOTPPasswordReset: Partial<EmailConfig> = {
  id: "resend-otp-reset",
  type: "email",
  name: "Resend OTP Reset",
  from: `${FROM_NAME} <${FROM_EMAIL}>`,
  maxAge: 15 * 60,
  async generateVerificationToken() {
    return generateOtp();
  },
  async sendVerificationRequest(
    params: { identifier: string; token: string },
    ctx?: { runQuery: (query: unknown, args: unknown) => Promise<unknown> },
  ) {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const { identifier, token } = params;
    const subject = `Reset your ${FROM_NAME} password`;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.NEXT_PUBLIC_APP_DOMAIN
        ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
        : undefined);
    const username = ctx
      ? await ctx.runQuery(internal.account.getProfileNameByEmail, {
          email: identifier,
        })
      : null;
    const safeUsername =
      typeof username === "string" && username.trim().length > 0
        ? username
        : undefined;
    const html = await render(
      PasswordResetEmail({
        brandName: FROM_NAME,
        token,
        username: safeUsername,
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
        to: [identifier],
        subject,
        text: `Your password reset code is ${token}.`,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Resend API error (${response.status}): ${errorBody || "Unknown error"}`,
      );
    }
  },
};
