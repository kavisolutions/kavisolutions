import type { Metadata } from "next";

import SurveyAdmin from "@/components/admin/survey/SurveyAdmin";

export const metadata: Metadata = {
  title: "Survey content — Kavi Solutions Admin",
  description: "Edit the Survey & Research page, surveyors and enquiries.",
};

export default function AdminSurveyPage() {
  return <SurveyAdmin />;
}
