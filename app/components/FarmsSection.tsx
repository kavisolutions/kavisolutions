"use client";

import Link from "next/link";
import {
  Sprout,
  ArrowRight,
  Sun,
  Droplets,
  Calendar,
  Compass,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";

export default function FarmsSection() {
  return (
    <section id="farms" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Ambient agriculture natural green glow */}
      <GlowOrb className="top-1/4 -right-24 w-[520px] h-[360px] bg-[#10B981]/12 blur-[130px]" />
      <GlowOrb className="bottom-1/3 -left-20 w-[480px] h-[340px] bg-[#84CC16]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-[#19202E]/80 backdrop-blur-md border border-[rgba(148,163,184,0.18)]">
            <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#34D399]">
              REGENERATIVE AGRICULTURE &amp; VENTURES
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] max-w-3xl mb-4 leading-tight">
            Kavi Farms:{" "}
            <span className="bg-gradient-to-r from-[#34D399] via-[#86EFAC] to-[#FDE047] bg-clip-text text-transparent">
              from our fields to your table.
            </span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-[#A5B3C7] max-w-2xl">
            Farm-grown natural produce and immersive weekend village experiences from Polepalli, Palnadu. We marry traditional regenerative soil science with direct-to-consumer logistics.
          </p>
        </Reveal>

        {/* 2-Column Bento: Products Track vs Tourism Track */}
        <RevealStagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Track 1: Farm Produce */}
          <RevealItem>
            <TiltCard
              intensity={6}
              className="group relative h-full rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-9 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] hover:border-[rgba(52,211,153,0.35)] transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#84CC16]" />
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#10B981]/10 rounded-full blur-[70px] pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-[#34D399] transition-transform group-hover:scale-105">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                        Venture Track · 01
                      </span>
                      <span className="font-display text-[15px] font-semibold text-[#F7F9FC]">
                        Farm Products &amp; Harvest
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                    100% Chemical-Free
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7F9FC] tracking-tight mb-2.5">
                  Natural Grains, Oils &amp; Pulses
                </h3>
                <p className="text-[14px] font-medium text-[#34D399] mb-4">
                  Grown in Polepalli village with zero synthetic pesticides or chemicals
                </p>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                  We cultivate heritage millets, cold-pressed wood-churned oils, unpolished pulses, and seasonal country vegetables. Every batch is grown under natural regenerative methods with full provenance tracking.
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-[18px] bg-[#151B2A]/80 border border-[rgba(148,163,184,0.1)] mb-6 text-center">
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#34D399]">100%</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Organic</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">Polepalli</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Origin</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">Direct</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">No Brokers</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">40+</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Families</div>
                  </div>
                </div>

                {/* Product Highlights */}
                <div className="space-y-2 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block font-semibold">
                    Harvest &amp; Product Offerings
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A5B3C7]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Heritage Millets &amp; Desi Grains</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Wood-Pressed Groundnut &amp; Sesame Oil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Unpolished Red Gram &amp; Moong Dal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Direct Farm-to-Door Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {["Zero Chemicals", "Wood-Pressed", "Heritage Seeds", "Soil First", "Ethical Pricing"].map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-[11px] font-mono text-[#A5B3C7]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/farms"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#059669] hover:bg-[#047857] text-white px-5 text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              >
                <span>Browse Farm Produce &amp; Inquire</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </TiltCard>
          </RevealItem>

          {/* Track 2: Village Tourism & Immersion */}
          <RevealItem>
            <TiltCard
              intensity={6}
              className="group relative h-full rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-9 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] hover:border-[rgba(250,204,21,0.35)] transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#10B981]" />
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#F59E0B]/10 rounded-full blur-[70px] pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-amber-500/10 border-amber-500/20 text-[#F59E0B] transition-transform group-hover:scale-105">
                      <Compass className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block">
                        Venture Track · 02
                      </span>
                      <span className="font-display text-[15px] font-semibold text-[#F7F9FC]">
                        Village Immersion &amp; Tourism
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                    Weekend Stays
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7F9FC] tracking-tight mb-2.5">
                  Weekend Village Experience
                </h3>
                <p className="text-[14px] font-medium text-[#F59E0B] mb-4">
                  3 days living, working, and dining alongside the farmers of Palnadu
                </p>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7] mb-6">
                  Disconnect from screens and reconnect with rural roots. Participate in morning field work, traditional cooking over earthen stoves, guided agroforestry walks, and stargazing around the village courtyard.
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-[18px] bg-[#151B2A]/80 border border-[rgba(148,163,184,0.1)] mb-6 text-center">
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F59E0B]">3 Days</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Itinerary</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">Home</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Cooked Meals</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#F7F9FC]">Guided</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Field Walks</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#19202E]/70">
                    <div className="font-display text-lg font-bold text-[#34D399]">Families</div>
                    <div className="font-mono text-[10px] text-[#7889A0]">Welcome</div>
                  </div>
                </div>

                {/* Experience Highlights */}
                <div className="space-y-2 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0] block font-semibold">
                    What You&apos;ll Experience
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A5B3C7]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Natural Farming Hands-on Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Clay Pot Cooking &amp; Millet Feasts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Heritage Village Trail &amp; Waterbodies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0" />
                      <span>Clean Rural Air &amp; Star Gazing</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {["All Inclusive", "Authentic Stay", "Clean Drinking Water", "Curated Trails", "Zero Hype"].map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.12)] text-[11px] font-mono text-[#A5B3C7]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/farms#visit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#D97706] hover:bg-[#B45309] text-white px-5 text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(217,119,6,0.35)]"
              >
                <span>Book Village Experience</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </TiltCard>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
