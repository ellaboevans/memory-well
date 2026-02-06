"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { SignWallDialog } from "@/components/wall/sign-wall-dialog";
import { EntriesList } from "@/components/wall/entries-list";
import { LogoMark } from "@/components/brand/logo";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const wall = useQuery(api.walls.getBySlug, { slug });
  const {
    results: entries,
    status: entriesStatus,
    loadMore,
  } = usePaginatedQuery(
    api.entries.listByWallPaginated,
    wall ? { wallId: wall._id } : "skip",
    { initialNumItems: 8 },
  );
  const trackWallView = useMutation(api.analytics.trackWallView);
  const [now, setNow] = useState(() => Date.now());
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const windowNotStarted =
    wall?.entryWindowStart !== undefined && now < wall.entryWindowStart;
  const windowClosed =
    wall?.entryWindowEnd !== undefined && now > wall.entryWindowEnd;
  const canSign = Boolean(
    wall?.acceptingEntries && !windowNotStarted && !windowClosed,
  );

  useEffect(() => {
    if (!wall) return;
    let cancelled = false;
    const track = async () => {
      try {
        const visitorKey = "mw_visitor_id";
        let visitorId = localStorage.getItem(visitorKey);
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem(visitorKey, visitorId);
        }
        const geo = await fetch("/api/geo").then((res) => res.json());
        if (cancelled) return;
        await trackWallView({
          wallId: wall._id,
          visitorId,
          countryCode: geo.countryCode,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        });
      } catch {
        // noop
      }
    };
    track();
    return () => {
      cancelled = true;
    };
  }, [trackWallView, wall]);

  const queryWantsOpen = canSign && searchParams.get("sign") === "1";
  const signDialogOpen = queryWantsOpen || manualDialogOpen;

  const handleOpenSignDialog = () => {
    if (!canSign) return;
    setManualDialogOpen(true);
    router.replace(`/wall/${slug}?sign=1`, { scroll: false });
  };

  const handleSignDialogChange = (open: boolean) => {
    setManualDialogOpen(open);
    if (!open && searchParams.get("sign") === "1") {
      router.replace(`/wall/${slug}`, { scroll: false });
    }
  };

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
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {canSign && (
              <button
                type="button"
                onClick={handleOpenSignDialog}
                className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: primaryColor,
                  color: buttonTextColor,
                }}>
                Sign This Wall ✍️
              </button>
            )}
            <Link
              href={`/wall/${slug}/canvas`}
              className="inline-flex items-center px-5 py-3 border rounded-md text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                borderColor,
                color: primaryColor,
              }}>
              Explore canvas view
            </Link>
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
        <div className="space-y-4">
          {wall && (
            <p className="text-sm opacity-50" style={{ color: primaryColor }}>
              {entries.length} signature{entries.length === 1 ? "" : "s"}
            </p>
          )}
          <EntriesList
            entries={entries}
            primaryColor={primaryColor}
            borderColor={borderColor}
            cardBgColor={cardBgColor}
            status={entriesStatus}
            onLoadMore={loadMore}
            onEmpty={
              wall.acceptingEntries ? (
                <div className="space-y-4">
                  <div className="text-6xl">📝</div>
                  <div>
                    <h2
                      className="text-xl font-semibold mb-2"
                      style={{ color: primaryColor }}>
                      No signatures yet
                    </h2>
                    <p className="opacity-60" style={{ color: primaryColor }}>
                      Be the first to sign this memory wall!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenSignDialog}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: primaryColor,
                      color: buttonTextColor,
                    }}>
                    Add your signature
                  </button>
                </div>
              ) : null
            }
          />
        </div>
      </main>

      {wall && (
        <SignWallDialog
          open={signDialogOpen}
          onOpenChange={handleSignDialogChange}
          wall={wall}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
        />
      )}

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
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ color: primaryColor }}>
              <LogoMark className="size-5" iconClassName="size-3.5" />
              Memory Well
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
