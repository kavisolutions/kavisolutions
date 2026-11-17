import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FellowshipPage from "@/components/FellowshipPage";

export const metadata: Metadata = {
  title: "Kavi Fellowship — 11-Month Programme | Kavi Solutions",
  description:
    "An 11-month cohort fellowship for diploma students, final-year students, graduates and people returning to work. Vipassana, YLTP, DSN, real projects and a public capstone.",
  alternates: { canonical: "/fellowship" },
};

const fellowshipJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  name: "Kavi Fellowship",
  description:
    "An 11-month full-time cohort fellowship in Andhra Pradesh and Telangana combining Vipassana, YLTP leadership practice, DSN field service, live projects, mentorship and a public capstone.",
  programType: "Fellowship",
  timeToComplete: "P11M",
  educationalCredentialAwarded: "Kavi Fellowship completion certificate",
  provider: {
    "@type": "Organization",
    name: "Kavi Solutions",
    url: "https://kavisolutions.in",
  },
  url: "https://kavisolutions.in/fellowship",
  occupationalCategory: [
    "Software development",
    "Research and field operations",
    "Marketing and communications",
    "Operations and finance",
  ],
  offers: {
    "@type": "Offer",
    category: "Fellowship application",
    url: "https://kavisolutions.in/fellowship#apply",
  },
};

export default function Fellowship() {
  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fellowshipJsonLd) }}
      />
      <Navbar />
      <div className="flex-grow">
        <FellowshipPage />
      </div>
      <Footer />
    </div>
  );
}
