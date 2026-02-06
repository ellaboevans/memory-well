"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SignWallPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/wall/${slug}?sign=1`);
    }
  }, [router, slug]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-pulse text-zinc-400">Loading sign form...</div>
    </div>
  );
}
