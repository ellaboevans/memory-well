import type { EmailConfig } from "@convex-dev/auth/server";

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

export const ResendOTP: Partial<EmailConfig> = {
  id: "resend-otp-verify",
  type: "email",
  name: "Resend OTP Verify",
  from: `${FROM_NAME} <${FROM_EMAIL}>`,
  maxAge: 15 * 60,
  async generateVerificationToken() {
    return generateOtp();
  },
  async sendVerificationRequest({ identifier, token }) {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const subject = `Your ${FROM_NAME} verification code`;

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
        text: `Your verification code is ${token}.`,
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
