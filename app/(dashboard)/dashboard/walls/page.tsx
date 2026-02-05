"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getWallUrl, getWallDisplayUrl } from "@/lib/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateWallDialog } from "@/components/dashboard/create-wall-dialog";
import { Plus, ExternalLink, ArrowRight } from "lucide-react";

export default function WallsListPage() {
  const walls = useQuery(api.walls.listMyWalls);

  const renderWallsList = () => {
    if (walls === undefined) {
      return <div className="text-zinc-400">Loading...</div>;
    }

    if (walls.length === 0) {
      return (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No walls yet
          </h2>
          <p className="text-zinc-400 mb-6">
            Create your first memory wall to start collecting signatures.
          </p>
          <CreateWallDialog>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first wall
            </Button>
          </CreateWallDialog>
        </div>
      );
    }

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Wall
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                URL
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Visibility
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {walls.map((wall) => (
              <tr
                key={wall._id}
                className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/dashboard/walls/${wall._id}`}
                    className="text-white font-medium hover:text-zinc-300">
                    {wall.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={getWallUrl(wall.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
                    {getWallDisplayUrl(wall.slug)}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                      wall.visibility === "public"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-red-900/50 text-red-400"
                    }`}>
                    {wall.visibility}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                      wall.acceptingEntries
                        ? "bg-green-900/50 text-green-400"
                        : "bg-zinc-700 text-zinc-400"
                    }`}>
                    {wall.acceptingEntries ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/walls/${wall._id}`}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white">
                    View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Walls</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage all your memory walls
          </p>
        </div>
        <CreateWallDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Wall
          </Button>
        </CreateWallDialog>
      </div>

      {renderWallsList()}
    </div>
  );
}
