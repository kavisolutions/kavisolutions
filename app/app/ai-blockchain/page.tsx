import type { Metadata } from "next";

import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "AI & Blockchain Development | Kavi Solutions",
  description:
    "Two separate practices: AI integration, agentic workflows, RAG and vector search; and blockchain smart contracts, public/private/consortium chains, Hedera, tokenomics and DeFi.",
};

export default function AiBlockchainPage() {
  return <ServicePage data={services["ai-blockchain"]} />;
}
