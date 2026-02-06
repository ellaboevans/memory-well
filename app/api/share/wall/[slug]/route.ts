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

  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL as string;

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
        background: background,
        color: primary,
        fontFamily: "sans-serif",
      },
    },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "12px" } },
      React.createElement(
        "div",
        {
          style: {
            fontSize: "14px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: 0.7,
          },
        },
        "Memory Well",
      ),
      React.createElement(
        "div",
        { style: { fontSize: "56px", fontWeight: 700, lineHeight: 1.1 } },
        title,
      ),
      React.createElement(
        "div",
        {
          style: {
            fontSize: "24px",
            maxWidth: "800px",
            opacity: 0.7,
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
          opacity: 0.8,
        },
      },
      React.createElement("div", null, `${count} signatures`),
      React.createElement("div", null, SITE_URL),
    ),
  );

  return new ImageResponse(element, { width: 1200, height: 630 });
}
