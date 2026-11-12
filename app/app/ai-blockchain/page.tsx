import type { Metadata } from "next";

import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "AI & Blockchain Development | Kavi Solutions",
  description:
    "AI assistants, retrieval, document intelligence, computer vision, smart contracts and auditable blockchain systems — built and shipped for production.",
};

export default function AiBlockchainPage() {
  return <ServicePage data={services["ai-blockchain"]} />;
}
