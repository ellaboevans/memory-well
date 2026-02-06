import { ReactNode } from "react";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

interface WallLayoutProps {
  children: ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  if (!params?.slug) {
    return {
      title: "Memory Well",
      description: "Sign this memory wall and leave your message.",
      robots: { index: false, follow: false },
    };
  }
  const wall = await fetchQuery(api.walls.getBySlug, { slug: params.slug });

  if (!wall) {
    return {
      title: "Wall not found",
      description: "This memory wall does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : undefined);

  const coverImageUrl = wall.coverImageId
    ? await fetchQuery(api.walls.getCoverImageUrl, {
        storageId: wall.coverImageId,
      })
    : null;
  const fallbackShareImage = baseUrl
    ? `${baseUrl}/api/share/wall/${wall.slug}`
    : undefined;

  const url = baseUrl ? `${baseUrl}/wall/${wall.slug}` : undefined;
  const title = `${wall.title} | Memory Well`;
  const description =
    wall.description ?? "Sign this memory wall and leave your message.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: coverImageUrl
        ? [{ url: coverImageUrl }]
        : fallbackShareImage
          ? [{ url: fallbackShareImage }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: coverImageUrl
        ? [coverImageUrl]
        : fallbackShareImage
          ? [fallbackShareImage]
          : undefined,
    },
  };
}

/**
 * Layout for public wall pages
 * This wraps /wall/[slug] routes that are rewritten from subdomain requests
 */
export default function WallLayout({ children }: WallLayoutProps) {
  return <>{children}</>;
}
