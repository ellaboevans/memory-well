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
}

export interface SignatureDialogHandle {
  open: (signature: Doc<"entries">) => void;
  close: () => void;
}

export const SignatureDialogController = forwardRef<SignatureDialogHandle>(
  function SignatureDialogController(_props, ref) {
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
      <SignatureDialog signature={signature} onClose={() => setSignature(null)} />
    );
  },
);

export function SignatureDialog({ signature, onClose }: SignatureDialogProps) {
  const signatureUrl = useQuery(
    api.entries.getSignatureUrl,
    signature?.signatureImageId
      ? { storageId: signature.signatureImageId as Id<"_storage"> }
      : "skip",
  );

  if (!signature) return null;

  const formattedDate = format(new Date(signature.createdAt), "PPP");

  return (
    <Dialog open={!!signature} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {signature.name}
            {signature.isVerified && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200"
                aria-label="Verified">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
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
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">
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

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Signed {formattedDate}</span>
            {signature.email && <span>{signature.email}</span>}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
