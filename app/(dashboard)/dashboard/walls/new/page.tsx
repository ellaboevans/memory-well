"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewWallPage() {
  const router = useRouter();
  const profile = useQuery(api.profiles.me);
  const walls = useQuery(api.walls.listMyWalls);
  const createWall = useMutation(api.walls.create);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "unlisted" | "private"
  >("public");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateMore = profile?.tier === "premium" || (walls?.length ?? 0) < 3;

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!slug.trim()) {
      setError("URL slug is required");
      return;
    }

    if (slug.length < 3) {
      setError("URL slug must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const wallId = await createWall({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        visibility,
      });
      router.push(`/dashboard/walls/${wallId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wall");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateMore) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Wall Limit Reached
          </h1>
          <p className="text-zinc-400 mb-6">
            Free accounts can create up to 3 walls. Upgrade to Premium for
            unlimited walls.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              Back to Dashboard
            </Link>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-black bg-white hover:bg-zinc-200 transition-colors">
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Create a Memory Wall
        </h1>
        <p className="text-zinc-400 mb-8">
          Set up your wall to start collecting signatures and messages.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-300">
              Wall Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="Sarah & John's Wedding"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-zinc-300">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <div className="mt-1 flex rounded-md">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-900 text-zinc-500 text-sm">
                memorywell.app/
              </span>
              <input
                type="text"
                id="slug"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 block w-full rounded-none rounded-r-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="sarah-john-wedding"
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              This will be your wall&apos;s unique URL. Only lowercase letters,
              numbers, and hyphens.
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-300">
              Description <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white resize-none"
              placeholder="Leave a message for the happy couple!"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              {[
                {
                  value: "public" as const,
                  label: "Public",
                  description: "Anyone with the link can view and sign",
                },
                {
                  value: "unlisted" as const,
                  label: "Unlisted",
                  description: "Hidden from search, but accessible via link",
                },
                {
                  value: "private" as const,
                  label: "Private",
                  description: "Only you can view (signing disabled)",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                    visibility === option.value
                      ? "border-white bg-zinc-800"
                      : "border-zinc-700 hover:border-zinc-600"
                  }`}>
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) =>
                      setVisibility(e.target.value as typeof visibility)
                    }
                    className="mt-0.5 h-4 w-4 text-white border-zinc-600 bg-zinc-800 focus:ring-white"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-white">
                      {option.label}
                    </span>
                    <p className="text-xs text-zinc-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard"
              className="flex-1 flex justify-center py-2.5 px-4 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? "Creating..." : "Create Wall"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
