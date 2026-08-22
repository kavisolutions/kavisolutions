import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Web Development | Kavi Solutions",
  description:
    "Blazing-fast websites and web apps built with Next.js, React and TypeScript. SEO-first, mobile-responsive and production-ready.",
};

export default function WebPage() {
  return <ServicePage data={services.web} />;
}
