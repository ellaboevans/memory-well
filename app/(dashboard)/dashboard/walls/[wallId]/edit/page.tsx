"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

export default function EditWallPage() {
  const params = useParams();
  const router = useRouter();
  const wallId = params.wallId as Id<"walls">;

  const wall = useQuery(api.walls.get, { wallId });
  const updateWall = useMutation(api.walls.update);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [acceptingEntries, setAcceptingEntries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form when wall loads
  useEffect(() => {
    if (wall) {
      setTitle(wall.title);
      setDescription(wall.description ?? "");
      setVisibility(wall.visibility);
      setAcceptingEntries(wall.acceptingEntries);
    }
  }, [wall]);

  // Track changes
  useEffect(() => {
    if (wall) {
      const changed =
        title !== wall.title ||
        description !== (wall.description ?? "") ||
        visibility !== wall.visibility ||
        acceptingEntries !== wall.acceptingEntries;
      setHasChanges(changed);
    }
  }, [wall, title, description, visibility, acceptingEntries]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateWall({
        wallId,
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        acceptingEntries,
      });
      router.push(`/dashboard/walls/${wallId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update wall");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/dashboard/walls/${wallId}`}
          className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to Wall
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Edit Wall</h1>
        <p className="text-zinc-400 mb-8">
          Update your wall settings. The URL slug cannot be changed.
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
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Slug (read-only) */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-zinc-300">
              URL Slug
            </label>
            <div className="mt-1 flex rounded-md">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-900 text-zinc-500 text-sm">
                memorywell.app/
              </span>
              <input
                type="text"
                id="slug"
                disabled
                value={wall.slug}
                className="flex-1 block w-full rounded-none rounded-r-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              URL slugs cannot be changed after creation.
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
            />
          </div>

          {/* Visibility */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-zinc-300 mb-2">
                Visibility
              </legend>
              <div className="space-y-2">
                {[
                  {
                    value: "public" as const,
                    label: "Public",
                    description: "Anyone with the link can view and sign",
                  },
                  {
                    value: "private" as const,
                    label: "Private",
                    description: "Only you can view (signing disabled)",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    aria-label={`${option.label}: ${option.description}`}
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
            </fieldset>
          </div>

          {/* Accepting entries toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-700">
            <div>
              <span className="text-sm font-medium text-white">
                Accept new signatures
              </span>
              <p className="text-xs text-zinc-500">
                When disabled, visitors cannot add new signatures
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAcceptingEntries(!acceptingEntries)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                acceptingEntries ? "bg-green-600" : "bg-zinc-600"
              }`}>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  acceptingEntries ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Link
              href={`/dashboard/walls/${wallId}`}
              className="flex-1 flex justify-center py-2.5 px-4 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="flex-1 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
