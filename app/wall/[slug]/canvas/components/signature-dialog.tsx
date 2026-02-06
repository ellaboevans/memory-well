"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { forwardRef, useImperativeHandle, useState } from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SignatureDialogProps {
  signature: Doc<"entries"> | null;
  onClose: () => void;
  primaryColor: string;
  backgroundColor: string;
}

export interface SignatureDialogHandle {
  open: (signature: Doc<"entries">) => void;
  close: () => void;
}

export const SignatureDialogController = forwardRef<
  SignatureDialogHandle,
  {
    primaryColor: string;
    backgroundColor: string;
  }
>(function SignatureDialogController(props, ref) {
  const [signature, setSignature] = useState<Doc<"entries"> | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (nextSignature) => {
        setSignature(nextSignature);
      },
      close: () => {
        setSignature(null);
      },
    }),
    [],
  );

  return (
    <SignatureDialog
      signature={signature}
      onClose={() => setSignature(null)}
      primaryColor={props.primaryColor}
      backgroundColor={props.backgroundColor}
    />
  );
});

export function SignatureDialog({
  signature,
  onClose,
  primaryColor,
  backgroundColor,
}: SignatureDialogProps) {
  const signatureUrl = useQuery(
    api.entries.getSignatureUrl,
    signature?.signatureImageId
      ? { storageId: signature.signatureImageId as Id<"_storage"> }
      : "skip",
  );

  if (!signature) return null;

  const formattedDate = format(new Date(signature.createdAt), "PPP");

  const themeVars = (() => {
    const toRgb = (hex: string) => {
      const value = hex.replace("#", "");
      const r = Number.parseInt(value.slice(0, 2), 16);
      const g = Number.parseInt(value.slice(2, 4), 16);
      const b = Number.parseInt(value.slice(4, 6), 16);
      return { r, g, b };
    };

    const mix = (base: string, mixin: string, weight: number) => {
      const a = toRgb(base);
      const b = toRgb(mixin);
      const w = Math.min(Math.max(weight, 0), 1);
      const r = Math.round(a.r * (1 - w) + b.r * w);
      const g = Math.round(a.g * (1 - w) + b.g * w);
      const bCh = Math.round(a.b * (1 - w) + b.b * w);
      return `rgb(${r} ${g} ${bCh})`;
    };

    const luminance = (hex: string) => {
      const { r, g, b } = toRgb(hex);
      const [rs, gs, bs] = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const isLightBg = luminance(backgroundColor) > 0.55;
    const panelBg = backgroundColor;
    const panelBorder = isLightBg
      ? mix(backgroundColor, "#000000", 0.2)
      : mix(backgroundColor, "#ffffff", 0.2);
    const panelMuted = isLightBg
      ? "rgba(15, 23, 42, 0.65)"
      : "rgba(226, 232, 240, 0.65)";
    const panelText = isLightBg ? "#0f172a" : "#f8fafc";
    const inputBg = isLightBg
      ? mix(backgroundColor, "#ffffff", 0.9)
      : mix(backgroundColor, "#ffffff", 0.08);
    const inputBorder = isLightBg
      ? mix(backgroundColor, "#000000", 0.18)
      : mix(backgroundColor, "#ffffff", 0.18);
    const overlay = isLightBg
      ? "rgba(15, 23, 42, 0.35)"
      : "rgba(2, 6, 23, 0.6)";

    return {
      "--dialog-bg": panelBg,
      "--dialog-border": panelBorder,
      "--dialog-text": panelText,
      "--dialog-muted": panelMuted,
      "--dialog-input-bg": inputBg,
      "--dialog-input-border": inputBorder,
      "--dialog-overlay": overlay,
      backgroundColor: panelBg,
      borderColor: panelBorder,
      color: panelText,
      "--dialog-accent": primaryColor,
    } as React.CSSProperties;
  })();

  return (
    <Dialog open={!!signature} onOpenChange={onClose}>
      <DialogContent
        className="border-(--dialog-border) bg-(--dialog-bg) text-(--dialog-text) sm:max-w-lg"
        overlayClassName="!bg-[var(--dialog-overlay)]"
        overlayStyle={{
          backgroundColor: (themeVars as Record<string, string>)[
            "--dialog-overlay"
          ],
        }}
        style={themeVars}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {signature.name}
            {signature.isVerified && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor:
                    "color-mix(in oklab, var(--dialog-accent) 22%, transparent)",
                  color: "color-mix(in oklab, var(--dialog-accent) 90%, white)",
                }}
                aria-label="Verified">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-(--dialog-input-border) bg-(--dialog-input-bg)">
            {signatureUrl ? (
              <Image
                src={signatureUrl}
                alt={`Signature by ${signature.name}`}
                fill
                className="object-contain p-4"
                unoptimized
              />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>

          {signature.message && (
            <p className="text-sm whitespace-pre-wrap text-(--dialog-muted)">
              {signature.message}
            </p>
          )}

          {signature.stickers && signature.stickers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {signature.stickers.map((sticker) => (
                <span key={sticker} className="text-lg">
                  {sticker}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-(--dialog-muted)">
            <span>Signed {formattedDate}</span>
            {signature.email && <span>{signature.email}</span>}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              style={{ backgroundColor: primaryColor, color: "#0b0b0b" }}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
