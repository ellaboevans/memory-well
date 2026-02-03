"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PublicWallPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const wall = useQuery(api.walls.getBySlug, { slug });
  const entries = useQuery(
    api.entries.listByWall,
    wall ? { wallId: wall._id } : "skip"
  );

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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors"
          >
            Go to Memory Well
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Wall header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">{wall.title}</h1>
          {wall.description && (
            <p className="mt-2 text-zinc-400">{wall.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Link
              href={`/wall/${slug}/sign`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors"
            >
              Sign This Wall ✍️
            </Link>
          </div>
        </div>
      </header>

      {/* Entries grid */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {entries === undefined ? (
          <div className="text-zinc-400">Loading signatures...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No signatures yet
            </h2>
            <p className="text-zinc-400 mb-6">
              Be the first to sign this memory wall!
            </p>
            <Link
              href={`/wall/${slug}/sign`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors"
            >
              Add your signature
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              {entries.length} signature{entries.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{entry.name}</h3>
                      {entry.relationship && (
                        <p className="text-sm text-zinc-500">{entry.relationship}</p>
                      )}
                    </div>
                    {entry.isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {entry.message && (
                    <p className="mt-3 text-zinc-300 text-sm whitespace-pre-wrap">
                      {entry.message}
                    </p>
                  )}
                  {entry.stickers && entry.stickers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.stickers.map((sticker, i) => (
                        <span key={i} className="text-lg">{sticker}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-zinc-600">
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
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500">
            Powered by{" "}
            <Link href="/" className="text-white hover:text-zinc-300">
              Memory Well
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
