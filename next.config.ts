import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened on a phone through a Cloudflare quick tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
