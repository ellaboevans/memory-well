"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import type { Doc, Id } from "@/convex/_generated/dataModel";

const STICKER_OPTIONS = ["❤️", "🎉", "🙏", "✨", "💐", "🥳", "💝", "🌟"];

const signSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
});

interface SignWallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wall: Doc<"walls">;
  primaryColor: string;
}

export function SignWallDialog({
  open,
  onOpenChange,
  wall,
  primaryColor,
}: SignWallDialogProps) {
  const createEntry = useMutation(api.entries.create);
  const generateUploadUrl = useMutation(api.entries.generateUploadUrl);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const buttonTextColor = useMemo(() => {
    const isLightPrimary =
      Number.parseInt(primaryColor.slice(1), 16) > 0x7fffff;
    return isLightPrimary ? "#000000" : "#ffffff";
  }, [primaryColor]);

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
  }, []);

  const toggleSticker = (sticker: string) => {
    setSelectedStickers((prev) =>
      prev.includes(sticker)
        ? prev.filter((s) => s !== sticker)
        : prev.length < 3
          ? [...prev, sticker]
          : prev,
    );
  };

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setMessage("");
    setSignatureDataUrl(null);
    setSelectedStickers([]);
    setError(null);
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signSchema.safeParse({
      name: name.trim(),
      email: email.trim() || undefined,
    });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let signatureImageId: Id<"_storage"> | undefined;

      if (signatureDataUrl) {
        const uploadUrl = await generateUploadUrl();
        const blob = await dataUrlToBlob(signatureDataUrl);
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload signature");
        }

        const { storageId } = await uploadResponse.json();
        signatureImageId = storageId;
      }

      await createEntry({
        wallId: wall._id,
        name: name.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        signatureImageId,
        stickers: selectedStickers.length > 0 ? selectedStickers : undefined,
      });

      onOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message.includes("RATE_LIMITED") ||
          err.message.includes("Too many entries")
        ) {
          setError("Too many entries from this email. Please wait a minute.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to sign wall");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[100dvh] w-[100vw] max-w-none flex-col overflow-hidden rounded-none border-zinc-800 bg-zinc-950 text-white sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Sign {wall.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Leave your signature and a message for this memory wall.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-5 pb-4">
          {error && (
            <div
              className="bg-red-900/50 border border-red-800 rounded-lg p-4 text-red-200 text-sm"
              role="alert"
              aria-live="polite">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "dialog-name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="dialog-name-error" className="mt-1 text-xs text-red-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Signature
            </label>
            <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900 p-2">
              <SignaturePad onSignatureChange={handleSignatureChange} height={180} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Message <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Email <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "dialog-email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="dialog-email-error" className="mt-1 text-xs text-red-400">
                {fieldErrors.email}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              Used for verification badge only.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Stickers <span className="text-zinc-500">(up to 3)</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STICKER_OPTIONS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => toggleSticker(sticker)}
                  className={`h-12 w-12 rounded-lg border text-2xl transition ${
                    selectedStickers.includes(sticker)
                      ? "border-white bg-zinc-800"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                  aria-pressed={selectedStickers.includes(sticker)}>
                  {sticker}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: primaryColor, color: buttonTextColor }}>
              {isSubmitting ? "Signing..." : "Sign the wall"}
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
