import React from "react";
import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const resolved = await params;
  if (!resolved?.slug) {
    return new Response("Missing slug", { status: 400 });
  }
  const wall = await fetchQuery(api.walls.getBySlug, { slug: resolved.slug });

  if (!wall) {
    return new Response("Not found", { status: 404 });
  }

  const count = await fetchQuery(api.entries.countByWall, {
    wallId: wall._id,
  });

  const title = wall.title;
  const description =
    wall.description ?? "Sign this memory wall and leave your message.";
  const primary = wall.theme.primaryColor;
  const background = wall.theme.backgroundColor;

  const siteLabel =
    process.env.NEXT_PUBLIC_APP_DOMAIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "memorywell.app";

  const element = React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background: `radial-gradient(1200px 630px at 0% 0%, ${primary}22, transparent 60%), linear-gradient(135deg, ${background}, ${background})`,
        color: primary,
        fontFamily: "sans-serif",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              fontSize: "13px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              opacity: 0.75,
            },
          },
          "Memory Well",
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "6px 12px",
              borderRadius: "999px",
              border: `1px solid ${primary}55`,
              color: primary,
              opacity: 0.85,
            },
          },
          "Shareable Wall",
        ),
      ),
      React.createElement(
        "div",
        {
          style: {
            fontSize: "60px",
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: "980px",
          },
        },
        title,
      ),
      React.createElement(
        "div",
        {
          style: {
            fontSize: "24px",
            maxWidth: "860px",
            opacity: 0.75,
            lineHeight: 1.4,
          },
        },
        description,
      ),
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "20px",
          opacity: 0.85,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              padding: "8px 14px",
              borderRadius: "12px",
              background: `${primary}22`,
              border: `1px solid ${primary}55`,
            },
          },
          `${count} signatures`,
        ),
        React.createElement(
          "div",
          {
            style: { fontSize: "16px", opacity: 0.7 },
          },
          "Signatures from around the world",
        ),
      ),
      React.createElement("div", null, siteLabel),
    ),
  );

  return new ImageResponse(element, { width: 1200, height: 630 });
}
