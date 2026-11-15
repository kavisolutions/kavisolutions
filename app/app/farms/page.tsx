import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FarmsPage } from "@/components/FarmsPage";
import { isPageEnabled } from "@/lib/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kavi Farms — Farm Products & Village Tourism | Kavi Solutions",
    description:
      "Farm-grown produce and weekend village experiences from Polepalli, Palnadu, Andhra Pradesh. Product enquiries and tourism packages.",
  };
}

export default async function FarmsRoute() {
  if (!(await isPageEnabled("farms"))) notFound();

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow pt-20">
        <FarmsPage />
      </div>
      <Footer />
    </div>
  );
}
