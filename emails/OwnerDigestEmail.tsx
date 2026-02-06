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

type DigestSummary = {
  title: string;
  entryCount: number;
  url: string;
};

type OwnerDigestEmailProps = {
  brandName: string;
  greeting: string;
  periodLabel: string;
  dateRangeLabel: string;
  totalEntries: number;
  summaries: DigestSummary[];
  dashboardUrl: string;
  baseUrl?: string;
};

const shellStyle: React.CSSProperties = {
  backgroundColor: "#f6f4f0",
  margin: 0,
  padding: "32px 16px",
  fontFamily: '"IBM Plex Sans", "Source Sans 3", Helvetica, sans-serif',
  color: "#1c1c1c",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "620px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #e8e1d8",
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(28, 24, 20, 0.08)",
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

export function OwnerDigestEmail({
  brandName,
  greeting,
  periodLabel,
  dateRangeLabel,
  totalEntries,
  summaries,
  dashboardUrl,
}: OwnerDigestEmailProps) {
  const previewText = `${totalEntries} new entries ${dateRangeLabel}`;

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
              background: linear-gradient(135deg,#151718 0%,#1d2021 55%,#121415 100%) !important;
            }
            .email-text {
              color: #e8e1d7 !important;
            }
            .email-muted {
              color: #b8afa3 !important;
            }
            .email-card {
              background-color: #1c1f20 !important;
              border-color: #2b2f31 !important;
              color: #e8e1d7 !important;
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
                    color: "#3a5c63",
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
                color: "#1b1a17",
              }}
              className="email-text">
              {periodLabel} digest
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 20px 32px" }}>
            <Text style={paragraphStyle} className="email-text">
              {greeting}
            </Text>
            <Text style={paragraphStyle} className="email-text">
              Here’s your digest {dateRangeLabel}. You’ve received{" "}
              <strong>{totalEntries}</strong> new entries across your walls.
            </Text>
            <Section
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: "#f7f2ea",
                border: "1px solid #e8e1d8",
              }}
              className="email-card">
              {summaries.length > 0 ? (
                summaries.map((summary, index) => (
                  <Section
                    key={summary.url}
                    style={{
                      padding: "10px 0",
                      borderBottom:
                        index === summaries.length - 1
                          ? "none"
                          : "1px solid #e6ded4",
                    }}>
                    <Text
                      style={{
                        margin: "0 0 4px 0",
                        fontWeight: 600,
                        color: "#2a2722",
                      }}
                      className="email-text">
                      {summary.title}
                    </Text>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#6c655c",
                      }}
                      className="email-muted">
                      {summary.entryCount} new{" "}
                      {summary.entryCount === 1 ? "entry" : "entries"} •{" "}
                      <a
                        href={summary.url}
                        style={{
                          color: "#3a5c63",
                          textDecoration: "underline",
                        }}>
                        View wall
                      </a>
                    </Text>
                  </Section>
                ))
              ) : (
                <Text style={mutedStyle} className="email-muted">
                  No new entries this period.
                </Text>
              )}
            </Section>
          </Section>

          <Section style={{ padding: "0 32px 28px 32px" }}>
            <Button
              href={dashboardUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#3a5c63",
                color: "#ffffff",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "14px",
              }}>
              Open dashboard
            </Button>
            <Text style={mutedStyle} className="email-muted">
              You can change digest preferences anytime in your dashboard.
            </Text>
          </Section>
        </Container>

        <Section style={{ maxWidth: "620px", margin: "16px auto 0" }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#9a9186",
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

OwnerDigestEmail.PreviewProps = {
  brandName: "Memory Well",
  greeting: "Hi Evans,",
  periodLabel: "Weekly",
  dateRangeLabel: "from Jan 1 to Jan 7",
  totalEntries: 12,
  summaries: [
    {
      title: "Ada & Grace",
      entryCount: 5,
      url: "https://memorywell.app/dashboard/walls/ada-grace",
    },
    {
      title: "Lena’s Graduation",
      entryCount: 7,
      url: "https://memorywell.app/dashboard/walls/lena-grad",
    },
  ],
  dashboardUrl: "https://memorywell.app/dashboard",
  baseUrl: "https://memorywell.app",
} as OwnerDigestEmailProps;

export default OwnerDigestEmail;
