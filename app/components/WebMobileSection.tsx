"use client";

import Link from "next/link";
import {
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Sparkles,
  Zap,
} from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

export default function WebMobileSection() {
  return (
    <section id="explore" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Background ambient lighting */}
      <GlowOrb className="top-1/3 -left-20 w-[500px] h-[350px] bg-[#175CD3]/12 blur-[120px]" />
      <GlowOrb className="bottom-1/4 -right-20 w-[500px] h-[350px] bg-[#06B6D4]/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-[#19202E]/80 backdrop-blur-md border border-[rgba(148,163,184,0.18)]">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              CORE SOFTWARE ENGINEERING
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] max-w-3xl mb-4 leading-tight">
            Web &amp; Mobile Systems,{" "}
            <span className="bg-gradient-to-r from-[#91B4FF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
              engineered to scale.
            </span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-[#A5B3C7] max-w-2xl">
            From sub-second Next.js edge architectures and Go microservices to 60fps native iOS &amp; Android platforms, we build high-polish digital products that convert visitors into lifelong users.
          </p>
        </Reveal>

        {/* 2-Column Comparative Bento Cards */}
        <RevealStagger className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Web Development */}
          <RevealItem>
            <TiltCard
              intensity={6}
              className="group relative h-full rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-9 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] hover:border-[rgba(148,163,184,0.35)] transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#2563EB]/10 rounded-full blur-[70px] pointer-events-none" />

              <div>
                {/* Header Strip */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-blue-500/10 border-blue-500/20 text-[#91B4FF] transition-transform group-hover:scale-105">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                        Web Practice · 01
                      </span>
                      <span className="font-display text-[15px] font-semibold text-[#F7F9FC]">
                        Distributed Web Systems
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                    Production Ready
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7F9FC] tracking-tight mb-2.5">
                  Web Development &amp; Cloud Systems
                </h3>
                <p className="text-[14px] font-medium text-[#91B4FF] mb-4">
                  Sub-second Next.js 16 architectures, Go microservices, and zero-downtime edge deploys
                </p>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                  From high-conversion brand marketing sites to multi-tenant SaaS dashboards and distributed API gateways. Engineered with sub-second page loads, zero-downtime CI/CD, and SOC2-ready security.
                </p>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-[18px] bg-[#151B2A]/80 border border-[rgba(148,163,184,0.1)] mb-6 text-center">
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">&lt;1s</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Load Time</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">99+</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Lighthouse</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">80+</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Shipped</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#34D399]">100%</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Responsive</div>
                  </div>
                </div>

                {/* Core Deliverables */}
                <div className="space-y-2 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block font-semibold">
                    Core Web Deliverables
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A5B3C7]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Corporate &amp; Brand Portals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Multi-Tenant SaaS Dashboards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Headless E-Commerce Engines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Distributed Edge API Gateways</span>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {["Next.js 16", "React 19", "Go", "PostgreSQL", "Cloudflare Edge", "Tailwind CSS", "Docker"].map((chip) => (
                    <span
                      key={chip}
                      className="px-2.5 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-[11px] font-mono text-[#A5B3C7]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div>
                <Link
                  href="/web"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-5 text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] focus:outline-none focus:ring-2 focus:ring-[#91B4FF]"
                >
                  <span>Explore Web Development</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </TiltCard>
          </RevealItem>

          {/* Card 2: Mobile App Development */}
          <RevealItem>
            <TiltCard
              intensity={6}
              className="group relative h-full rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-9 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] hover:border-[rgba(148,163,184,0.35)] transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#06B6D4] via-[#38BDF8] to-[#3B82F6]" />
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#06B6D4]/10 rounded-full blur-[70px] pointer-events-none" />

              <div>
                {/* Header Strip */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-sky-500/10 border-sky-500/20 text-[#38BDF8] transition-transform group-hover:scale-105">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                        Mobile Practice · 02
                      </span>
                      <span className="font-display text-[15px] font-semibold text-[#F7F9FC]">
                        Native iOS &amp; Android Apps
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                    60 FPS Motion
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7F9FC] tracking-tight mb-2.5">
                  Mobile App Development
                </h3>
                <p className="text-[14px] font-medium text-[#38BDF8] mb-4">
                  Native iOS (Swift), Android (Kotlin), and cross-platform Flutter platforms
                </p>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                  Engineered for fluid 60fps responsiveness, offline-first local database synchronization, biometric security, and zero-degradation battery efficiency. Shipped to App Store and Google Play with full confidence.
                </p>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-[18px] bg-[#151B2A]/80 border border-[rgba(148,163,184,0.1)] mb-6 text-center">
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">60fps</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Frame Rate</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#34D399]">100%</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Crash-Free</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">Offline</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">First Sync</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">Zero</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Battery Drain</div>
                  </div>
                </div>

                {/* Core Deliverables */}
                <div className="space-y-2 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block font-semibold">
                    Core Mobile Deliverables
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A5B3C7]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Consumer iOS &amp; Android Apps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Offline Field &amp; Mesh Sync Tools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Biometric Auth &amp; Secure Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>App Store &amp; Play Release CI/CD</span>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {["Swift (iOS)", "Kotlin (Android)", "Flutter", "SQLite/Room", "CRDT Sync", "Biometrics", "WebSockets"].map((chip) => (
                    <span
                      key={chip}
                      className="px-2.5 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-[11px] font-mono text-[#A5B3C7]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div>
                <Link
                  href="/mobile"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-5 text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] focus:outline-none focus:ring-2 focus:ring-[#91B4FF]"
                >
                  <span>Explore Mobile Development</span>
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
