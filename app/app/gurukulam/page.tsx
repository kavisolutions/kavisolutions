import type { Metadata } from "next";

import Footer from "@/components/Footer";
import GurukulamPage from "@/components/GurukulamPage";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Kavi Gurukulam — Learn, Build, Earn, Return | Kavi Solutions",
  description:
    "The proposed Kavi Gurukulam pathway: training, client work, a stipend from month 6, a month-12 review, placement support and a return route for people who lose a job.",
  alternates: { canonical: "/gurukulam" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Kavi Gurukulam",
  description:
    "A proposed long-term learning and work pathway for candidates and returners, with training, client projects and a stipend schedule.",
  url: "https://kavisolutions.in/gurukulam",
  parentOrganization: {
    "@type": "Organization",
    name: "Kavi Solutions",
    url: "https://kavisolutions.in",
  },
};

export default function GurukulamRoute() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-grow">
        <GurukulamPage />
      </main>
      <Footer />
    </div>
  );
}
