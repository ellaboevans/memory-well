"use client";

import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getWallDisplayUrl, getWallUrl } from "@/lib/config";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowLeft,
  ExternalLink,
  BadgeCheck,
  Eye,
  EyeOff,
  Trash2,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QRCode from "qrcode";
import Image from "next/image";

export default function WallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const wallId = params.wallId as Id<"walls">;

  const wall = useQuery(api.walls.get, { wallId });
  const profile = useQuery(api.profiles.me);
  const isPremium = profile?.tier === "premium";
  const {
    results: entries,
    status: entriesStatus,
    loadMore,
  } = usePaginatedQuery(
    api.entries.listByWallPaginated,
    wall ? { wallId: wall._id } : "skip",
    { initialNumItems: 20 },
  );
  const entryCount = useQuery(
    api.entries.countByWall,
    wall ? { wallId: wall._id } : "skip",
  );
  const [geoRange, setGeoRange] = useState<7 | 30 | 90>(30);
  const geoInsights = useQuery(
    api.analytics.getWallGeoInsights,
    isPremium && wall ? { wallId, days: geoRange } : "skip",
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
  const [copyError, setCopyError] = useState<string | null>(null);
  const [embedCopyFeedback, setEmbedCopyFeedback] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<Id<"entries"> | null>(
    null,
  );

  const handleDeleteWall = async () => {
    setActionError(null);
    try {
      await removeWall({ wallId });
      router.push("/dashboard");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete wall",
      );
    }
  };

  const handleDeleteEntry = async (entryId: Id<"entries">) => {
    setActionError(null);
    try {
      await removeEntry({ entryId });
      setDeletingEntryId(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete signature",
      );
    }
  };

  const getVisibilityStyle = (visibility: "public" | "private") => {
    return visibility === "public"
      ? "bg-green-900/50 text-green-400"
      : "bg-red-900/50 text-red-400";
  };

  const wallUrl = getWallDisplayUrl(wall?.slug as string);
  const fullWallUrl = getWallUrl(wall?.slug as string);
  const embedWallCode = `<iframe src="${fullWallUrl}" width="100%" height="800" style="border:0;border-radius:12px;" loading="lazy"></iframe>`;
  const embedSignCode = `<iframe src="${fullWallUrl}/sign" width="100%" height="900" style="border:0;border-radius:12px;" loading="lazy"></iframe>`;

  const renderEmbedPreview = (src: string, height: string) => (
    <pre className="whitespace-pre-wrap rounded-xl border border-zinc-800 bg-black/80 p-4 text-xs leading-6 text-zinc-200">
      <code className="block font-mono">
        <span className="text-sky-300">&lt;iframe</span>{" "}
        <span className="text-zinc-400">src</span>
        <span className="text-zinc-500">=</span>
        <span className="text-emerald-300">&ldquo;{src}&rdquo;</span>
        {"\n"} <span className="text-zinc-400">width</span>
        <span className="text-zinc-500">=</span>
        <span className="text-emerald-300">&ldquo;100%&rdquo;</span>
        {"\n"} <span className="text-zinc-400">height</span>
        <span className="text-zinc-500">=</span>
        <span className="text-emerald-300">&ldquo;{height}&rdquo;</span>
        {"\n"} <span className="text-zinc-400">style</span>
        <span className="text-zinc-500">=</span>
        <span className="text-amber-300">
          &ldquo;border:0; border-radius:12px;&rdquo;
        </span>
        {"\n"} <span className="text-zinc-400">loading</span>
        <span className="text-zinc-500">=</span>
        <span className="text-emerald-300">&ldquo;lazy&rdquo;</span>
        <span className="text-sky-300">&gt;&lt;/iframe&gt;</span>
      </code>
    </pre>
  );

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

  if (wall === undefined || profile === undefined) {
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
    if (entriesStatus === "LoadingFirstPage") {
      return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 animate-pulse">
          <div className="h-4 w-40 rounded bg-zinc-800" />
          <div className="mt-4 h-3 w-64 rounded bg-zinc-800" />
          <div className="mt-6 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-full rounded bg-zinc-800" />
            ))}
          </div>
        </div>
      );
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
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Visibility
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {entries.map((entry) => {
                  const isExpanded = expandedEntryId === entry._id;
                  return (
                    <React.Fragment key={entry?._id}>
                      <tr className={entry.isHidden ? "opacity-60" : undefined}>
                        <td className="px-4 py-3 text-white">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-left text-white hover:text-white"
                            onClick={() =>
                              setExpandedEntryId(isExpanded ? null : entry._id)
                            }>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              }`}
                            />
                            {entry.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {new Date(entry._creationTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {entry.isHidden ? (
                            <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                              Hidden
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs text-emerald-300">
                              Visible
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.isVerified ? (
                            <span className="inline-flex items-center rounded-full bg-blue-600/20 px-2 py-0.5 text-xs text-blue-300">
                              Verified
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-500">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:text-white transition-colors"
                                  aria-label="Entry actions">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-zinc-900 w-45 border-zinc-800 text-white">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <DropdownMenuItem
                                          onClick={async () => {
                                            setActionError(null);
                                            if (!isPremium) {
                                              setActionError(
                                                "Verification badges require Premium.",
                                              );
                                              return;
                                            }
                                            try {
                                              await toggleVerified({
                                                entryId: entry._id,
                                              });
                                            } catch (err) {
                                              setActionError(
                                                err instanceof Error
                                                  ? err.message
                                                  : "Failed to update verification",
                                              );
                                            }
                                          }}
                                          disabled={!isPremium}
                                          className="gap-2">
                                          <BadgeCheck className="h-4 w-4" />
                                          {entry.isVerified
                                            ? "Unverify entry"
                                            : "Verify entry"}
                                        </DropdownMenuItem>
                                      </span>
                                    </TooltipTrigger>
                                    {!isPremium && (
                                      <TooltipContent>
                                        Upgrade to use verification
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    setActionError(null);
                                    try {
                                      await toggleHidden({
                                        entryId: entry._id,
                                      });
                                    } catch (err) {
                                      setActionError(
                                        err instanceof Error
                                          ? err.message
                                          : "Failed to update visibility",
                                      );
                                    }
                                  }}
                                  className="gap-2">
                                  {entry.isHidden ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                  {entry.isHidden ? "Show entry" : "Hide entry"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletingEntryId(entry._id)}
                                  variant="destructive"
                                  className="gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Delete entry
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-zinc-950/40">
                        <td colSpan={5} className="px-4 pb-4 pt-1">
                          <div
                            className={`overflow-hidden transition-all duration-200 ease-out ${
                              isExpanded
                                ? "max-h-96 mt-3 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}>
                            <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300">
                              {entry.message && (
                                <p className="whitespace-pre-wrap">
                                  {entry.message}
                                </p>
                              )}
                              {entry.stickers && entry.stickers.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 text-lg">
                                  {entry.stickers.map((sticker) => (
                                    <span key={sticker}>{sticker}</span>
                                  ))}
                                </div>
                              )}
                              {!entry.message &&
                                (!entry.stickers ||
                                  entry.stickers.length === 0) && (
                                  <p className="text-zinc-500">
                                    No message or stickers.
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing {entries.length} of {entryCount ?? entries.length}{" "}
            signatures
          </span>
          <Button
            variant="outline"
            className="border-zinc-700"
            disabled={entriesStatus !== "CanLoadMore"}
            onClick={() => loadMore(20)}>
            {entriesStatus === "LoadingMore" ? "Loading..." : "Load more"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">{wall.title}</h1>
          <p className="mt-1 text-zinc-400">
            <a
              href={`https://${wallUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors">
              {wallUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/walls/${wallId}/export`}
            className="px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center">
            Export
          </Link>
          <Link
            href={`/dashboard/walls/${wallId}/edit`}
            className="px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center">
            Edit Wall
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-800 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/50 transition-colors w-full sm:w-auto text-center">
            Delete
          </button>
        </div>
      </div>
      {actionError && (
        <div
          className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm"
          role="alert"
          aria-live="polite">
          {actionError}
        </div>
      )}

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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={async () => {
                  setCopyError(null);
                  try {
                    await navigator.clipboard.writeText(fullWallUrl);
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 1600);
                  } catch {
                    setCopyError("Failed to copy link. Please try again.");
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
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={() => {
                  if (!wall) return;
                  window.open(`/api/share/wall/${wall.slug}`, "_blank");
                }}>
                Share Image
              </Button>
            </div>
          </dd>
          {copyError && (
            <p className="mt-2 text-xs text-red-400" role="alert">
              {copyError}
            </p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400">Embed Code</dt>
          <dd className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">Wall view</p>
                  <p className="text-xs text-zinc-500">
                    Full wall embedded on another site
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-zinc-700"
                  onClick={async () => {
                    setCopyError(null);
                    try {
                      await navigator.clipboard.writeText(embedWallCode);
                      setEmbedCopyFeedback("wall");
                      setTimeout(() => setEmbedCopyFeedback(null), 1600);
                    } catch {
                      setCopyError("Failed to copy embed code.");
                    }
                  }}>
                  {embedCopyFeedback === "wall" ? "Copied!" : "Copy"}
                </Button>
              </div>
              {renderEmbedPreview(fullWallUrl, "800")}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">Sign form</p>
                  <p className="text-xs text-zinc-500">
                    Directly embed the signing experience
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-zinc-700"
                  onClick={async () => {
                    setCopyError(null);
                    try {
                      await navigator.clipboard.writeText(embedSignCode);
                      setEmbedCopyFeedback("sign");
                      setTimeout(() => setEmbedCopyFeedback(null), 1600);
                    } catch {
                      setCopyError("Failed to copy embed code.");
                    }
                  }}>
                  {embedCopyFeedback === "sign" ? "Copied!" : "Copy"}
                </Button>
              </div>
              {renderEmbedPreview(`${fullWallUrl}/sign`, "900")}
            </div>
          </dd>
        </div>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl">
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
              <Image
                src={qrDataUrl}
                alt="Wall QR code"
                width={2000}
                height={2000}
                loading="eager"
                decoding="async"
                className="h-48 w-48"
              />
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
      <div className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Geo Insights</h2>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((range) => (
              <Button
                key={range}
                variant={geoRange === range ? "default" : "outline"}
                size="sm"
                className={
                  geoRange === range
                    ? ""
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }
                onClick={() => setGeoRange(range as 7 | 30 | 90)}
                disabled={!isPremium}>
                {range}d
              </Button>
            ))}
          </div>
        </div>
        {!isPremium ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/60 p-6 text-center">
            <p className="text-sm text-zinc-400 mb-4">
              Geo insights are available on Premium.
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/billing">Upgrade to Premium</Link>
            </Button>
          </div>
        ) : geoInsights === undefined ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 animate-pulse">
            <div className="h-4 w-40 rounded bg-zinc-800" />
            <div className="mt-4 h-3 w-64 rounded bg-zinc-800" />
            <div className="mt-6 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 w-full rounded bg-zinc-800" />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Total Views ({geoRange}d)
                </div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {geoInsights.totalViews}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Unique Visitors
                </div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {geoInsights.uniqueVisitors}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Views over time
              </div>
              <ChartContainer
                config={{
                  views: {
                    label: "Views",
                    color: "#60a5fa",
                  },
                }}
                className="mt-3 h-50 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={geoInsights.series}>
                    <defs>
                      <linearGradient
                        id="fillGeoViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-views)"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-views)"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={20}
                      tickFormatter={(value: string) =>
                        format(parseISO(value), "MMM d")
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            format(parseISO(value), "PPP")
                          }
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Views"
                      stroke="var(--color-views)"
                      fill="url(#fillGeoViews)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Top Countries
              </div>
              {geoInsights.countries.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-400">No geo data yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {geoInsights.countries.map((country) => (
                    <li
                      key={country.countryCode ?? country.country ?? "unknown"}
                      className="flex items-center justify-between text-sm text-zinc-300">
                      <span>
                        {country.country ?? "Unknown"}
                        {country.countryCode ? ` (${country.countryCode})` : ""}
                      </span>
                      <span className="text-zinc-400">{country.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Signatures ({entries?.length ?? 0})
        </h2>
        {renderEntries()}
      </div>

      {/* Delete wall confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete this wall?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will permanently delete <strong>{wall.title}</strong> and all
              its signatures. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteWall}>
              Delete Wall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete entry confirmation */}
      <Dialog
        open={Boolean(deletingEntryId)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingEntryId(null);
          }
        }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete this signature?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will permanently delete this signature. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              onClick={() => setDeletingEntryId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deletingEntryId) {
                  handleDeleteEntry(deletingEntryId);
                }
              }}>
              Delete Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
