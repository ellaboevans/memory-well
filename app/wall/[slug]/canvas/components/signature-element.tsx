"use client";

import Image from "next/image";
import { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ELEMENT_HEIGHT, ELEMENT_WIDTH } from "../lib/signature-layout";

interface SignatureElementProps {
  signature: Doc<"entries">;
  x: number;
  y: number;
  revealDelayMs: number;
  onOpenSignature: (signature: Doc<"entries">) => void;
  wasDragging: () => boolean;
}

export const SignatureElement = memo(function SignatureElement({
  signature,
  x,
  y,
  revealDelayMs,
  onOpenSignature,
  wasDragging,
}: SignatureElementProps) {
  const handleClick = () => {
    if (wasDragging()) return;
    onOpenSignature(signature);
  };

  const signatureUrl = useQuery(
    api.entries.getSignatureUrl,
    signature.signatureImageId
      ? { storageId: signature.signatureImageId as Id<"_storage"> }
      : "skip",
  );

  return (
    <div
      className="signature-element absolute left-0 top-0"
      style={{
        width: `${ELEMENT_WIDTH}px`,
        height: `${ELEMENT_HEIGHT}px`,
        transform: `translate3d(${x}px, ${y}px, 0px)`,
        animationDelay: `${Math.max(0, revealDelayMs)}ms`,
        contain: "layout style paint",
      }}>
      <div className="relative h-full w-full pointer-events-none">
        {signatureUrl ? (
          <Image
            src={signatureUrl}
            alt={`Signature by ${signature.name}`}
            fill
            className="object-contain opacity-80"
            unoptimized
          />
        ) : (
          <div className="h-full w-full rounded bg-zinc-900/40" />
        )}
      </div>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-element="true"
              aria-label={`Open signature by ${signature.name}`}
              onClick={handleClick}
              className="signature-hit"
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            By: {signature.name || "Anonymous"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});
