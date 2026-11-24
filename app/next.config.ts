import type { NextConfig } from "next";
import path from "node:path";

const backendUrl = (
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3200" : "")
).replace(/\/+$/, "");

/* Rewrites are baked into the build. Silently emitting no /api rewrite makes
   every call 404 at runtime, so fail the build instead of shipping a broken
   deployment. deploy.sh and the Docker build both set BACKEND_URL. */
if (process.env.NODE_ENV === "production" && !backendUrl) {
  throw new Error("BACKEND_URL must be set for a production build");
}

/* `/survey` is owned by the standalone kavi-survey-research service. In
   production nginx proxies it before Next.js; locally and in Docker the main
   app proxies it so the public URL stays the same. */
const surveyUrl = (
  process.env.SURVEY_SERVICE_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3004" : "")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* The Docker image runs the standalone server, which keeps the runtime
     image small and avoids shipping the full node_modules tree. */
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    const beforeFiles: { source: string; destination: string }[] = [];

    if (surveyUrl) {
      beforeFiles.push(
        { source: "/survey", destination: `${surveyUrl}/survey` },
        { source: "/survey/:path*", destination: `${surveyUrl}/survey/:path*` },
      );
    }

    if (backendUrl) {
      beforeFiles.push({
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      });
    }

    return {
      beforeFiles,
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
