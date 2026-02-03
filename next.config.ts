import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for subdomain routing
  experimental: {
    // Allow proxy.ts to handle subdomain routing
  },
  
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },

  // Async headers for CORS if needed
  async headers() {
    return [
      {
        // Allow embedding walls in iframes (for preview)
        source: "/wall/:slug*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
