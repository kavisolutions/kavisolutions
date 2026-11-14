import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FellowshipPage from "@/components/FellowshipPage";

export const metadata: Metadata = {
  title: "Kavi Fellowship — 11-Month Programme | Kavi Solutions",
  description:
    "An 11-month cohort fellowship for diploma students, final-year students, graduates and people returning to work. Vipassana, YLTP, DSN, real projects and a public capstone.",
};

export default function Fellowship() {
  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow">
        <FellowshipPage />
      </div>
      <Footer />
    </div>
  );
}
