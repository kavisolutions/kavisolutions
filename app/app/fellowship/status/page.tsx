import type { Metadata } from "next";
import FellowshipStatusLookup from "@/components/FellowshipStatusLookup";

export const metadata: Metadata = {
  title: "Application Status — Kavi Fellowship | Kavi Solutions",
  description:
    "Check the recorded stage of your Kavi Fellowship application with your reference and email.",
  robots: { index: false, follow: false },
};

export default function FellowshipStatusPage() {
  return <FellowshipStatusLookup />;
}
