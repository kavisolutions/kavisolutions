import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinancialPage } from "@/components/FinancialPage";

/* Built but deliberately not launched. Set FINANCIAL_PAGE_ENABLED=true in the
   build environment and rebuild to publish. Until then the route 404s and is
   marked noindex, so it cannot be found or linked by accident.
   See docs/financial-page.md. */
const enabled = process.env.FINANCIAL_PAGE_ENABLED === "true";

export const metadata: Metadata = {
  title: "Financial Services | Kavi Solutions",
  description:
    "Income tax filing, tax planning, accounting, cash flow management and financial planning for individuals and businesses across India.",
  robots: enabled ? { index: true, follow: true } : { index: false, follow: false },
};

export default function FinancialRoute() {
  if (!enabled) notFound();
  return <FinancialPage />;
}
