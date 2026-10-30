import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened on a phone through a Cloudflare quick tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // Hides the Next.js dev indicator; compile and runtime errors still show.
  devIndicators: false,
  // The photo spots map moved to its own app, ShotMap. Old links and bookmarks still work.
  async redirects() {
    return [
      { source: "/maps", destination: "https://shot-map-seven.vercel.app/", permanent: false },
      {
        source: "/maps/:path*",
        destination: "https://shot-map-seven.vercel.app/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
