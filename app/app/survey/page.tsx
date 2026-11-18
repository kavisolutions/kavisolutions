import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SurveyPage } from "@/components/SurveyPage";
import { apiBaseUrl, isPageEnabled } from "@/lib/pages";

export const dynamic = "force-dynamic";

type Opportunity = { name: string; note: string };

/* Admin-editable business development list. The bundled list is the fallback
   when the API is unreachable or the setting has never been filled in. */
async function loadOpportunities(): Promise<Opportunity[] | undefined> {
  const base = apiBaseUrl();
  if (!base) return undefined;

  try {
    const res = await fetch(`${base}/api/survey/opportunities`, { cache: "no-store" });
    if (!res.ok) return undefined;

    const data = (await res.json()) as { opportunities?: Opportunity[] };
    const opportunities = Array.isArray(data.opportunities)
      ? data.opportunities.filter((item) => item && typeof item.name === "string")
      : [];

    return opportunities.length ? opportunities : undefined;
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isPageEnabled("survey");

  return {
    title: "Survey & Research Solutions | Kavi Solutions",
    description:
      "Field surveys, market research, political and social research, data analysis and reporting across India. End-to-end research execution from questionnaire design to final report.",
    /* The 404 already prevents indexing, but keep the directive explicit so a
       crawler that reaches the metadata still sees a hidden page. */
    robots: enabled ? undefined : { index: false, follow: false },
  };
}

export default async function SurveyRoute() {
  if (!(await isPageEnabled("survey"))) notFound();

  const opportunities = await loadOpportunities();

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow pt-20">
        <SurveyPage opportunities={opportunities} />
      </div>
      <Footer />
    </div>
  );
}
