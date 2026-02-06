"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useReducedMotion, motion } from "framer-motion";

interface EntryCardProps {
  entry: Doc<"entries">;
  index: number;
  primaryColor: string;
  borderColor: string;
  cardBgColor: string;
}

export function EntryCard({
  entry,
  index,
  primaryColor,
  borderColor,
  cardBgColor,
}: Readonly<EntryCardProps>) {
  const reduceMotion = useReducedMotion();

  const signatureUrl = useQuery(
    api.entries.getSignatureUrl,
    entry.signatureImageId
      ? { storageId: entry.signatureImageId as Id<"_storage"> }
      : "skip",
  );

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      className="rounded-lg p-4"
      style={{
        backgroundColor: cardBgColor,
        borderColor,
        borderWidth: 1,
      }}>
      {entry.message && (
        <p
          className="mt-1 text-sm whitespace-pre-wrap opacity-80"
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

      <div className="mt-auto flex items-end justify-between gap-4 pt-3">
        <div className="flex flex-col text-sm">
          <p className="font-semibold" style={{ color: primaryColor }}>
            {entry.name || "Anonymous"}
          </p>
          <p className="text-xs opacity-50" style={{ color: primaryColor }}>
            {new Date(entry._creationTime).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
        </div>
        {signatureUrl && (
          <div className="w-28 shrink-0 self-end">
            <Image
              src={signatureUrl}
              alt="Signature"
              width={150}
              height={150}
              className="h-auto w-full object-contain"
              unoptimized
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
