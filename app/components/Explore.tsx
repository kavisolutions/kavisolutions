"use client";

import Link from "next/link";
import { ArrowRight, Code2, GraduationCap, Layers, TrendingUp } from "lucide-react";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

type ExploreGroup = {
  id: string;
  number: string;
  tag: string;
  icon: typeof Code2;
  title: string;
  sub: string;
  desc: string;
  href: string;
  cta: string;
  topGradient: string;
  iconColor: string;
  iconBg: string;
  chips: string[];
};

const groups: ExploreGroup[] = [
  {
    id: "engineering",
    number: "01 / ARCHITECTURE",
    tag: "Engineering & technology",
    icon: Code2,
    title: "Engineering & technology",
    sub: "Web, mobile, cloud infrastructure and applied AI",
    desc: "From complex reactive web applications to distributed mobile platforms and production AI services — executed by one unified senior engineering collective.",
    href: "/web",
    cta: "Explore engineering capabilities",
    topGradient: "from-[#2563EB] to-[#06B6D4]",
    iconColor: "text-[#91B4FF]",
    iconBg: "group-hover:bg-[#175CD3]",
    chips: ["Next.js & Go", "iOS & Android", "Distributed Systems", "LLM Microservices"],
  },
  {
    id: "growth",
    number: "02 / SCALE",
    tag: "Growth & marketing",
    icon: TrendingUp,
    title: "Growth & marketing",
    sub: "Predictable acquisition systems that compound",
    desc: "Algorithmic SEO, programmatic paid distribution, product marketing, and attribution pipelines wired together — optimized against bottom-line pipeline.",
    href: "/marketing",
    cta: "Explore growth practice",
    topGradient: "from-[#06B6D4] to-[#45dfa4]",
    iconColor: "text-[#45dfa4]",
    iconBg: "group-hover:bg-[#00724f]",
    chips: ["Programmatic SEO", "Performance Paid", "Attribution Stack", "Conversion Loops"],
  },
  {
    id: "fellowship",
    number: "03 / TALENT INCUBATION",
    tag: "Kavi Fellowship",
    icon: GraduationCap,
    title: "Kavi Fellowship",
    sub: "Eleven-month intensive engineering residency",
    desc: "A rigorous residential cohort for diploma engineers, graduates, and returning builders — balancing real production repositories, Vipassana discipline, and rural field assignments.",
    href: "/fellowship",
    cta: "Learn about the residency",
    topGradient: "from-[#8B5CF6] to-[#2563EB]",
    iconColor: "text-[#91B4FF]",
    iconBg: "group-hover:bg-[#1e478b]",
    chips: ["11 Months Full-Time", "Vipassana Retreats", "Real Client Code", "100% Placement"],
  },
  {
    id: "work",
    number: "04 / SHIPPED",
    tag: "Selected work",
    icon: Layers,
    title: "Selected work",
    sub: "Proven products, platforms and live builds",
    desc: "Case studies detailing architectural trade-offs, tech stacks, benchmark performance numbers, and business metrics delivered for high-growth tech firms.",
    href: "/projects",
    cta: "Browse client case studies",
    topGradient: "from-[#3B82F6] to-[#1D4ED8]",
    iconColor: "text-[#91B4FF]",
    iconBg: "group-hover:bg-[#175CD3]",
    chips: ["Fintech Core", "Health AI Platform", "Supply Ledger", "SaaS Engine"],
  },
];

export default function Explore() {
  return (
    <section id="explore" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  PORTFOLIO DOMAINS
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] mb-4">
                Four doors into the work
              </h2>
              <p className="text-base leading-relaxed text-[#A5B3C7]">
                From mission-critical cloud architecture to compounding growth loops, deep tech,
                and residential talent incubation.
              </p>
            </div>
            <Link
              href="/projects"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#7889A0] hover:text-[#91B4FF] transition-colors"
            >
              <span>Explore all verticals</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        {/* 2x2 Grid of 4 Elevated Glass Cards with 3D Tilt */}
        <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <RevealItem key={group.id}>
                <TiltCard
                  intensity={8}
                  className="group relative h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-8 sm:p-9 flex flex-col justify-between hover:border-[rgba(148,163,184,0.35)] transition-all shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  {/* Top accent gradient strip */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${group.topGradient} opacity-90`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7889A0]">
                        {group.number}
                      </span>
                      <div
                        className={`w-10 h-10 rounded-xl bg-[#19202E] flex items-center justify-center border border-[rgba(148,163,184,0.14)] ${group.iconColor} ${group.iconBg} group-hover:text-white transition-colors duration-300`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-[#F7F9FC] mb-1.5">
                      {group.title}
                    </h3>
                    <p className={`text-[14px] sm:text-[15px] font-medium mb-3 ${group.iconColor}`}>
                      {group.sub}
                    </p>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                      {group.desc}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {group.chips.map((chip) => (
                        <span
                          key={chip}
                          className="px-3 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-xs text-[#A5B3C7]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={group.href}
                      className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-medium text-[#91B4FF] group-hover:text-white transition-colors"
                    >
                      <span>{group.cta}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
