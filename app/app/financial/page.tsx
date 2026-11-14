import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FinancialPage } from "@/components/FinancialPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Financial Services | Kavi Solutions",
    description:
      "Income tax filing, tax planning, accounting, cash flow management and financial planning for individuals and businesses across India.",
  };
}

export default async function FinancialRoute() {
  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow pt-20">
        <FinancialPage />
      </div>
      <Footer />
    </div>
  );
}
