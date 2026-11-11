import { cache } from "react";

/* Server-only helper for the public page switches.
 *
 * The switches live in the admin panel (`app_settings`), not in environment
 * variables, because publishing a page should not need a rebuild. The check
 * therefore runs per request: set `dynamic = "force-dynamic"` on any route
 * that calls this, otherwise Next.js would bake the answer into a static page
 * at build time and a toggle would appear to do nothing. */

export type GatedPage = "survey" | "financial";

export type PageVisibility = Record<GatedPage, boolean>;

const backendUrl = (): string =>
  (
    process.env.BACKEND_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3200" : "")
  ).replace(/\/+$/, "");

/* Wrapped in React's cache so a route that calls this from both
   `generateMetadata` and the page component fetches it once per request. */
export const pageVisibility = cache(async (): Promise<PageVisibility> => {
  const hidden: PageVisibility = { survey: false, financial: false };
  const base = backendUrl();
  if (!base) return hidden;

  try {
    const res = await fetch(`${base}/api/pages`, { cache: "no-store" });
    if (!res.ok) return hidden;

    const data = (await res.json()) as { pages?: Partial<PageVisibility> };
    return {
      survey: data.pages?.survey === true,
      financial: data.pages?.financial === true,
    };
  } catch {
    /* Fail closed: an unreachable API must hide the page rather than publish
       work nobody approved. */
    return hidden;
  }
});

export const isPageEnabled = async (page: GatedPage): Promise<boolean> => {
  const visibility = await pageVisibility();
  return visibility[page];
};
