"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";

// Component to display signature image
function SignatureImage({ storageId }: { storageId: Id<"_storage"> }) {
  const url = useQuery(api.entries.getSignatureUrl, { storageId });

  if (!url) {
    return <div className="mt-3 h-16 bg-zinc-800 rounded animate-pulse" />;
  }

  return (
    <div className="mt-3 bg-zinc-800 rounded-lg p-2 inline-block">
      <Image
        src={url}
        alt="Signature"
        width={200}
        height={80}
        className="max-h-20 w-auto"
        unoptimized
      />
    </div>
  );
}

// Component to display cover image
function CoverImage({ storageId }: { storageId: Id<"_storage"> }) {
  const url = useQuery(api.walls.getCoverImageUrl, { storageId });

  if (!url) {
    return <div className="w-full h-48 sm:h-64 bg-zinc-800 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-48 sm:h-64">
      <Image
        src={url}
        alt="Wall cover"
        fill
        className="object-cover"
        priority
        unoptimized
      />
    </div>
  );
}

export default function PublicWallPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const wall = useQuery(api.walls.getBySlug, { slug });
  const entries = useQuery(
    api.entries.listByWall,
    wall ? { wallId: wall._id } : "skip",
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

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

  // Theme colors from wall settings
  const theme = wall.theme;
  const primaryColor = theme.primaryColor;
  const backgroundColor = theme.backgroundColor;
  const fontFamily = theme.fontFamily;

  const windowNotStarted =
    wall.entryWindowStart !== undefined && now < wall.entryWindowStart;
  const windowClosed =
    wall.entryWindowEnd !== undefined && now > wall.entryWindowEnd;
  const canSign = wall.acceptingEntries && !windowNotStarted && !windowClosed;

  // Calculate contrast color for buttons (dark text on light bg, light text on dark bg)
  const isLightPrimary = Number.parseInt(primaryColor.slice(1), 16) > 0x7fffff;
  const buttonTextColor = isLightPrimary ? "#000000" : "#ffffff";

  // Border color with transparency
  const borderColor = `${primaryColor}30`;
  const cardBgColor = `${primaryColor}08`;

  return (
    <div className="min-h-screen" style={{ backgroundColor, fontFamily }}>
      {/* Cover Image */}
      {wall.coverImageId && <CoverImage storageId={wall.coverImageId} />}

      {/* Wall header */}
      <header style={{ borderBottomColor: borderColor, borderBottomWidth: 1 }}>
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
            {wall.title}
          </h1>
          {wall.description && (
            <p className="mt-2 opacity-70" style={{ color: primaryColor }}>
              {wall.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4">
            {canSign && (
              <Link
                href={`/wall/${slug}/sign`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: primaryColor,
                  color: buttonTextColor,
                }}>
                Sign This Wall ✍️
              </Link>
            )}
            {!canSign && (
              <div
                className="text-sm opacity-70"
                style={{ color: primaryColor }}>
                {windowNotStarted && "Signing opens soon."}
                {windowClosed && "Signing is closed."}
                {!windowNotStarted &&
                  !windowClosed &&
                  !wall.acceptingEntries &&
                  "Signing is currently disabled."}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Entries grid */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {entries === undefined ? (
          <div style={{ color: primaryColor }} className="opacity-60">
            Loading signatures...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: primaryColor }}>
              No signatures yet
            </h2>
            <p className="mb-6 opacity-60" style={{ color: primaryColor }}>
              Be the first to sign this memory wall!
            </p>
            {wall.acceptingEntries && (
              <Link
                href={`/wall/${slug}/sign`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: primaryColor,
                  color: buttonTextColor,
                }}>
                Add your signature
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm opacity-50" style={{ color: primaryColor }}>
              {entries.length} signature{entries.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor,
                    borderWidth: 1,
                  }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="font-medium"
                        style={{ color: primaryColor }}>
                        {entry.name}
                      </h3>
                    </div>
                    {entry.isVerified && (
                      <span
                        className="inline-flex items-center rounded-full bg-blue-600/20 p-1.5 text-blue-300"
                        aria-label="Verified">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-6 w-6 fill-current">
                          <path d="M12 2l1.8 2.3 2.9-.3.7 2.8 2.8.7-.3 2.9L22 12l-2.3 1.8.3 2.9-2.8.7-.7 2.8-2.9-.3L12 22l-1.8-2.3-2.9.3-.7-2.8-2.8-.7.3-2.9L2 12l2.3-1.8-.3-2.9 2.8-.7.7-2.8 2.9.3L12 2z" />
                          <path
                            className="text-blue-50"
                            d="M10.2 13.6l-1.8-1.8-1.2 1.2 3 3 6-6-1.2-1.2-4.8 4.8z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  {entry.signatureImageId && (
                    <SignatureImage storageId={entry.signatureImageId} />
                  )}
                  {entry.message && (
                    <p
                      className="mt-3 text-sm whitespace-pre-wrap opacity-80"
                      style={{ color: primaryColor }}>
                      {entry.message}
                    </p>
                  )}
                  {entry.stickers && entry.stickers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.stickers.map((sticker, i) => (
                        <span key={i + 1} className="text-lg">
                          {sticker}
                        </span>
                      ))}
                    </div>
                  )}
                  <p
                    className="mt-3 text-xs opacity-40"
                    style={{ color: primaryColor }}>
                    {new Date(entry._creationTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-auto"
        style={{ borderTopColor: borderColor, borderTopWidth: 1 }}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p
            className="text-center text-sm opacity-50"
            style={{ color: primaryColor }}>
            Powered by{" "}
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
              style={{ color: primaryColor }}>
              Memory Well
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
