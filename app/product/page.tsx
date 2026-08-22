import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Digital Products | Kavi Solutions",
  description:
    "From idea to launch — product strategy, UX/UI design, design systems and MVP sprints that ship products people adopt.",
};

export default function ProductPage() {
  return <ServicePage data={services.product} />;
}