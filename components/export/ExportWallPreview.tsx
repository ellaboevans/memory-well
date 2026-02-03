"use client";

import { forwardRef, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Entry {
  _id: Id<"entries">;
  name: string;
  message?: string;
  signatureImageId?: Id<"_storage">;
  stickers?: string[];
  isVerified: boolean;
  createdAt: number;
}

interface Wall {
  _id: Id<"walls">;
  title: string;
  description?: string;
  coverImageId?: Id<"_storage">;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
}

interface ExportWallPreviewProps {
  readonly wall: Wall;
  readonly entries: Entry[];
  readonly layout: "grid" | "list";
}

// Signature image component with URL fetching
function SignatureImage({ storageId }: { readonly storageId: Id<"_storage"> }) {
  const url = useQuery(api.entries.getSignatureUrl, { storageId });

  if (!url) {
    return <div className="h-12 bg-gray-200 rounded animate-pulse" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Signature"
      className="max-h-16 w-auto"
      crossOrigin="anonymous"
    />
  );
}

// Cover image component
function CoverImage({ storageId }: { readonly storageId: Id<"_storage"> }) {
  const url = useQuery(api.walls.getCoverImageUrl, { storageId });

  if (!url) {
    return <div className="w-full h-40 bg-gray-200 animate-pulse" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Cover"
      className="w-full h-40 object-cover"
      crossOrigin="anonymous"
    />
  );
}

export const ExportWallPreview = forwardRef<
  HTMLDivElement,
  ExportWallPreviewProps
>(function ExportWallPreview({ wall, entries, layout }, ref) {
  const { primaryColor, backgroundColor, fontFamily } = wall.theme;

  // Calculate text color based on background
  const bgBrightness = Number.parseInt(backgroundColor.slice(1), 16);
  const textColor = bgBrightness > 0x7fffff ? "#1a1a1a" : "#ffffff";
  const mutedColor = bgBrightness > 0x7fffff ? "#666666" : "#999999";

  // Memoize export date to avoid impure function in render
  const exportDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      ref={ref}
      className="export-preview"
      style={{
        backgroundColor,
        fontFamily,
        color: textColor,
        width: "800px",
        minHeight: "1000px",
        padding: "0",
      }}>
      {/* Cover Image */}
      {wall.coverImageId && <CoverImage storageId={wall.coverImageId} />}

      {/* Header */}
      <div className="px-10 pt-10 pb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
          {wall.title}
        </h1>
        {wall.description && (
          <p className="text-lg opacity-70" style={{ color: textColor }}>
            {wall.description}
          </p>
        )}
        <div className="mt-4 text-sm" style={{ color: mutedColor }}>
          {entries.length === 1
            ? "1 signature"
            : `${entries.length} signatures`}{" "}
          • Exported {exportDate}
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-10 h-px"
        style={{ backgroundColor: `${primaryColor}30` }}
      />

      {/* Entries */}
      <div className="px-10 py-8">
        {layout === "grid" ? (
          <div className="grid grid-cols-2 gap-6">
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                primaryColor={primaryColor}
                textColor={textColor}
                mutedColor={mutedColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                primaryColor={primaryColor}
                textColor={textColor}
                mutedColor={mutedColor}
                formatDate={formatDate}
                isListView
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-10 py-6 text-center text-sm"
        style={{ color: mutedColor }}>
        Created with Memory Well • memorywell.app
      </div>
    </div>
  );
});

function EntryCard({
  entry,
  primaryColor,
  textColor,
  mutedColor,
  formatDate,
  isListView = false,
}: {
  readonly entry: Entry;
  readonly primaryColor: string;
  readonly textColor: string;
  readonly mutedColor: string;
  readonly formatDate: (ts: number) => string;
  readonly isListView?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 ${isListView ? "flex items-start gap-4" : ""}`}
      style={{ backgroundColor: `${primaryColor}10` }}>
      <div className={isListView ? "flex-1" : ""}>
        {/* Name & Verified Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold" style={{ color: textColor }}>
            {entry.name}
          </span>
          {entry.isVerified && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${primaryColor}30`,
                color: primaryColor,
              }}>
              ✓ Verified
            </span>
          )}
        </div>

        {/* Message */}
        {entry.message && (
          <p className="text-sm mb-3" style={{ color: textColor }}>
            {entry.message}
          </p>
        )}

        {/* Stickers */}
        {entry.stickers && entry.stickers.length > 0 && (
          <div className="flex gap-1 mb-3">
            {entry.stickers.map((sticker) => (
              <span key={sticker} className="text-xl">
                {sticker}
              </span>
            ))}
          </div>
        )}

        {/* Signature */}
        {entry.signatureImageId && (
          <div
            className="inline-block rounded p-2 mb-2"
            style={{ backgroundColor: `${primaryColor}08` }}>
            <SignatureImage storageId={entry.signatureImageId} />
          </div>
        )}

        {/* Date */}
        <div className="text-xs" style={{ color: mutedColor }}>
          {formatDate(entry.createdAt)}
        </div>
      </div>
    </div>
  );
}
