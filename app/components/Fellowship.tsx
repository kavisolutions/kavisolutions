"use client";

import Link from "next/link";
import { ArrowRight, Code2, Network, Sparkles, Users } from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

const pillars = [
  {
    icon: Users,
    title: "Mentorship",
    desc: "Guided 1-on-1 daily code reviews by staff engineers and seasoned system architects.",
  },
  {
    icon: Code2,
    title: "Build in public",
    desc: "Real production repositories with CI/CD deployed for thousands of genuine daily users.",
  },
  {
    icon: Network,
    title: "Studio Network",
    desc: "Direct working access to leading tech startup founders, alumni leaders, and partners.",
  },
  {
    icon: Sparkles,
    title: "Opportunities",
    desc: "Guaranteed interview pipelines into full studio positions and tier-one partner firms.",
  },
];

export default function Fellowship() {
  return (
    <section id="fellowship" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      <GlowOrb className="top-1/2 right-1/4 w-[480px] h-[300px] bg-[#175CD3]/12 blur-[110px]" />

      <div className="relative mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-12 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#19202E] border border-[rgba(148,163,184,0.16)] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#45dfa4]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              ACADEMY &amp; RESIDENCY
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] mb-4 max-w-2xl">
            Launch your career with Kavi Fellows
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-[#A5B3C7] max-w-2xl mb-8">
            An immersive 11-month residency combining high-craft software engineering, Vipassana
            mindfulness, and grassroots field leadership.
          </p>

          {/* Cohort Status Timeline Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34D399]/10 border border-[#34D399]/30 text-xs font-mono font-medium text-[#45dfa4] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#45dfa4] animate-pulse" />
              January 2027 Cohort · Applications Open
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#19202E] border border-[rgba(148,163,184,0.14)] text-xs font-mono font-medium text-[#7889A0]">
              May 2027 · Upcoming
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#19202E] border border-[rgba(148,163,184,0.14)] text-xs font-mono font-medium text-[#7889A0]">
              September 2027 · Upcoming
            </span>
          </div>
        </Reveal>

        {/* 4 Glass Cards Grid with 3D Tilt */}
        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <RevealItem key={item.title}>
                <TiltCard
                  intensity={10}
                  className="h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-7 flex flex-col justify-start shadow-[0_15px_35px_-10px_rgba(0,0,0,0.4)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] flex items-center justify-center mb-4 text-[#91B4FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#F7F9FC] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#A5B3C7]">
                    {item.desc}
                  </p>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealStagger>

        {/* Fellowship CTA */}
        <Reveal className="flex justify-center">
          <Link
            href="/fellowship"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] px-8 text-[15px] font-medium text-white shadow-[0_0_24px_rgba(23,92,211,0.35)] transition-all hover:bg-[#1849A9] focus:outline-none focus:ring-2 focus:ring-[#91B4FF]"
          >
            <span>Apply for the 2027 fellowship cohort</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
