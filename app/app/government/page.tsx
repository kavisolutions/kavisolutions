import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GovernmentPage } from "@/components/GovernmentPage";
import { isPageEnabled } from "@/lib/pages";

/* Unpublished until an administrator switches it on in the admin panel
   (Settings → Live pages). The check runs per request, so the toggle applies
   immediately and no rebuild is needed. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isPageEnabled("government");

  return {
    title: "Government Technology Services | Kavi Solutions",
    description:
      "Modernisation, security and digital service delivery for government websites, examination portals and citizen-facing platforms across India.",
    robots: enabled ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function GovernmentRoute() {
  if (!(await isPageEnabled("government"))) notFound();
  return <GovernmentPage />;
}
