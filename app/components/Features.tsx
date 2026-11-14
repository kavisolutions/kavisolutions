"use client";

import { Cloud, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

const principles = [
  {
    icon: Gauge,
    title: "Performance first",
    desc: "Sub-second serverless rendering, ultra-lean client bundles, and 0ms cumulative layout shift baked into every deployment pipeline.",
    metric: "Lighthouse: 99+ avg",
    metricColor: "text-[#45dfa4]",
  },
  {
    icon: Sparkles,
    title: "Design that sells",
    desc: "High-density information hierarchy, deliberate typography scales, and tactile micro-interactions that turn passive visitors into buyers.",
    metric: "Conversion lift: +38%",
    metricColor: "text-[#91B4FF]",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "Strict zero-trust architectures, automated dependency vulnerability triggers, and cryptographic boundary isolations on every tenant.",
    metric: "SOC2 & OWASP Level 3",
    metricColor: "text-[#45dfa4]",
  },
  {
    icon: Cloud,
    title: "Shipped to scale",
    desc: "Stateless backend services and self-healing elastic clusters capable of absorbing sudden 10x traffic spikes with flat zero degradation.",
    metric: "Uptime target: 99.99%",
    metricColor: "text-[#91B4FF]",
  },
];

export default function Features() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              ENGINEERING PRINCIPLES
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] max-w-2xl mb-4">
            Built to impress. Engineered to last.
          </h2>
          <p className="text-base leading-relaxed text-[#A5B3C7] max-w-xl">
            Standard studio deliverables decay quickly. We construct digital products with long
            operational half-lives.
          </p>
        </Reveal>

        {/* 4-Card Grid with Gradient Top Bar and 3D Tilt */}
        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <RevealItem key={p.title}>
                <TiltCard
                  intensity={10}
                  className="group relative h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] overflow-hidden flex flex-col p-6 sm:p-7 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.4)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
                  <div className="w-11 h-11 rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] flex items-center justify-center mb-6 mt-1 text-[#91B4FF] group-hover:bg-[#175CD3] group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#F7F9FC] mb-2.5">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#A5B3C7] mb-6 flex-grow">
                    {p.desc}
                  </p>
                  <span className={`text-[11px] font-mono font-medium ${p.metricColor} mt-auto`}>
                    {p.metric}
                  </span>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
