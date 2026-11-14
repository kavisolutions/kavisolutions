"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import type { ServiceData } from "@/lib/services-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";

export function ServicePage({ data }: { data: ServiceData }) {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />

      <div className="flex-grow">
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pt-36 pb-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-[#175CD3]/20 via-[#8B5CF6]/10 to-transparent blur-[120px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Elevated Stitch Eyebrow Pill */}
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#19202E]/80 backdrop-blur-md border border-[rgba(148,163,184,0.18)] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  {data.tag}
                </span>
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={0.1}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F7F9FC] leading-[1.15]">
                {data.title}{" "}
                <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">
                  {data.highlight}
                </span>
              </h1>
            </Reveal>

            {/* Subtitle */}
            <Reveal delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#A5B3C7]">
                {data.hero}
              </p>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={0.3}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-8 text-[15px] font-medium transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)]"
                >
                  <span>Start your project</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,29,47,0.7)] px-7 text-[15px] font-medium text-[#F7F9FC] backdrop-blur-md transition-all hover:bg-white/[0.08]"
                >
                  <span>Explore capabilities</span>
                  <ChevronDown className="h-4 w-4 text-[#91B4FF]" />
                </a>
              </div>
            </Reveal>

            {/* Metrics Ribbon with 3D Tilt */}
            <Reveal delay={0.4} className="mt-14 w-full max-w-3xl mx-auto">
              <TiltCard
                intensity={6}
                className="overflow-hidden rounded-[20px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] backdrop-blur-[20px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="grid grid-cols-2 divide-y divide-[rgba(148,163,184,0.12)] sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
                  {data.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex flex-col items-center justify-center p-6 text-center"
                    >
                      <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F7F9FC]">
                        {m.value}
                      </span>
                      <span className="mt-1 text-[11px] font-mono uppercase tracking-wider text-[#7889A0]">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* FEATURES / WHAT WE BUILD */}
        <section id="features" className="relative px-6 py-20">
          <div className="mx-auto max-w-[1152px]">
            <Reveal className="mx-auto mb-14 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  CAPABILITIES
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC]">
                {data.featuresTitle}
              </h2>
            </Reveal>

            <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.features.map((f, idx) => (
                <RevealItem key={f.title}>
                  <TiltCard
                    intensity={8}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
                    <div>
                      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#175CD3]/10 border border-[#175CD3]/20 text-xs font-mono font-semibold text-[#91B4FF] group-hover:bg-[#175CD3] group-hover:text-white transition-colors">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-[#F7F9FC] mb-2">
                        {f.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-[#A5B3C7]">{f.desc}</p>
                    </div>
                  </TiltCard>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </section>

        {/* PROCESS */}
        <section className="relative px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <Reveal className="mx-auto mb-14 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  DELIVERY LIFECYCLE
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F7F9FC]">
                {data.processTitle}
              </h2>
            </Reveal>

            <RevealStagger className="space-y-4">
              {data.process.map((p) => (
                <RevealItem key={p.step}>
                  <div className="rounded-[20px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 flex items-start gap-5 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#175CD3]/15 border border-[#175CD3]/30 font-mono text-sm font-bold text-[#91B4FF]">
                      {p.step}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#F7F9FC]">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#A5B3C7]">{p.desc}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </section>

        {/* TECHNOLOGIES STACK */}
        {data.stack && data.stack.length > 0 && (
          <section className="relative px-6 py-12">
            <div className="mx-auto max-w-4xl text-center">
              <Reveal>
                <div className="rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-8 shadow-sm">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#91B4FF] mb-6">
                    {data.stackTitle || "Technologies We Use"}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {data.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.14)] px-4 py-1.5 text-xs font-mono text-[#F7F9FC]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="relative px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  COMMON QUESTIONS
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F7F9FC]">
                {data.faqTitle || "Frequently Asked"}
              </h2>
            </Reveal>

            <RevealStagger className="space-y-3">
              {data.faq.map((f) => (
                <RevealItem key={f.q}>
                  <details className="group rounded-[18px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 transition-all">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-[#F7F9FC]">
                      {f.q}
                      <span className="ml-4 font-mono text-[#91B4FF] transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">{f.a}</p>
                  </details>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="relative px-6 pb-28 pt-6">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] backdrop-blur-[20px] p-10 sm:p-14 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />
                <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl">
                  {data.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-[#A5B3C7] leading-relaxed">
                  {data.ctaDesc}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/#contact"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-8 text-[15px] font-medium transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)]"
                  >
                    <span>Start your project</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
