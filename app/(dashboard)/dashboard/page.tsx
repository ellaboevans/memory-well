"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function DashboardPage() {
  const profile = useQuery(api.profiles.me);
  const walls = useQuery(api.walls.listMyWalls);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{profile?.displayName ? `, ${profile.displayName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your memory walls and view signatures
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400 truncate">
            Total Walls
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-white">
            {walls?.length ?? 0}
          </dd>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400 truncate">
            Plan
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-white capitalize">
            {profile?.tier ?? "free"}
          </dd>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-5">
          <dt className="text-sm font-medium text-zinc-400 truncate">
            Walls Remaining
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-white">
            {profile?.tier === "premium" 
              ? "Unlimited" 
              : Math.max(0, 3 - (walls?.length ?? 0))}
          </dd>
        </div>
      </div>

      {/* Walls list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Memory Walls</h2>
          <Link
            href="/dashboard/walls/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors"
          >
            Create Wall
          </Link>
        </div>

        {walls === undefined ? (
          <div className="text-zinc-400">Loading...</div>
        ) : walls.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No walls yet</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Get started by creating your first memory wall.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/walls/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-zinc-200 transition-colors"
              >
                Create your first wall
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {walls.map((wall) => (
              <Link
                key={wall._id}
                href={`/dashboard/walls/${wall._id}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <h3 className="text-white font-medium group-hover:text-zinc-300">
                  {wall.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {wall.slug}.memorywell.app
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    wall.visibility === "public" 
                      ? "bg-green-900/50 text-green-400" 
                      : wall.visibility === "unlisted"
                      ? "bg-yellow-900/50 text-yellow-400"
                      : "bg-red-900/50 text-red-400"
                  }`}>
                    {wall.visibility}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
