import type { NextConfig } from "next";
import path from "node:path";

const backendUrl = (
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3200" : "")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* The Docker image runs the standalone server, which keeps the runtime
     image small and avoids shipping the full node_modules tree. */
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
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
