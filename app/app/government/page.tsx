import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GovernmentPage } from "@/components/GovernmentPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Government Technology Services | Kavi Solutions",
    description:
      "Modernisation, security and digital service delivery for government websites, examination portals and citizen-facing platforms across India.",
  };
}

export default async function GovernmentRoute() {
  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow pt-20">
        <GovernmentPage />
      </div>
      <Footer />
    </div>
  );
}
