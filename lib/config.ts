/**
 * App configuration
 * Uses environment variables with fallbacks for development
 */

// The base domain for the app (without protocol)
// In dev: localhost:3000
// In prod: yourdomain.com
export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_APP_DOMAIN ||
  (globalThis.window === undefined
    ? "localhost:3000"
    : globalThis.window.location.host);

// The protocol to use
export const APP_PROTOCOL =
  process.env.NEXT_PUBLIC_APP_PROTOCOL ||
  (globalThis.window === undefined
    ? "http"
    : globalThis.window.location.protocol.replace(":", ""));

// Full base URL
export const APP_URL = `${APP_PROTOCOL}://${APP_DOMAIN}`;

// App name
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Memory Well";

/**
 * Get the full URL for a wall
 * In dev: http://localhost:3000/wall/my-wall
 * In prod with subdomains: https://my-wall.yourdomain.com
 */
export function getWallUrl(slug: string): string {
  // In development, use path-based routing
  if (
    process.env.NODE_ENV === "development" ||
    APP_DOMAIN.includes("localhost")
  ) {
    return `${APP_URL}/wall/${slug}`;
  }
  // In production, use subdomain-based routing
  return `${APP_PROTOCOL}://${slug}.${APP_DOMAIN}`;
}

/**
 * Get the display URL for a wall (for showing to users)
 */
export function getWallDisplayUrl(slug: string): string {
  if (
    process.env.NODE_ENV === "development" ||
    APP_DOMAIN.includes("localhost")
  ) {
    return `${APP_DOMAIN}/wall/${slug}`;
  }
  return `${slug}.${APP_DOMAIN}`;
}

/**
 * Get the domain suffix for slug inputs
 */
export function getDomainSuffix(): string {
  if (
    process.env.NODE_ENV === "development" ||
    APP_DOMAIN.includes("localhost")
  ) {
    return `${APP_DOMAIN}/wall/`;
  }
  return `${APP_DOMAIN}/`;
}
