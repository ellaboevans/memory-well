"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getWallDisplayUrl, getWallUrl } from "@/lib/config";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";

export default function WallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const wallId = params.wallId as Id<"walls">;

  const wall = useQuery(api.walls.get, { wallId });
  const entries = useQuery(
    api.entries.listByWall,
    wall ? { wallId: wall._id } : "skip",
  );
  const entryCount = useQuery(
    api.entries.countByWall,
    wall ? { wallId: wall._id } : "skip",
  );

  const toggleHidden = useMutation(api.entries.toggleHidden);
  const toggleVerified = useMutation(api.entries.toggleVerified);
  const removeEntry = useMutation(api.entries.remove);
  const removeWall = useMutation(api.walls.remove);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<Id<"entries"> | null>(
    null,
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrDarkColor, setQrDarkColor] = useState("#ffffff");
  const [qrLightColor, setQrLightColor] = useState("#0a0a0a");
  const [qrSize, setQrSize] = useState(320);
  const [qrMargin, setQrMargin] = useState(2);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleDeleteWall = async () => {
    await removeWall({ wallId });
    router.push("/dashboard");
  };

  const handleDeleteEntry = async (entryId: Id<"entries">) => {
    await removeEntry({ entryId });
    setDeletingEntryId(null);
  };

  const getVisibilityStyle = (visibility: "public" | "private") => {
    return visibility === "public"
      ? "bg-green-900/50 text-green-400"
      : "bg-red-900/50 text-red-400";
  };

  const wallUrl = getWallDisplayUrl(wall?.slug as string);
  const fullWallUrl = getWallUrl(wall?.slug as string);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      setIsGeneratingQr(true);
      setQrError(null);
      try {
        const url = await QRCode.toDataURL(fullWallUrl, {
          width: qrSize,
          margin: qrMargin,
          color: {
            dark: qrDarkColor,
            light: qrLightColor,
          },
        });
        if (!cancelled) {
          setQrDataUrl(url);
        }
      } catch (err) {
        if (!cancelled) {
          setQrError(
            err instanceof Error ? err.message : "Failed to generate QR code",
          );
        }
      } finally {
        if (!cancelled) {
          setIsGeneratingQr(false);
        }
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [fullWallUrl, qrDarkColor, qrLightColor, qrMargin, qrSize]);

  if (wall === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (wall === null) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Wall Not Found</h1>
        <p className="text-zinc-400 mb-6">
          This wall doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-zinc-200 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const renderEntries = () => {
    if (entries === undefined) {
      return <div className="text-zinc-400">Loading signatures...</div>;
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-white mb-2">
            No signatures yet
          </h3>
          <p className="text-zinc-400">
            Share your wall link to start collecting signatures
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry._id}
            className={`bg-zinc-900 border rounded-lg p-4 ${
              entry.isHidden ? "border-zinc-700 opacity-60" : "border-zinc-800"
            }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{entry.name}</h3>
                  {entry.isVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-400">
                      ✓ Verified
                    </span>
                  )}
                  {entry.isHidden && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-400">
                      Hidden
                    </span>
                  )}
                </div>
                {entry.message && (
                  <p className="mt-2 text-zinc-300 text-sm whitespace-pre-wrap">
                    {entry.message}
                  </p>
                )}
                {entry.stickers && entry.stickers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.stickers.map((sticker) => (
                      <span key={sticker} className="text-lg">
                        {sticker}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-zinc-600">
                  {new Date(entry._creationTime).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleVerified({ entryId: entry._id })}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                  title={
                    entry.isVerified
                      ? "Remove verification"
                      : "Mark as verified"
                  }>
                  {entry.isVerified ? "✓" : "○"}
                </button>
                <button
                  onClick={() => toggleHidden({ entryId: entry._id })}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                  title={entry.isHidden ? "Show entry" : "Hide entry"}>
                  {entry.isHidden ? "👁" : "👁‍🗨"}
                </button>
                <button
                  onClick={() => setDeletingEntryId(entry._id)}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Delete entry">
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">{wall.title}</h1>
          <p className="mt-1 text-zinc-400">
            <a
              href={`https://${wallUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors">
              {wallUrl} ↗
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/walls/${wallId}/export`}
            className="px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
            Export
          </Link>
          <Link
            href={`/dashboard/walls/${wallId}/edit`}
            className="px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
            Edit Wall
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-800 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/50 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400">
            Total Signatures
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-white">
            {entryCount ?? 0}
          </dd>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400">Visibility</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${getVisibilityStyle(wall.visibility)}`}>
              {wall.visibility}
            </span>
          </dd>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400">Status</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${
                wall.acceptingEntries
                  ? "bg-green-900/50 text-green-400"
                  : "bg-zinc-700 text-zinc-400"
              }`}>
              {wall.acceptingEntries ? "Accepting Signatures" : "Closed"}
            </span>
          </dd>
        </div>
      </div>

      {/* Share */}
      <div className="grid grid-cols-1 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400">Share Link</dt>
          <dd className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 text-white text-sm break-all">
              {fullWallUrl}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(fullWallUrl);
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 1600);
                  } catch {
                    // noop
                  }
                }}>
                <span
                  className={`inline-flex items-center gap-2 transition-all duration-300 ${
                    copyFeedback ? "text-emerald-400" : "text-white"
                  }`}>
                  {copyFeedback && <Check className="h-4 w-4 animate-bounce" />}
                  <span
                    className={`transition-transform duration-300 ${
                      copyFeedback ? "scale-105" : "scale-100"
                    }`}>
                    {copyFeedback ? "Copied!" : "Copy Link"}
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={() => setQrDialogOpen(true)}>
                Download QR
              </Button>
            </div>
          </dd>
        </div>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Download QR Code</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Scan to open your wall quickly.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-4">
            {isGeneratingQr && (
              <div className="text-zinc-500 text-sm">Generating QR…</div>
            )}
            {qrError && <div className="text-red-400 text-sm">{qrError}</div>}
            {!isGeneratingQr && !qrError && qrDataUrl && (
              <img src={qrDataUrl} alt="Wall QR code" className="h-48 w-48" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-300">Presets</p>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "Classic",
                  dark: "#000000",
                  light: "#ffffff",
                  size: 320,
                  margin: 2,
                },
                {
                  label: "Night",
                  dark: "#ffffff",
                  light: "#0a0a0a",
                  size: 320,
                  margin: 2,
                },
                {
                  label: "Soft",
                  dark: "#1f2937",
                  light: "#f9fafb",
                  size: 300,
                  margin: 3,
                },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => {
                    setQrDarkColor(preset.dark);
                    setQrLightColor(preset.light);
                    setQrSize(preset.size);
                    setQrMargin(preset.margin);
                  }}>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="qr-dark-color"
                className="text-sm font-medium text-zinc-300">
                Foreground
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="qr-dark-color"
                  type="color"
                  value={qrDarkColor}
                  onChange={(e) => setQrDarkColor(e.target.value)}
                  className="h-10 w-12 rounded border border-zinc-700 bg-zinc-800"
                />
                <input
                  type="text"
                  value={qrDarkColor}
                  onChange={(e) => setQrDarkColor(e.target.value)}
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="qr-light-color"
                className="text-sm font-medium text-zinc-300">
                Background
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="qr-light-color"
                  type="color"
                  value={qrLightColor}
                  onChange={(e) => setQrLightColor(e.target.value)}
                  className="h-10 w-12 rounded border border-zinc-700 bg-zinc-800"
                />
                <input
                  type="text"
                  value={qrLightColor}
                  onChange={(e) => setQrLightColor(e.target.value)}
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="qr-size"
                className="text-sm font-medium text-zinc-300">
                Size
              </label>
              <Select
                value={String(qrSize)}
                onValueChange={(value) => setQrSize(Number(value))}>
                <SelectTrigger
                  id="qr-size"
                  className="w-full bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {[240, 280, 320, 360].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="qr-margin"
                className="text-sm font-medium text-zinc-300">
                Margin
              </label>
              <Select
                value={String(qrMargin)}
                onValueChange={(value) => setQrMargin(Number(value))}>
                <SelectTrigger
                  id="qr-margin"
                  className="w-full bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select margin" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {[0, 1, 2, 3, 4].map((margin) => (
                    <SelectItem key={margin} value={String(margin)}>
                      {margin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              onClick={() => setQrDialogOpen(false)}>
              Close
            </Button>
            <Button type="button" disabled={!qrDataUrl} asChild>
              <a href={qrDataUrl ?? undefined} download={`${wall.slug}-qr.png`}>
                Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entries */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Signatures ({entries?.length ?? 0})
        </h2>
        {renderEntries()}
      </div>

      {/* Delete wall confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete this wall?
            </h3>
            <p className="text-zinc-400 mb-6">
              This will permanently delete &quot;{wall.title}&quot; and all its
              signatures. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteWall}
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                Delete Wall
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete entry confirmation */}
      {deletingEntryId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete this signature?
            </h3>
            <p className="text-zinc-400 mb-6">
              This will permanently delete this signature. This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingEntryId(null)}
                className="flex-1 px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(deletingEntryId)}
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                Delete Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
