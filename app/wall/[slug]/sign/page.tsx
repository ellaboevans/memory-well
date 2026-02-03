"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SignaturePad } from "@/components/signature-pad";
import { Id } from "@/convex/_generated/dataModel";

const STICKER_OPTIONS = ["❤️", "🎉", "🙏", "✨", "💐", "🥳", "💝", "🌟"];

export default function SignWallPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const wall = useQuery(api.walls.getBySlug, { slug });
  const createEntry = useMutation(api.entries.create);
  const generateUploadUrl = useMutation(api.entries.generateUploadUrl);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Convert data URL to blob
  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wall) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let signatureImageId: Id<"_storage"> | undefined;

      // Upload signature if exists
      if (signatureDataUrl) {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Convert data URL to blob and upload
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

      // Redirect back to wall
      router.push(`/wall/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign wall");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (wall === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Wall not found
  if (wall === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Wall Not Found</h1>
          <p className="text-zinc-400 mb-6">
            This memory wall doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors">
            Go to Memory Well
          </Link>
        </div>
      </div>
    );
  }

  // Wall not accepting entries
  if (!wall.acceptingEntries) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Wall Closed</h1>
          <p className="text-zinc-400 mb-6">
            This memory wall is no longer accepting new signatures.
          </p>
          <Link
            href={`/wall/${slug}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors">
            View Wall
          </Link>
        </div>
      </div>
    );
  }

  // Theme from wall
  const { primaryColor, backgroundColor, fontFamily } = wall.theme;
  const isLightPrimary = Number.parseInt(primaryColor.slice(1), 16) > 0x7fffff;
  const buttonTextColor = isLightPrimary ? "#000000" : "#ffffff";
  const borderColor = `${primaryColor}30`;

  return (
    <div className="min-h-screen" style={{ backgroundColor, fontFamily }}>
      {/* Header */}
      <header style={{ borderBottomColor: borderColor, borderBottomWidth: 1 }}>
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
          <Link
            href={`/wall/${slug}`}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: primaryColor }}>
            ← Back to {wall.title}
          </Link>
          <h1
            className="mt-4 text-2xl font-bold"
            style={{ color: primaryColor }}>
            Sign the Wall ✍️
          </h1>
          <p className="mt-1 opacity-60" style={{ color: primaryColor }}>
            Leave your signature for {wall.title}
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium"
              style={{ color: primaryColor, opacity: 0.9 }}>
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="John Doe"
            />
          </div>

          {/* Signature Pad */}
          <div>
            <label
              htmlFor="signature"
              className="block text-sm font-medium text-zinc-300 mb-2">
              Your Signature
            </label>
            <SignaturePad
              onSignatureChange={handleSignatureChange}
              height={200}
            />
            <p className="mt-2 text-xs text-zinc-500">
              Use your mouse or finger to draw your signature
            </p>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-zinc-300">
              Your Message <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white resize-none"
              placeholder="Write your heartfelt message here..."
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-300">
              Email <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="john@example.com"
            />
            <p className="mt-1 text-xs text-zinc-500">
              For verification badge. Won&apos;t be displayed publicly.
            </p>
          </div>

          {/* Stickers */}
          <div>
            <label
              htmlFor="stickers"
              className="block text-sm font-medium text-zinc-300 mb-2">
              Add Stickers <span className="text-zinc-500">(up to 3)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STICKER_OPTIONS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => toggleSticker(sticker)}
                  className={`w-12 h-12 text-2xl rounded-lg border transition-all ${
                    selectedStickers.includes(sticker)
                      ? "border-white bg-zinc-800 scale-110"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}>
                  {sticker}
                </button>
              ))}
            </div>
            {selectedStickers.length > 0 && (
              <p className="mt-2 text-sm text-zinc-500">
                Selected: {selectedStickers.join(" ")}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor, color: buttonTextColor }}>
              {isSubmitting ? "Signing..." : "Sign the Wall"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
