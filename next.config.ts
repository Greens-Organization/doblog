import { isDevelopment } from "@/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  logging: {
    fetches: {
      fullUrl: isDevelopment
    }
  }
};

export default nextConfig;
