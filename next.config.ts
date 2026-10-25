import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened on a phone through a Cloudflare quick tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // Hides the Next.js dev indicator; compile and runtime errors still show.
  devIndicators: false,
};

export default nextConfig;
