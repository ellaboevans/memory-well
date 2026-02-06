import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type PasswordResetEmailProps = {
  brandName: string;
  username?: string;
  token: string;
  baseUrl?: string;
  supportUrl?: string;
  securityUrl?: string;
};

const shellStyle: React.CSSProperties = {
  backgroundColor: "#f4f2ef",
  margin: 0,
  padding: "32px 16px",
  fontFamily: '"IBM Plex Sans", "Source Sans 3", Helvetica, sans-serif',
  color: "#1f1f1f",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #e8e1d8",
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(23, 20, 16, 0.08)",
};

const headingStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.25,
  color: "#1b1a17",
};

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 14px 0",
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#2a2722",
};

const mutedStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6c655c",
  lineHeight: 1.6,
};

export function PasswordResetEmail({
  brandName,
  username,
  token,
  supportUrl = "https://memorywell.app/support",
  securityUrl = "https://memorywell.app/security",
}: PasswordResetEmailProps) {
  const previewText = `Your ${brandName} reset code is ${token}`;
  const greeting = username ? `Hi ${username},` : "Hi there,";

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .email-body {
              background-color: #0f1112 !important;
              color: #f4efe8 !important;
            }
            .email-shell {
              background-color: #151718 !important;
              border-color: #2a2d2e !important;
              box-shadow: none !important;
            }
            .email-hero {
              background: linear-gradient(135deg,#151718 0%,#1c1f20 55%,#121415 100%) !important;
            }
            .email-text {
              color: #e8e1d7 !important;
            }
            .email-muted {
              color: #b8afa3 !important;
            }
            .email-code {
              background-color: #2a221e !important;
              color: #f3e7dd !important;
              border-color: #7b3f2c !important;
            }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={shellStyle} className="email-body">
        <Container style={containerStyle} className="email-shell">
          <Section
            style={{
              padding: "24px 32px 16px 32px",
              background:
                "linear-gradient(135deg,#ffffff 0%,#f6f1ea 55%,#f0e9df 100%)",
            }}
            className="email-hero">
            <Row>
              <Column>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#7b3f2c",
                  }}>
                  {brandName}
                </Text>
              </Column>
            </Row>
            <Text style={headingStyle} className="email-text">
              Reset your password
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 24px 32px" }}>
            <Text style={paragraphStyle} className="email-text">
              {greeting}
            </Text>
            <Text style={paragraphStyle} className="email-text">
              We received a request to reset your {brandName} password. Use the
              verification code below to finish the reset.
            </Text>
            <Section
              style={{
                display: "inline-block",
                padding: "12px 18px",
                borderRadius: "12px",
                backgroundColor: "#f8efe7",
                border: "1px dashed #7b3f2c",
                fontSize: "22px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                color: "#5a2a1f",
                marginBottom: "16px",
              }}
              className="email-code">
              {token}
            </Section>
            <Text style={mutedStyle} className="email-muted">
              This code expires in 15 minutes.
            </Text>
          </Section>

          <Section style={{ padding: "0 32px 20px 32px" }}>
            <Row>
              <Column className="[border-bottom:1px_solid_rgb(236,230,222)] w-62" />
              <Column className="[border-bottom:1px_solid_rgb(123,63,44)] w-26" />
              <Column className="[border-bottom:1px_solid_rgb(236,230,222)] w-62" />
            </Row>
          </Section>

          <Section style={{ padding: "0 32px 28px 32px" }}>
            <Text style={paragraphStyle} className="email-text">
              If you did not request a reset, you can safely ignore this email.
              For help, contact{" "}
              <a
                href={supportUrl}
                style={{ color: "#7b3f2c", textDecoration: "underline" }}>
                Memory Well Support
              </a>
              .
            </Text>
            <Text style={mutedStyle} className="email-muted">
              Need tips for stronger security?{" "}
              <a
                href={securityUrl}
                style={{ color: "#7b3f2c", textDecoration: "underline" }}>
                Read our password guide
              </a>
              .
            </Text>
          </Section>
        </Container>

        <Section style={{ maxWidth: "600px", margin: "16px auto 0" }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#9a9186",
              lineHeight: 1.6,
            }}
            className="email-muted">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
            <br />
            You’re receiving this email because a password reset was requested.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  brandName: "Memory Well",
  username: "Evans",
  token: "48203915",
  baseUrl: "https://memorywell.app",
  supportUrl: "https://memorywell.app/support",
  securityUrl: "https://memorywell.app/security",
} as PasswordResetEmailProps;

export default PasswordResetEmail;
