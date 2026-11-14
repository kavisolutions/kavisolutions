"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { GlowOrb, Reveal, TiltCard } from "./motion";

const stats = [
  { value: "120+", label: "Production Systems Shipped", dot: "bg-[#3B82F6]" },
  { value: "40+", label: "Enterprise & Studio Clients", dot: "bg-[#34D399]" },
  { value: "6+", label: "Years Continuous Craft", dot: "bg-[#91B4FF]" },
  { value: "99.4%", label: "On-Time Delivery SLA", dot: "bg-[#34D399]", highlight: true },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20"
    >
      {/* Atmospheric Ambient Studio Glows */}
      <GlowOrb className="top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[420px] bg-[#175CD3]/15 blur-[120px]" />
      <GlowOrb className="top-20 left-1/4 w-[360px] h-[260px] bg-[#06B6D4]/12 blur-[100px]" />
      <GlowOrb className="bottom-10 right-1/4 w-[400px] h-[280px] bg-[#8B5CF6]/12 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-[1152px] flex-col items-center text-center">
        {/* Studio Availability Status Pill */}
        <Reveal>
          <div className="group mb-8 inline-flex items-center gap-2.5 rounded-full border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] px-4 py-1.5 backdrop-blur-md shadow-sm transition-all hover:border-[rgba(148,163,184,0.35)] cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34D399] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A5B3C7]">
              Digital product studio ·{" "}
              <span className="text-[#F7F9FC]">Available Q2/Q3 2027</span>
            </span>
          </div>
        </Reveal>

        {/* Hero Headline with Space Grotesk and Gradient Accent */}
        <Reveal delay={0.1}>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight max-w-[980px] text-[#F7F9FC]">
            Ideas become{" "}
            <span className="bg-gradient-to-r from-[#91B4FF] via-[#70A1FF] to-[#68FCBF] bg-clip-text text-transparent">
              experiences.
            </span>
            <br />
            We engineer the rest.
          </h1>
        </Reveal>

        {/* Studio Positioning Subcopy */}
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-[780px] text-base sm:text-lg leading-relaxed text-[#A5B3C7]">
            Kavi Solutions is a full-stack digital studio crafting high-velocity web systems, native
            mobile platforms, applied AI products and compounding growth loops — engineered to
            impress and built to perform.
          </p>
        </Reveal>

        {/* CTA Action Cluster */}
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#contact"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] px-7 text-[15px] font-medium text-white shadow-[0_0_24px_rgba(23,92,211,0.4)] transition-all hover:bg-[#1849A9] focus:outline-none focus:ring-2 focus:ring-[#91B4FF]"
            >
              <span>Start your project</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#explore"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,29,47,0.7)] px-7 text-[15px] font-medium text-[#F7F9FC] backdrop-blur-md transition-all hover:bg-white/[0.08]"
            >
              <span>Explore capabilities</span>
              <ChevronDown className="h-4 w-4 text-[#91B4FF]" />
            </Link>
          </div>
        </Reveal>

        {/* Executive Telemetry Stat Ribbon with 3D perspective */}
        <Reveal delay={0.4} className="mt-16 w-full max-w-[1040px]">
          <TiltCard
            intensity={6}
            className="w-full overflow-hidden rounded-[20px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.88)] backdrop-blur-[20px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#91B4FF]/40 to-transparent" />
            <div className="grid grid-cols-2 divide-y divide-[rgba(148,163,184,0.12)] sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="group flex flex-col items-center justify-center p-6 sm:p-8 text-center transition-colors hover:bg-white/[0.02]"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`font-display text-3xl sm:text-4xl font-semibold tracking-tight transition-transform duration-300 group-hover:scale-105 ${
                        s.highlight ? "text-[#34D399]" : "text-[#F7F9FC]"
                      }`}
                    >
                      {s.value}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-[#7889A0]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}
