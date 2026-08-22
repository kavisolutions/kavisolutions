import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Digital Marketing | Kavi Solutions",
  description:
    "Data-driven SEO, paid ads, content and social campaigns that grow your audience and compound revenue.",
};

export default function MarketingPage() {
  return <ServicePage data={services.marketing} />;
}