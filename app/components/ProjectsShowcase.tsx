"use client";

import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Terminal,
  Activity,
  Cpu,
  MapPin,
  Layers,
  Sparkles,
} from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

const featuredProjects = [
  {
    id: "apex-financial-ledger",
    name: "Apex Financial Ledger",
    category: "High-Concurrency Fintech",
    description:
      "Distributed ledger & fiscal audit system capable of sub-millisecond atomic settlement, multi-tenant balance assertions, and zero-loss recovery journals.",
    skills: ["Raft Consensus", "Rust", "TimescaleDB", "gRPC", "Next.js"],
    metrics: "420k ops/sec",
    badge: "Raft Quorum 9/9",
    icon: Terminal,
    accent: "text-[#91B4FF]",
    gradient: "from-[#2563EB] to-[#91B4FF]",
  },
  {
    id: "pulse-health-ai",
    name: "Pulse Health AI",
    category: "Edge Biometrics & AI",
    description:
      "Real-time biometric telemetry and clinical triage assistant orchestrating high-fidelity edge signal filtering, predictive escalation, and HIPAA-sealed records.",
    skills: ["React Native", "FastAPI", "WebSockets", "TensorFlow Lite"],
    metrics: "18ms Ingestion",
    badge: "98.4% Accuracy",
    icon: Activity,
    accent: "text-[#34D399]",
    gradient: "from-[#10B981] to-[#34D399]",
  },
  {
    id: "orbit-saas-telemetry",
    name: "Orbit SaaS Telemetry",
    category: "Cloud Observability",
    description:
      "Developer-centric distributed tracing and cloud observability portal with compressed columnar storage, live flamegraphs, and anomaly alerting loops.",
    skills: ["ClickHouse", "Go", "OpenTelemetry", "Tailwind CSS"],
    metrics: "2.4B spans/day",
    badge: "p99 < 42ms",
    icon: Cpu,
    accent: "text-[#C084FC]",
    gradient: "from-[#8B5CF6] to-[#C084FC]",
  },
  {
    id: "fieldgrid-pan-india",
    name: "FieldGrid Pan-India",
    category: "Civic Mobile Platform",
    description:
      "Offline-first rural census and field surveyor data collection platform engineered to reconcile conflict-free replicated data types across spotty 2G/EDGE nodes.",
    skills: ["Flutter", "SQLite", "CRDTs", "PostGIS", "Golang"],
    metrics: "140k+ Surveys",
    badge: "Offline Replicas",
    icon: MapPin,
    accent: "text-[#38BDF8]",
    gradient: "from-[#0284C7] to-[#38BDF8]",
  },
];

export default function ProjectsShowcase() {
  return (
    <section id="projects" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Ambient background glow */}
      <GlowOrb className="top-1/2 left-1/3 w-[550px] h-[350px] bg-[#2563EB]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-[#19202E]/80 backdrop-blur-md border border-[rgba(148,163,184,0.18)]">
            <span className="h-2 w-2 rounded-full bg-[#91B4FF] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              SELECTED PRODUCTION WORK
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] max-w-3xl mb-4 leading-tight">
            Real systems deployed for{" "}
            <span className="bg-gradient-to-r from-[#91B4FF] via-[#70A1FF] to-[#68FCBF] bg-clip-text text-transparent">
              demanding production environments.
            </span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-[#A5B3C7] max-w-2xl">
            A small cross-section of distributed ledgers, medical IoT pipelines, observability platforms, and field survey apps engineered by our team.
          </p>
        </Reveal>

        {/* 2x2 Bento Grid of Projects */}
        <RevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-12">
          {featuredProjects.map((p) => {
            const Icon = p.icon;
            return (
              <RevealItem key={p.id}>
                <TiltCard
                  intensity={6}
                  className="group relative h-full rounded-[26px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_15px_35px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${p.gradient}`} />

                  <div>
                    {/* Header Info */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] text-[#91B4FF]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                            {p.category}
                          </span>
                          <span className="font-display text-[16px] font-semibold text-[#F7F9FC]">
                            {p.name}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[#45dfa4] bg-[#45dfa4]/10 border border-[#45dfa4]/20">
                        {p.badge}
                      </span>
                    </div>

                    <p className="text-[14px] leading-relaxed text-[#A5B3C7] mb-6">
                      {p.description}
                    </p>

                    {/* Metric Box */}
                    <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#151B2A]/90 border border-[rgba(148,163,184,0.1)] mb-6">
                      <span className="font-mono text-[11px] text-[#7889A0] uppercase tracking-wider">
                        Production Benchmark
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#F7F9FC]">
                        {p.metrics}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {p.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.1)] text-[11px] font-mono text-[#A5B3C7]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                    <span className="font-mono text-xs text-[#7889A0]">Full stack delivery</span>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#175CD3] dark:text-[#91B4FF] hover:text-[#1849A9] dark:hover:text-white transition-colors"
                    >
                      <span>View Project Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealStagger>

        {/* View All Projects CTA Banner */}
        <Reveal>
          <div className="rounded-[24px] bg-gradient-to-r from-[#175CD3]/20 via-[rgba(18,29,47,0.85)] to-[#06B6D4]/20 border border-[rgba(148,163,184,0.2)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div>
              <h4 className="font-display text-xl font-semibold text-[#F7F9FC] mb-1">
                Explore our full archive of production systems
              </h4>
              <p className="text-[14px] text-[#A5B3C7]">
                Filter by architecture type, live demos, and client outcomes.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-6 text-[14px] font-medium whitespace-nowrap transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] shrink-0"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
