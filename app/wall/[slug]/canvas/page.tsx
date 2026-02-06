"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { computeSignatureLayout } from "./lib/signature-layout";
import { WallCanvas } from "./components/wall-canvas";
import "./canvas.css";

export default function WallCanvasPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const wall = useQuery(api.walls.getBySlug, { slug });
  const entries = useQuery(
    api.entries.listByWall,
    wall ? { wallId: wall._id, limit: 500 } : "skip",
  );
  const trackWallView = useMutation(api.analytics.trackWallView);

  const layout = useMemo(() => {
    if (!entries) return null;
    const mapped = entries.map((entry) => ({
      id: String(entry._id),
      signature: entry,
    }));
    return computeSignatureLayout<Doc<"entries">>(mapped);
  }, [entries]);

  useEffect(() => {
    if (!wall) return;
    let cancelled = false;
    const track = async () => {
      try {
        const visitorKey = "mw_visitor_id";
        let visitorId = localStorage.getItem(visitorKey);
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem(visitorKey, visitorId);
        }
        const geo = await fetch("/api/geo").then((res) => res.json());
        if (cancelled) return;
        await trackWallView({
          wallId: wall._id,
          visitorId,
          countryCode: geo.countryCode,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        });
      } catch {
        // noop
      }
    };
    track();
    return () => {
      cancelled = true;
    };
  }, [trackWallView, wall]);


  if (wall === undefined || entries === undefined) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 text-zinc-400">
        Loading wall canvas...
      </div>
    );
  }

  if (!wall) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 text-zinc-400">
        Wall not found.
      </div>
    );
  }

  const { primaryColor, backgroundColor } = wall.theme;

  return (
    <div className="wall-canvas-root" style={{ backgroundColor }}>
      {layout && (
        <WallCanvas
          positions={layout.positions}
          revealOrder={layout.revealOrder}
          wallTitle={wall.title}
          wallSlug={wall.slug}
          totalCount={entries?.length ?? 0}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
        />
      )}
    </div>
  );
}
