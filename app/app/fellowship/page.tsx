import type { Metadata } from "next";
import FellowshipPage from "@/components/FellowshipPage";

export const metadata: Metadata = {
  title: "Kavi Fellowship — 11-Month Programme | Kavi Solutions",
  description:
    "An 11-month cohort fellowship for diploma students, final-year students, graduates and people returning to work. Vipassana, YLTP, DSN, real projects and a public capstone.",
};

export default function Fellowship() {
  return <FellowshipPage />;
}
