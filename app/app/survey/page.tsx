import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SurveyPage } from "@/components/SurveyPage";

/* This page is built but deliberately not launched. Set SURVEY_PAGE_ENABLED=true
   (in app/.env.production on the server) and redeploy to publish it. Until then
   the route 404s, so the page cannot be indexed or linked by accident.
   See docs/survey-page.md for the enable/handover notes. */
const enabled = process.env.SURVEY_PAGE_ENABLED === "true";

export const metadata: Metadata = {
  title: "Survey & Research Solutions | Kavi Solutions",
  description:
    "Field surveys, market research, political and social research, data analysis and reporting across India. End-to-end research execution from questionnaire design to final report.",
  robots: enabled ? { index: true, follow: true } : { index: false, follow: false },
};

export default function SurveyRoute() {
  if (!enabled) notFound();
  return <SurveyPage />;
}
