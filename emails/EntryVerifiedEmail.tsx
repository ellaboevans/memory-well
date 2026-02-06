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
  Button,
} from "@react-email/components";
import * as React from "react";

type EntryVerifiedEmailProps = {
  brandName: string;
  greeting: string;
  wallTitle: string;
  wallUrl: string;
  baseUrl?: string;
};

const shellStyle: React.CSSProperties = {
  backgroundColor: "#f3f5f9",
  margin: 0,
  padding: "32px 16px",
  fontFamily: '"IBM Plex Sans", "Source Sans 3", Helvetica, sans-serif',
  color: "#1b1f2a",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #e1e5ee",
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(18, 28, 45, 0.08)",
};

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 14px 0",
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#2a3342",
};

const mutedStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6c778b",
  lineHeight: 1.6,
};

export function EntryVerifiedEmail({
  brandName,
  greeting,
  wallTitle,
  wallUrl,
}: EntryVerifiedEmailProps) {
  const previewText = `Your entry is verified on ${wallTitle}`;

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .email-body {
              background-color: #0f131a !important;
              color: #eef1f7 !important;
            }
            .email-shell {
              background-color: #141923 !important;
              border-color: #2a2f3b !important;
              box-shadow: none !important;
            }
            .email-hero {
              background: linear-gradient(135deg,#141923 0%,#1a2230 55%,#10151e 100%) !important;
            }
            .email-text {
              color: #e8edf7 !important;
            }
            .email-muted {
              color: #a6b0c5 !important;
            }
            .email-card {
              background-color: #1b2230 !important;
              border-color: #2b3342 !important;
              color: #e9eef8 !important;
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
                "linear-gradient(135deg,#ffffff 0%,#f1f4f8 55%,#e9eef6 100%)",
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
                    color: "#1f4c7a",
                  }}>
                  {brandName}
                </Text>
              </Column>
            </Row>
            <Text
              style={{
                margin: "12px 0 0",
                fontSize: "22px",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#1b1f2a",
              }}
              className="email-text">
              Your entry is verified
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 24px 32px" }}>
            <Text style={paragraphStyle} className="email-text">
              {greeting}
            </Text>
            <Text style={paragraphStyle} className="email-text">
              The wall owner has verified your entry. It’s now visible to
              visitors.
            </Text>
            <Section
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#f3f6fb",
                border: "1px solid #d9e1f1",
                marginBottom: "16px",
              }}
              className="email-card">
              <Text style={{ margin: 0, fontSize: "13px" }}>
                Wall: <strong>{wallTitle}</strong>
              </Text>
            </Section>
            <Button
              href={wallUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#1f4c7a",
                color: "#ffffff",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "14px",
              }}>
              View the wall
            </Button>
          </Section>

          <Section style={{ padding: "0 32px 28px 32px" }}>
            <Text style={mutedStyle} className="email-muted">
              If you didn’t expect this email, you can ignore it.
            </Text>
          </Section>
        </Container>
        <Section style={{ maxWidth: "600px", margin: "16px auto 0" }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#9aa6bb",
              lineHeight: 1.6,
            }}
            className="email-muted">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

EntryVerifiedEmail.PreviewProps = {
  brandName: "Memory Well",
  greeting: "Hi Evans,",
  wallTitle: "Ada & Grace",
  wallUrl: "https://memorywell.app/wall/ada-grace",
  baseUrl: "https://memorywell.app",
} as EntryVerifiedEmailProps;

export default EntryVerifiedEmail;
