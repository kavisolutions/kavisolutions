import type { NextConfig } from "next";

const backendUrl = (
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3200" : "")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
