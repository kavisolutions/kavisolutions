import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Mobile Development | Kavi Solutions",
  description:
    "Native-feel iOS and Android apps with React Native and Flutter. Push, offline-first, payments and App Store launch support.",
};

export default function MobilePage() {
  return <ServicePage data={services.mobile} />;
}
