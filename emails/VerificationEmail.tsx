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

type VerificationEmailProps = {
  brandName: string;
  username?: string;
  token: string;
  baseUrl?: string;
  supportUrl?: string;
};

const shellStyle: React.CSSProperties = {
  backgroundColor: "#f2f6f4",
  margin: 0,
  padding: "32px 16px",
  fontFamily: '"IBM Plex Sans", "Source Sans 3", Helvetica, sans-serif',
  color: "#1c1f1d",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #dfe7e2",
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(20, 28, 23, 0.08)",
};

const headingStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.25,
  color: "#16211c",
};

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 14px 0",
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#24312a",
};

const mutedStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#667168",
  lineHeight: 1.6,
};

export function VerificationEmail({
  brandName,
  username,
  token,
  supportUrl = "https://memorywell.app/support",
}: VerificationEmailProps) {
  const previewText = `Your ${brandName} verification code is ${token}`;
  const greeting = username ? `Hi ${username},` : "Hi there,";

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .email-body {
              background-color: #0f1411 !important;
              color: #eef3ef !important;
            }
            .email-shell {
              background-color: #151b18 !important;
              border-color: #2a332f !important;
              box-shadow: none !important;
            }
            .email-hero {
              background: linear-gradient(135deg,#151b18 0%,#1b2420 55%,#121715 100%) !important;
            }
            .email-text {
              color: #e6efe9 !important;
            }
            .email-muted {
              color: #a9b3ac !important;
            }
            .email-code {
              background-color: #1d2621 !important;
              color: #e7f4ec !important;
              border-color: #2f6b55 !important;
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
                "linear-gradient(135deg,#ffffff 0%,#eef6f1 55%,#e7f1eb 100%)",
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
                    color: "#2f6b55",
                  }}>
                  {brandName}
                </Text>
              </Column>
            </Row>
            <Text style={headingStyle} className="email-text">
              Verify your account
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 24px 32px" }}>
            <Text style={paragraphStyle} className="email-text">
              {greeting}
            </Text>
            <Text style={paragraphStyle} className="email-text">
              Use the verification code below to confirm your email address and
              activate your {brandName} account.
            </Text>
            <Section
              style={{
                display: "inline-block",
                padding: "12px 18px",
                borderRadius: "12px",
                backgroundColor: "#eef7f1",
                border: "1px dashed #2f6b55",
                fontSize: "22px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                color: "#255946",
                marginBottom: "16px",
              }}
              className="email-code">
              {token}
            </Section>
            <Text style={mutedStyle} className="email-muted">
              This code expires in 15 minutes.
            </Text>
          </Section>

          <Section style={{ padding: "0 32px 28px 32px" }}>
            <Text style={paragraphStyle} className="email-text">
              Didn’t request this? You can ignore this email or contact{" "}
              <a
                href={supportUrl}
                style={{ color: "#2f6b55", textDecoration: "underline" }}>
                Memory Well Support
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
              color: "#9aa49c",
              lineHeight: 1.6,
            }}
            className="email-muted">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
            <br />
            You’re receiving this email because someone requested access.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

VerificationEmail.PreviewProps = {
  brandName: "Memory Well",
  username: "Evans",
  token: "92748361",
  baseUrl: "https://memorywell.app",
  supportUrl: "https://memorywell.app/support",
} as VerificationEmailProps;

export default VerificationEmail;
