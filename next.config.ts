import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
