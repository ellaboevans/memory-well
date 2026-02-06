"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { EntryCard } from "./entry-card";

interface EntriesListProps {
  entries: Doc<"entries">[];
  primaryColor: string;
  borderColor: string;
  cardBgColor: string;
  onEmpty?: ReactNode;
  status?: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  onLoadMore?: (count: number) => void;
  loadMoreCount?: number;
}

export function EntriesList({
  entries,
  primaryColor,
  borderColor,
  cardBgColor,
  onEmpty,
  status,
  onLoadMore,
  loadMoreCount = 8,
}: EntriesListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!onLoadMore || status !== "CanLoadMore") return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entriesList) => {
        const [entry] = entriesList;
        if (entry?.isIntersecting) {
          onLoadMore(loadMoreCount);
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreCount, onLoadMore, status]);

  if (status === "LoadingFirstPage") {
    return (
      <div style={{ color: primaryColor }} className="opacity-60">
        Loading signatures...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        {onEmpty ?? (
          <>
            <div className="text-6xl mb-4">📝</div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: primaryColor }}>
              No signatures yet
            </h2>
            <p className="mb-6 opacity-60" style={{ color: primaryColor }}>
              Be the first to sign this memory wall!
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              index={index}
              primaryColor={primaryColor}
              borderColor={borderColor}
              cardBgColor={cardBgColor}
            />
          ))}
        </AnimatePresence>
      </div>
      {status === "LoadingMore" && (
        <div className="mt-6 text-center text-sm opacity-60" style={{ color: primaryColor }}>
          Loading more signatures...
        </div>
      )}
      {status === "CanLoadMore" && <div ref={loadMoreRef} className="h-10" />}
      {status === "Exhausted" && entries.length > 0 && (
        <div className="mt-6 text-center text-xs opacity-40" style={{ color: primaryColor }}>
          You&apos;ve reached the end.
        </div>
      )}
    </>
  );
}
