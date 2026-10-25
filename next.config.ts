import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened on a phone through a Cloudflare quick tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // Hides the Next.js dev indicator; compile and runtime errors still show.
  devIndicators: false,
  images: {
    // Spot photos live in Vercel Blob. Allowing them here lets next/image resize them and
    // serve WebP at the size each one is shown, instead of the original upload.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/spots/**" },
    ],
  },
};

export default nextConfig;
