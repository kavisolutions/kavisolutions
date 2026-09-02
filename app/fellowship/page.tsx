import type { Metadata } from "next";
import FellowshipPage from "@/components/FellowshipPage";

export const metadata: Metadata = {
  title: "Kavi Fellows — 12-Week Fellowship Program | Kavi Solutions",
  description:
    "A 12-week immersive program where students and early-career devs build real products, learn from pros and get hired. Apply now for the next cohort.",
};

export default function Fellowship() {
  return <FellowshipPage />;
}
