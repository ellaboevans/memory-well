"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getWallDisplayUrl } from "@/lib/config";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateWallDialog } from "@/components/dashboard/create-wall-dialog";
import {
  Layers,
  Plus,
  TrendingUp,
  Crown,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useState } from "react";

export default function DashboardPage() {
  const profile = useQuery(api.profiles.me);
  const walls = useQuery(api.walls.listMyWalls);
  const [daysFilter, setDaysFilter] = useState<7 | 30 | 90>(30);
  const metrics = useQuery(api.analytics.getDashboardMetrics, {
    days: daysFilter,
  });

  const isWallsLoading = walls === undefined;
  const isMetricsLoading = metrics === undefined;

  const totalSignatures =
    walls?.reduce((acc, wall) => acc + (wall.entryCount ?? 0), 0) ?? 0;

  const renderWallsGrid = () => {
    if (walls === undefined) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
              <CardHeader>
                <div className="h-5 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-zinc-800 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (walls.length === 0) {
      return (
        <Card className="bg-zinc-900 border-zinc-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-zinc-800 p-3 mb-4">
              <Layers className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white">No walls yet</h3>
            <p className="text-sm text-zinc-400 mt-1 text-center max-w-sm">
              Create your first memory wall and start collecting messages from
              friends, family, or colleagues.
            </p>
            <CreateWallDialog>
              <Button className="mt-6 gap-2">
                <Plus className="h-4 w-4" />
                Create your first wall
              </Button>
            </CreateWallDialog>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {walls.slice(0, 6).map((wall) => (
          <Link key={wall._id} href={`/dashboard/walls/${wall._id}`}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-base line-clamp-1">
                    {wall.title}
                  </CardTitle>
                  <Badge
                    variant={
                      wall.visibility === "public" ? "default" : "secondary"
                    }
                    className={
                      wall.visibility === "public"
                        ? "bg-green-900/50 text-green-400 hover:bg-green-900/70"
                        : "bg-red-900/50 text-red-400 hover:bg-red-900/70"
                    }>
                    {wall.visibility}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-zinc-500">
                  <ExternalLink className="h-3 w-3" />
                  {getWallDisplayUrl(wall.slug)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span>{wall.entryCount} signatures</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Walls
            </CardTitle>
            <Layers className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {isWallsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-7 w-12 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {walls?.length ?? 0}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {profile?.tier === "premium"
                    ? "Unlimited"
                    : `${Math.max(0, 3 - (walls?.length ?? 0))} remaining on free`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Signatures
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {isWallsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-7 w-12 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {totalSignatures}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Across all your walls
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Current Plan
            </CardTitle>
            <Crown className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            {profile === undefined ? (
              <div className="animate-pulse space-y-2">
                <div className="h-7 w-16 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white capitalize">
                  {profile?.tier ?? "free"}
                </div>
                {profile?.tier !== "premium" && (
                  <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
                    Upgrade to premium
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Quick Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateWallDialog>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create New Wall
              </Button>
            </CreateWallDialog>
          </CardContent>
        </Card>
      </div>

      {/* Walls list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Your Memory Walls
          </h2>
          <Button
            variant="outline"
            asChild
            size="sm"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Link href="/dashboard/walls">View all</Link>
          </Button>
        </div>

        {renderWallsGrid()}
      </div>

      {/* Analytics */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Signature Activity
          </h2>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((range) => (
              <Button
                key={range}
                variant={daysFilter === range ? "default" : "outline"}
                size="sm"
                className={
                  daysFilter === range
                    ? ""
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }
                onClick={() => setDaysFilter(range as 7 | 30 | 90)}>
                {range}d
              </Button>
            ))}
          </div>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-base">
                  Total Signatures
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  {isMetricsLoading
                    ? "Loading activity..."
                    : `${daysFilter === 7 ? metrics?.last7 : daysFilter === 30 ? metrics?.last30 : metrics?.last90} in the last ${daysFilter} days`}
                </CardDescription>
              </div>
              <div className="flex gap-4 text-sm text-zinc-400">
                <div>
                  <div className="text-white font-semibold">
                    {metrics ? metrics.last7 : 0}
                  </div>
                  <div className="text-xs text-zinc-500">Last 7 days</div>
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {metrics ? metrics.total : 0}
                  </div>
                  <div className="text-xs text-zinc-500">Total</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <div className="h-[240px] w-full animate-pulse rounded-lg bg-zinc-800" />
            ) : (
              <ChartContainer
                config={{
                  signatures: {
                    label: "Signatures",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.series ?? []}>
                    <defs>
                      <linearGradient
                        id="fillSignatures"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-chart-1)"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-chart-1)"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={20}
                      tickFormatter={(value: string) =>
                        format(parseISO(value), "MMM d")
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            format(parseISO(value), "PPP")
                          }
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Signatures"
                      stroke="var(--color-chart-1)"
                      fill="url(#fillSignatures)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
