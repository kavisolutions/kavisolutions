"use client";

import Link from "next/link";
import {
  Landmark,
  BarChart3,
  Layers,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

const civicPractices = [
  {
    id: "govtech",
    number: "CIVIC · 01",
    title: "Government Technology",
    sub: "Tamper-evident public administration portals and land registry digitisation",
    desc: "State-grade digital infrastructure engineered for public institutions. Multi-tiered permissions, biometric field verification, and immutable audit logs that eliminate departmental bottlenecks.",
    href: "/government",
    cta: "Explore GovTech",
    icon: Landmark,
    accent: "text-[#38BDF8]",
    gradient: "from-[#0284C7] to-[#38BDF8]",
    chips: ["Citizen Portals", "Public Ledgers", "Role-Based Auth", "State Scale"],
    deliverables: ["Citizen Service Portals", "Municipal Workflow Automation", "Tamper-Proof Records"],
  },
  {
    id: "survey",
    number: "CIVIC · 02",
    title: "Survey & Data Research",
    sub: "High-confidence field data collection, polling, and socio-economic analysis",
    desc: "Empirical survey collection pipelines with GPS-verified field surveyor tools, offline data caching, statistical anomaly detection, and policy-grade report generation.",
    href: "/survey",
    cta: "Explore Research Lab",
    icon: BarChart3,
    accent: "text-[#C084FC]",
    gradient: "from-[#7C3AED] to-[#C084FC]",
    chips: ["Field Telemetry", "Offline GPS", "Statistical Rigor", "Policy Reports"],
    deliverables: ["Rural Demographic Surveys", "Enumerator Mobile Apps", "Data Validation Engines"],
  },
  {
    id: "financial",
    number: "CIVIC · 03",
    title: "Financial & Tax Services",
    sub: "Institutional corporate compliance, tax filings, and fractional CFO workflows",
    desc: "Full-stack fiscal management and tax filing systems for startups and enterprises. Automated bookkeeping, GST compliance, payroll reconciliation, and real-time runway dashboards.",
    href: "/financial",
    cta: "Explore Financial Services",
    icon: Layers,
    accent: "text-[#F59E0B]",
    gradient: "from-[#D97706] to-[#F59E0B]",
    chips: ["GST & Tax Filing", "Audit Trails", "Payroll Engines", "Runway Analytics"],
    deliverables: ["Statutory Compliance Portals", "Automated Invoice Ledgers", "Fiscal Audit Automation"],
  },
  {
    id: "verify",
    number: "CIVIC · 04",
    title: "Public Credential Registry",
    sub: "Cryptographic credential verification, QR code lookup, and certificate validation",
    desc: "Public-facing credential search portal allowing employers, academic institutions, and partners to instantly verify official Kavi Solutions certificates, badges, and fellowship completions.",
    href: "/verify",
    cta: "Verify a Certificate",
    icon: ShieldCheck,
    accent: "text-[#34D399]",
    gradient: "from-[#10B981] to-[#34D399]",
    chips: ["Instant QR Verification", "Fraud Protection", "Public Ledger", "Tamper-Evident"],
    deliverables: ["QR Certificate Check", "Credential Revocation Status", "Digital PDF Certification"],
  },
];

export default function CivicTechSection() {
  return (
    <section id="civic-tech" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Background ambient lighting */}
      <GlowOrb className="top-1/3 -left-20 w-[500px] h-[350px] bg-[#0284C7]/12 blur-[120px]" />
      <GlowOrb className="bottom-1/3 -right-20 w-[500px] h-[350px] bg-[#7C3AED]/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-[#19202E]/80 backdrop-blur-md border border-[rgba(148,163,184,0.18)]">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#38BDF8]">
              CIVIC INFRASTRUCTURE &amp; PUBLIC GOOD
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] max-w-3xl mb-4 leading-tight">
            Digital public goods built for{" "}
            <span className="bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">
              transparent governance.
            </span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-[#A5B3C7] max-w-2xl">
            State-scale citizen administration, empirical field surveys, institutional financial compliance, and cryptographic credential verification — deployed for open public benefit.
          </p>
        </Reveal>

        {/* 2x2 Bento Grid */}
        <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {civicPractices.map((item) => {
            const Icon = item.icon;
            return (
              <RevealItem key={item.id}>
                <TiltCard
                  intensity={6}
                  className="group relative h-full rounded-[26px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_15px_35px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.gradient}`} />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] text-[#91B4FF]">
                          <Icon className={`h-5 w-5 ${item.accent}`} />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                            {item.number}
                          </span>
                          <span className="font-display text-[16px] font-semibold text-[#F7F9FC]">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px] font-medium text-[#91B4FF] mb-3">
                      {item.sub}
                    </p>

                    <p className="text-[14px] leading-relaxed text-[#A5B3C7] mb-6">
                      {item.desc}
                    </p>

                    {/* Deliverables */}
                    <div className="space-y-2 mb-6">
                      {item.deliverables.map((d) => (
                        <div key={d} className="flex items-center gap-2 text-xs text-[#A5B3C7]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {item.chips.map((chip) => (
                        <span
                          key={chip}
                          className="px-2.5 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.1)] text-[11px] font-mono text-[#A5B3C7]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Link */}
                  <div className="pt-4 border-t border-[rgba(148,163,184,0.1)]">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 text-sm font-mono font-medium text-[#175CD3] dark:text-[#91B4FF] hover:text-[#1849A9] dark:hover:text-white transition-colors"
                    >
                      <span>{item.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
