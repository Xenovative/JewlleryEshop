import type { NextConfig } from "next";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

// Load .env from the monorepo root so all workspaces share one source of truth.
loadEnvConfig(path.resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  transpilePackages: ["@lumiere/db"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Backoffice product images are up to 5 MB; Next defaults are much smaller for parsed bodies.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
