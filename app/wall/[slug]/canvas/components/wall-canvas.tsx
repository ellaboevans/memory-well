"use client";

import { useCallback, useMemo, useRef } from "react";
import { useCanvasViewport } from "../hooks/use-canvas-viewport";
import { useViewportCulling } from "../hooks/use-viewport-culling";
import type { SignaturePosition } from "../lib/signature-layout";
import { ELEMENT_HEIGHT, ELEMENT_WIDTH } from "../lib/signature-layout";
import { SignatureElement } from "./signature-element";
import {
  SignatureDialogController,
  type SignatureDialogHandle,
} from "./signature-dialog";
import { CanvasControls } from "./canvas-controls";
import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";

interface WallCanvasProps {
  positions: SignaturePosition<Doc<"entries">>[];
  revealOrder: string[];
  wallTitle: string;
  wallSlug: string;
  totalCount: number;
  primaryColor: string;
  backgroundColor: string;
}

const BASE_DELAY_MS = 0;
const STAGGER_MS = 30;
const RING_SIZE = 5;

export function WallCanvas({
  positions,
  revealOrder,
  wallTitle,
  wallSlug,
  totalCount,
  primaryColor,
  backgroundColor,
}: WallCanvasProps) {
  const dialogRef = useRef<SignatureDialogHandle | null>(null);

  const {
    canvas: { ref, pan, onPointerDown, onPointerMove, wasDragging },
    zoom: { scale, percent, zoomIn, zoomOut, zoomToFit, zoomTo100 },
  } = useCanvasViewport({ initialScale: 0.85 });

  const visiblePositions = useViewportCulling({
    positions,
    pan,
    scale,
    elementWidth: ELEMENT_WIDTH,
    elementHeight: ELEMENT_HEIGHT,
    buffer: 500,
  });

  const revealIndexById = useMemo(() => {
    const map = new Map<string, number>();
    revealOrder.forEach((id, index) => {
      map.set(id, index);
    });
    return map;
  }, [revealOrder]);

  const handleOpenSignature = useCallback(
    (signature: Doc<"entries">) => {
      dialogRef.current?.open(signature);
    },
    [dialogRef],
  );

  return (
    <>
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(circle at top, ${primaryColor}20, transparent 55%)`,
          }}
        />
      </div>

      <div className="fixed left-6 top-6 z-40 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/85 p-4 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Memory Wall
        </p>
        <h1 className="mt-2 text-xl font-semibold text-white">{wallTitle}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {totalCount} signature{totalCount === 1 ? "" : "s"}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/wall/${wallSlug}/sign`}
            className="pointer-events-auto inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-medium text-black">
            Sign this wall
          </Link>
          <Link
            href={`/wall/${wallSlug}`}
            className="pointer-events-auto inline-flex items-center justify-center rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200">
            Back to wall
          </Link>
        </div>
      </div>

      <div
        ref={ref}
        className="absolute inset-0 touch-none select-none will-change-transform"
        style={{ transformOrigin: "0 0", backgroundColor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}>
        <div
          className="relative h-screen w-screen will-change-transform"
          style={{
            transformOrigin: "0 0",
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            contain: "layout style",
          }}>
          {visiblePositions.map((pos) => {
            const revealIndex = revealIndexById.get(pos.id) ?? 0;
            const ringIndex = Math.floor(revealIndex / RING_SIZE) % 10;
            const revealDelayMs = BASE_DELAY_MS + ringIndex * STAGGER_MS;

            return (
              <SignatureElement
                key={pos.id}
                signature={pos.signature}
                x={pos.x}
                y={pos.y}
                revealDelayMs={revealDelayMs}
                onOpenSignature={handleOpenSignature}
                wasDragging={wasDragging}
              />
            );
          })}
        </div>
      </div>

      <CanvasControls
        zoomPercent={percent}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomToFit={zoomToFit}
        onZoomTo100={zoomTo100}
      />

      <SignatureDialogController ref={dialogRef} />
    </>
  );
}
