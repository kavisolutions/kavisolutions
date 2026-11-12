import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FarmsPage } from "@/components/FarmsPage";
import { isPageEnabled } from "@/lib/pages";

/* Unpublished until an administrator switches it on in the admin panel
   (Settings → Live pages). */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isPageEnabled("farms");

  return {
    title: "Kavi Farms — Farm Products & Village Tourism | Kavi Solutions",
    description:
      "Farm-grown produce and weekend village experiences from Polepalli, Palnadu, Andhra Pradesh. Product enquiries and tourism packages.",
    robots: enabled ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function FarmsRoute() {
  if (!(await isPageEnabled("farms"))) notFound();
  return <FarmsPage />;
}
