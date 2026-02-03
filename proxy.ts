import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain-based multi-tenancy routing
 *
 * Routes:
 * - app.memorywell.app → /dashboard (authenticated area)
 * - {slug}.memorywell.app → /wall/{slug} (public wall view)
 * - memorywell.app → / (marketing/landing)
 * - localhost:3000 → / (development fallback)
 */

// Subdomains reserved for app functionality (not wall slugs)
const RESERVED_SUBDOMAINS = new Set([
  "app", // Dashboard
  "www", // Marketing redirect
  "api", // Future API subdomain
  "admin", // Future admin panel
]);

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Extract subdomain from hostname
  // Handles: slug.memorywell.app, slug.localhost:3000, etc.
  const subdomain = extractSubdomain(hostname);

  // No subdomain or www → serve marketing site as-is
  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  // app.* subdomain → rewrite to dashboard routes
  if (subdomain === "app") {
    // If accessing root of app subdomain, redirect to /dashboard
    if (url.pathname === "/") {
      url.pathname = "/dashboard";
      return NextResponse.rewrite(url);
    }
    // Otherwise, let it pass through (dashboard routes)
    return NextResponse.next();
  }

  // Any other subdomain is treated as a wall slug
  // Rewrite {slug}.domain → /wall/{slug}
  if (!RESERVED_SUBDOMAINS.has(subdomain)) {
    // Preserve the original path for wall sub-routes (e.g., /sign, /gallery)
    const wallPath =
      url.pathname === "/"
        ? `/wall/${subdomain}`
        : `/wall/${subdomain}${url.pathname}`;

    url.pathname = wallPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

/**
 * Extract subdomain from hostname
 *
 * Examples:
 * - sarah-wedding.memorywell.app → sarah-wedding
 * - app.memorywell.app → app
 * - memorywell.app → null
 * - sarah-wedding.localhost:3000 → sarah-wedding (dev)
 * - localhost:3000 → null (dev)
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(":")[0];

  // Development: handle *.localhost
  if (host.endsWith(".localhost") || host.includes(".localhost")) {
    const parts = host.split(".");
    if (parts.length >= 2 && parts[0] !== "localhost") {
      return parts[0];
    }
    return null;
  }

  // Production: handle *.memorywell.app (or your actual domain)
  // Also handles *.vercel.app for preview deployments
  const parts = host.split(".");

  // Need at least 3 parts for a subdomain (sub.domain.tld)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
  ],
};
