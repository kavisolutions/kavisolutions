import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SurveyPage } from "@/components/SurveyPage";
import { isPageEnabled } from "@/lib/pages";

/* Unpublished until an administrator switches it on in the admin panel
   (Settings → Live pages). The check runs per request, so the toggle applies
   immediately and no rebuild is needed. While it is off the route returns a
   real 404 and is marked noindex, so it cannot be indexed or linked by
   accident. See docs/survey-page.md. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isPageEnabled("survey");

  return {
    title: "Survey & Research Solutions | Kavi Solutions",
    description:
      "Field surveys, market research, political and social research, data analysis and reporting across India. End-to-end research execution from questionnaire design to final report.",
    robots: enabled ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function SurveyRoute() {
  if (!(await isPageEnabled("survey"))) notFound();
  return <SurveyPage />;
}
