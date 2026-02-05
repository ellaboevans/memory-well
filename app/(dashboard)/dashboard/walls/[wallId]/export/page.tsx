"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ExportWallPreview } from "@/components/export/ExportWallPreview";
import { ArrowLeft } from "lucide-react";

type ExportFormat = "pdf" | "png" | "jpg";
type ExportLayout = "grid" | "list";

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  pdf: "Best for printing",
  png: "Best quality for digital",
  jpg: "Smaller file size",
};

export default function ExportWallPage() {
  const params = useParams();
  const wallId = params.wallId as Id<"walls">;
  const previewRef = useRef<HTMLDivElement>(null);

  const wall = useQuery(api.walls.get, { wallId });
  const entries = useQuery(
    api.entries.listByWall,
    wall ? { wallId: wall._id, limit: 500 } : "skip",
  );

  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [layout, setLayout] = useState<ExportLayout>("grid");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (!previewRef.current || !wall) return;

    setIsExporting(true);
    setProgress("Preparing export...");
    setExportError(null);

    try {
      // Wait a bit for images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress("Capturing preview...");

      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: wall.theme.backgroundColor,
        logging: false,
      });

      const filename = `${wall.title.toLowerCase().replaceAll(/\s+/g, "-")}-memory-wall`;

      if (format === "pdf") {
        setProgress("Generating PDF...");

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
        });

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          canvas.width / 2,
          canvas.height / 2,
        );
        pdf.save(`${filename}.pdf`);
      } else {
        setProgress(`Generating ${format.toUpperCase()}...`);

        const link = document.createElement("a");
        link.download = `${filename}.${format}`;
        link.href = canvas.toDataURL(
          format === "png" ? "image/png" : "image/jpeg",
          0.95,
        );
        link.click();
      }

      setProgress("Done!");
      setTimeout(() => setProgress(""), 2000);
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [wall, format]);

  // Loading state
  if (wall === undefined || entries === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Wall not found
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

  // Filter out hidden entries for export
  const visibleEntries = entries.filter((e) => !e.isHidden);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/walls/${wallId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Wall
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Options */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-6">
            <h1 className="text-2xl font-bold text-white mb-2">Export Wall</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Download your memory wall as a PDF or image to print or share.
            </p>

            {/* Format Selection */}
            <div className="mb-6">
              <span className="block text-sm font-medium text-zinc-300 mb-3">
                Format
              </span>
              <div
                className="grid grid-cols-3 gap-2"
                role="radiogroup"
                aria-label="Export format">
                {(["pdf", "png", "jpg"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    aria-pressed={format === f}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      format === f
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {FORMAT_DESCRIPTIONS[format]}
              </p>
            </div>

            {/* Layout Selection */}
            <div className="mb-6">
              <span className="block text-sm font-medium text-zinc-300 mb-3">
                Layout
              </span>
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="Export layout">
                <button
                  type="button"
                  onClick={() => setLayout("grid")}
                  aria-pressed={layout === "grid"}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    layout === "grid"
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setLayout("list")}
                  aria-pressed={layout === "list"}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    layout === "list"
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  List
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg">
              <div className="text-sm text-zinc-400">
                <div className="flex justify-between mb-1">
                  <span>Signatures included:</span>
                  <span className="text-white font-medium">
                    {visibleEntries.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hidden (excluded):</span>
                  <span className="text-zinc-500">
                    {entries.length - visibleEntries.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || visibleEntries.length === 0}
              className="w-full px-4 py-3 bg-white text-black font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isExporting ? (
                <span
                  className="flex items-center justify-center gap-2"
                  role="status"
                  aria-live="polite">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {progress}
                </span>
              ) : (
                `Download ${format.toUpperCase()}`
              )}
            </button>
            {exportError && (
              <p className="mt-3 text-sm text-red-400 text-center" role="alert">
                {exportError}
              </p>
            )}

            {visibleEntries.length === 0 && (
              <p className="mt-3 text-sm text-zinc-500 text-center">
                No signatures to export
              </p>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-medium text-zinc-400 mb-4">Preview</h2>
            <div className="overflow-auto max-h-[80vh] rounded-lg border border-zinc-700">
              <ExportWallPreview
                ref={previewRef}
                wall={wall}
                entries={visibleEntries}
                layout={layout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
