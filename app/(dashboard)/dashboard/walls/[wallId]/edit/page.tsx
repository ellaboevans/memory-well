"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getDomainSuffix } from "@/lib/config";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";

const FONT_OPTIONS = [
  { value: "Geist", label: "Geist (Default)" },
  { value: "Inter", label: "Inter" },
  { value: "Georgia", label: "Georgia (Serif)" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto Mono", label: "Roboto Mono" },
];

const COLOR_PRESETS = [
  { name: "Default", primary: "#ffffff", background: "#0a0a0a" },
  { name: "Ocean", primary: "#60a5fa", background: "#0f172a" },
  { name: "Forest", primary: "#4ade80", background: "#052e16" },
  { name: "Sunset", primary: "#fb923c", background: "#1c1917" },
  { name: "Rose", primary: "#f472b6", background: "#1f1218" },
  { name: "Lavender", primary: "#a78bfa", background: "#1e1b2e" },
];

export default function EditWallPage() {
  const params = useParams();
  const router = useRouter();
  const wallId = params.wallId as Id<"walls">;
  const coverInputRef = useRef<HTMLInputElement>(null);

  const wall = useQuery(api.walls.get, { wallId });
  const updateWall = useMutation(api.walls.update);
  const generateUploadUrl = useMutation(api.walls.generateUploadUrl);

  // Get cover image URL if exists
  const coverImageUrl = useQuery(
    api.walls.getCoverImageUrl,
    wall?.coverImageId ? { storageId: wall.coverImageId } : "skip",
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [acceptingEntries, setAcceptingEntries] = useState(true);

  // Theme state
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#0a0a0a");
  const [fontFamily, setFontFamily] = useState("Geist");

  // Cover image state
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverRemoved, setCoverRemoved] = useState(false);

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
      setPrimaryColor(wall.theme.primaryColor);
      setBackgroundColor(wall.theme.backgroundColor);
      setFontFamily(wall.theme.fontFamily);
      setCoverImageId(wall.coverImageId ?? null);
    }
  }, [wall]);

  // Track changes
  useEffect(() => {
    if (wall) {
      const changed =
        title !== wall.title ||
        description !== (wall.description ?? "") ||
        visibility !== wall.visibility ||
        acceptingEntries !== wall.acceptingEntries ||
        primaryColor !== wall.theme.primaryColor ||
        backgroundColor !== wall.theme.backgroundColor ||
        fontFamily !== wall.theme.fontFamily ||
        coverImageId !== (wall.coverImageId ?? null);
      setHasChanges(changed);
    }
  }, [
    wall,
    title,
    description,
    visibility,
    acceptingEntries,
    primaryColor,
    backgroundColor,
    fontFamily,
    coverImageId,
  ]);

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploadingCover(true);
    setError(null);

    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);

      // Upload to Convex
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { storageId } = await response.json();
      setCoverImageId(storageId);
      setCoverRemoved(false);
    } catch (err) {
      setError("Failed to upload image");
      setCoverPreview(null);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const removeCover = () => {
    setCoverImageId(null);
    setCoverPreview(null);
    setCoverRemoved(true);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

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
        coverImageId: coverRemoved ? null : (coverImageId ?? undefined),
        visibility,
        acceptingEntries,
        theme: {
          primaryColor,
          backgroundColor,
          fontFamily,
        },
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
                {getDomainSuffix()}
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

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Cover Image <span className="text-zinc-500">(optional)</span>
            </label>

            {/* Current/Preview Image */}
            {(coverPreview || (coverImageUrl && !coverRemoved)) && (
              <div className="relative mb-3 rounded-lg overflow-hidden">
                <Image
                  src={coverPreview || coverImageUrl || ""}
                  alt="Cover preview"
                  width={600}
                  height={200}
                  className="w-full h-40 object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                  title="Remove cover">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isUploadingCover && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className={`inline-flex items-center px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 cursor-pointer transition-colors ${
                  isUploadingCover ? "opacity-50 cursor-wait" : ""
                }`}>
                {coverPreview || (coverImageUrl && !coverRemoved)
                  ? "Change Image"
                  : "Upload Image"}
              </label>
              <span className="text-xs text-zinc-500">
                Recommended: 1200×400px, max 5MB
              </span>
            </div>
          </div>

          {/* Theme Section */}
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Theme & Appearance
            </h3>

            {/* Color Presets */}
            <div className="mb-6">
              <label
                htmlFor="color-presets"
                className="block text-sm font-medium text-zinc-300 mb-2">
                Color Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setBackgroundColor(preset.background);
                    }}
                    className={`p-3 rounded-lg border transition-all ${
                      primaryColor === preset.primary &&
                      backgroundColor === preset.background
                        ? "border-white ring-1 ring-white"
                        : "border-zinc-700 hover:border-zinc-600"
                    }`}
                    style={{ backgroundColor: preset.background }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: preset.primary }}>
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="primaryColor"
                  className="block text-sm font-medium text-zinc-300 mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="backgroundColor"
                  className="block text-sm font-medium text-zinc-300 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="backgroundColor"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label
                htmlFor="fontFamily"
                className="block text-sm font-medium text-zinc-300 mb-1">
                Font Family
              </label>
              <select
                id="fontFamily"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white">
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="mb-2">
              <label
                htmlFor="preview"
                className="block text-sm font-medium text-zinc-300 mb-2">
                Preview
              </label>
              <div
                className="rounded-lg border border-zinc-700 p-6 transition-colors"
                style={{ backgroundColor, fontFamily }}>
                <h4
                  className="text-lg font-semibold mb-2"
                  style={{ color: primaryColor }}>
                  {title || "Wall Title"}
                </h4>
                <p
                  className="text-sm opacity-70"
                  style={{ color: primaryColor }}>
                  {description || "Your wall description will appear here..."}
                </p>
                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: `${primaryColor}30`,
                    borderWidth: 1,
                  }}>
                  <p className="text-sm" style={{ color: primaryColor }}>
                    Sample signature entry preview
                  </p>
                </div>
              </div>
            </div>
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
