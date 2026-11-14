import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SurveyPage } from "@/components/SurveyPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Survey & Research Solutions | Kavi Solutions",
    description:
      "Field surveys, market research, political and social research, data analysis and reporting across India. End-to-end research execution from questionnaire design to final report.",
  };
}

export default async function SurveyRoute() {
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
