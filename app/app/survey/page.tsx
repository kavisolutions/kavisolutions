import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SurveyPage } from "@/components/SurveyPage";
import { isPageEnabled } from "@/lib/pages";

export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow pt-20">
        <SurveyPage />
      </div>
      <Footer />
    </div>
  );
}
