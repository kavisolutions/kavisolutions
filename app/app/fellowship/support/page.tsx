import type { Metadata } from "next";

import DonationPledge from "@/components/DonationPledge";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Support the Kavi Fellowship — Scholarships, Equipment and Stipends",
  description:
    "Pledge a scholarship, laptop, data, travel or stipend bridge for a Kavi Fellowship candidate. No online payment; the team confirms every pledge in writing.",
  alternates: { canonical: "/fellowship/support" },
};

export default function FellowshipSupportPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-ink">
      <Navbar />
      <main className="flex-grow">
        <DonationPledge />
      </main>
      <Footer />
    </div>
  );
}
