"use client";

import Link from "next/link";
import { ArrowRight, Cpu, ShieldCheck } from "lucide-react";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

export default function EmergingTech() {
  return (
    <section id="ai-blockchain" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#06B6D4]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7889A0]">
              DEEP TECH ARCHITECTURE
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] mb-4">
            AI and blockchain, without the theatre
          </h2>
          <p className="text-base leading-relaxed text-[#A5B3C7]">
            We don&apos;t pitch buzzwords. We build deterministic, test-covered systems where
            cryptographic security and machine intelligence provide genuine competitive advantages.
          </p>
        </Reveal>

        {/* Side-by-side Architectural Feature Cards with 3D Tilt */}
        <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: AI Architecture */}
          <RevealItem>
            <TiltCard
              intensity={8}
              className="group relative h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3B82F6]/15 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6]" />

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] flex items-center justify-center mb-6 text-[#91B4FF]">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#F7F9FC] mb-3">
                  AI that earns its place in the product
                </h3>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                  Applied machine intelligence focused on real operational utility — structured
                  schema extraction, deterministic evaluation loops, and low-latency agents with
                  strict hallucination firewalls.
                </p>

                {/* Architectural Mini Pipeline Visualizer */}
                <div className="w-full rounded-xl bg-[#06060F]/90 border border-[rgba(148,163,184,0.14)] p-4 mb-6 font-mono text-[12px]">
                  <div className="flex items-center justify-between text-[#7889A0] pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                    <span className="flex items-center gap-1.5 font-semibold text-[#91B4FF]">
                      <span className="h-2 w-2 rounded-full bg-[#45dfa4] animate-pulse" />{" "}
                      AGENT_RUNNER_V2
                    </span>
                    <span className="text-[11px] text-[#A5B3C7]">LATENCY: 142ms</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded bg-[#19202E] border border-[rgba(148,163,184,0.1)] text-[#F7F9FC]">
                      1. Semantic RAG
                    </div>
                    <div className="p-2 rounded bg-[#19202E] border border-[rgba(148,163,184,0.1)] text-[#91B4FF]">
                      2. Strict Guard
                    </div>
                    <div className="p-2 rounded bg-[#19202E] border border-[rgba(148,163,184,0.1)] text-[#45dfa4]">
                      3. Typed Output
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    "LLM apps & agents",
                    "RAG & Vector Embeddings",
                    "Document intelligence",
                    "Self-hosted Models",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="px-3.5 py-1.5 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-xs text-[#A5B3C7]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <Link
                  href="/ai-blockchain"
                  className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-medium text-[#91B4FF] group-hover:text-white transition-colors"
                >
                  <span>Review AI architecture benchmarks</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </TiltCard>
          </RevealItem>

          {/* Card 2: Blockchain Architecture */}
          <RevealItem>
            <TiltCard
              intensity={8}
              className="group relative h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#06B6D4]/15 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#06B6D4] to-[#45dfa4]" />

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] flex items-center justify-center mb-6 text-[#45dfa4]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#F7F9FC] mb-3">
                  Trust infrastructure, not hype
                </h3>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                  Decentralized state machines and zero-knowledge cryptographic verification
                  engineered for auditable enterprise workflows, supply chains, and transparent asset
                  settlement.
                </p>

                {/* Cryptographic Audit Pipeline Visualizer */}
                <div className="w-full rounded-xl bg-[#06060F]/90 border border-[rgba(148,163,184,0.14)] p-4 mb-6 font-mono text-[12px]">
                  <div className="flex items-center justify-between text-[#7889A0] pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                    <span className="flex items-center gap-1.5 font-semibold text-[#45dfa4]">
                      <span className="h-2 w-2 rounded-full bg-[#45dfa4] animate-pulse" />{" "}
                      ZK_STATE_VERIFIED
                    </span>
                    <span className="text-[11px] text-[#A5B3C7]">PROOF_BLOCK #89421</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded bg-[#19202E] border border-[rgba(148,163,184,0.1)] text-[#F7F9FC]">
                      1. Hash Merkle
                    </div>
                    <div className="p-2 rounded bg-[#19202E] border border-[rgba(148,163,184,0.1)] text-[#06B6D4]">
                      2. Multi-Sig Auth
                    </div>
                    <div className="p-2 rounded bg-[#19202E] border border-[rgba(148,163,184,0.1)] text-[#45dfa4]">
                      3. Finality 0s
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    "Smart contracts (EVM)",
                    "Auditable Ledgers",
                    "Zero-Knowledge Proofs",
                    "Hardware Integration",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="px-3.5 py-1.5 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-xs text-[#A5B3C7]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <Link
                  href="/ai-blockchain"
                  className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-medium text-[#91B4FF] group-hover:text-white transition-colors"
                >
                  <span>Review security verification reports</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </TiltCard>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
