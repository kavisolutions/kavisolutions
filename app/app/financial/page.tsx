import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinancialPage } from "@/components/FinancialPage";
import { isPageEnabled } from "@/lib/pages";

/* Unpublished until an administrator switches it on in the admin panel
   (Settings → Live pages). The check runs per request, so the toggle applies
   immediately and no rebuild is needed. While it is off the route returns a
   real 404 and is marked noindex, so it cannot be indexed or linked by
   accident. See docs/financial-page.md. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isPageEnabled("financial");

  return {
    title: "Financial Services | Kavi Solutions",
    description:
      "Income tax filing, tax planning, accounting, cash flow management and financial planning for individuals and businesses across India.",
    robots: enabled ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function FinancialRoute() {
  if (!(await isPageEnabled("financial"))) notFound();
  return <FinancialPage />;
}
