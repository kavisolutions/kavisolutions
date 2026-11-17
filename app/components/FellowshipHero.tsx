"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, Move3d } from "lucide-react";
import {
  FELLOWSHIP_HERO,
  FELLOWSHIP_LANGUAGES,
  FELLOWSHIP_PHASES,
  FELLOWSHIP_TRACKS,
} from "@/lib/fellowship-data";
import {
  FELLOWSHIP_MONTH_COUNT,
  FELLOWSHIP_MONTH_PHASE,
  phaseIndexForMonth,
} from "@/lib/fellowship-journey";
import { Reveal } from "@/components/motion";
import { useTheme } from "@/components/ThemeProvider";

const PHASE_COLORS = ["#3B82F6", "#06B6D4", "#34D399", "#91B4FF", "#8B5CF6"];
const MONTHS = Array.from({ length: FELLOWSHIP_MONTH_COUNT }, (_, index) => index + 1);

const FellowshipCanvas = dynamic(
  () => import("@/components/fellowship/FellowshipCanvas"),
  { ssr: false },
);

function OrbitFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-[72%] max-w-[460px]">
        <div className="absolute inset-[8%] rounded-full border border-blue-600/30 animate-[spin_38s_linear_infinite] motion-reduce:animate-none dark:border-blue-400/20" />
        <div className="absolute inset-[20%] rounded-full border border-cyan-600/30 animate-[spin_30s_linear_infinite_reverse] motion-reduce:animate-none dark:border-cyan-400/20" />
        <div className="absolute inset-[32%] rounded-full border border-emerald-600/30 animate-[spin_24s_linear_infinite] motion-reduce:animate-none dark:border-emerald-400/20" />
        <div className="absolute inset-[44%] rounded-full border border-violet-600/30 animate-[spin_20s_linear_infinite_reverse] motion-reduce:animate-none dark:border-violet-400/20" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-2xl" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_62%)]" />
      </div>
    </div>
  );
}

export default function FellowshipHero() {
  const { theme } = useTheme();
  const light = theme === "light";
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [pinnedPhase, setPinnedPhase] = useState<number | null>(null);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "unsupported">(
    "loading",
  );

  const activePhase = hoveredPhase ?? pinnedPhase;
  const selectedPhase =
    activePhase === null ? null : FELLOWSHIP_PHASES[activePhase];
  const selectedColor =
    activePhase === null ? "#91B4FF" : PHASE_COLORS[activePhase];
  const selectedMonthCount =
    activePhase === null
      ? FELLOWSHIP_MONTH_COUNT
      : FELLOWSHIP_MONTH_PHASE.filter((phase) => phase === activePhase).length;

  const handleReady = useCallback(() => setSceneState("ready"), []);
  const handleUnavailable = useCallback(() => setSceneState("unsupported"), []);

  const togglePhase = (index: number) => {
    setPinnedPhase((current) => (current === index ? null : index));
  };

  return (
    <section
      id="journey-map"
      className="relative scroll-mt-24 overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pt-36"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#175CD3]/18 via-[#8B5CF6]/8 to-transparent blur-[120px]" />

      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="min-w-0">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  {FELLOWSHIP_HERO.eyebrow}
                </span>
              </div>

              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#F7F9FC] sm:text-5xl lg:text-[3.4rem]">
                {FELLOWSHIP_HERO.title}{" "}
                <span className="fellowship-accent bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">
                  {FELLOWSHIP_HERO.highlight}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#A5B3C7] sm:text-lg">
                {FELLOWSHIP_HERO.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#apply"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] px-7 text-[15px] font-medium text-white shadow-[0_0_24px_rgba(23,92,211,0.4)] transition-all hover:bg-[#1849A9]"
                >
                  <span>Register your interest</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#curriculum"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,29,47,0.7)] px-6 text-[15px] font-medium text-[#F7F9FC] backdrop-blur-md transition-all hover:bg-white/[0.08]"
                >
                  See the 11-month journey
                </a>
              </div>

              <a
                href="#details"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#175CD3] transition-colors hover:text-[#1849A9] dark:text-[#91B4FF] dark:hover:text-white"
              >
                Eligibility, costs and safety
                <ArrowRight className="h-3 w-3" />
              </a>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {FELLOWSHIP_HERO.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] px-3 py-2.5"
                  >
                    <span className="block font-display text-lg font-semibold tracking-tight text-[#F7F9FC]">
                      {metric.value}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-[#7889A0]">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-[10px] text-[#7889A0]">
                {FELLOWSHIP_LANGUAGES.primary} primary ·{" "}
                {FELLOWSHIP_LANGUAGES.support} support · No placement guarantee
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="relative min-w-0">
              <div className="relative h-[340px] sm:h-[420px] lg:h-[500px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(23,92,211,0.12),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(23,92,211,0.2),transparent_66%)]" />

                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_94%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_94%)]">
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      sceneState === "ready" ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <OrbitFallback />
                  </div>
                  <FellowshipCanvas
                    activePhase={activePhase}
                    light={light}
                    onReady={handleReady}
                    onUnavailable={handleUnavailable}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/75 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#475569] backdrop-blur dark:border-white/10 dark:bg-[#0B1017]/70 dark:text-[#A5B3C7]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        sceneState === "unsupported"
                          ? "bg-[#FBBF24]"
                          : "bg-[#34D399] animate-pulse"
                      }`}
                    />
                    {sceneState === "unsupported" ? "Static preview" : "Live programme map"}
                  </span>
                  <span className="hidden items-center rounded-full border border-slate-300/70 bg-white/75 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#64748B] backdrop-blur dark:border-white/10 dark:bg-[#0B1017]/70 dark:text-[#7889A0] sm:inline-flex">
                    5 phases · 11 months
                  </span>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/70 to-transparent px-1 pb-1 pt-14 dark:from-[#07101D] dark:via-[#07101D]/70 dark:to-transparent">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[#7889A0]">
                      {selectedPhase !== null
                        ? `Phase ${String(activePhase! + 1).padStart(2, "0")} of ${FELLOWSHIP_PHASES.length}`
                        : sceneState === "unsupported"
                          ? "WebGL unavailable"
                          : "Interactive"}
                    </span>
                    <span className="mt-1 block font-display text-sm font-medium text-[#F7F9FC]">
                      {selectedPhase !== null
                        ? `${selectedPhase.months} · ${selectedPhase.title}`
                        : sceneState === "unsupported"
                          ? "Showing the static orbit preview"
                          : "Drag to orbit · scroll to travel"}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#7889A0]">
                    <Move3d className="h-3 w-3 text-[#91B4FF]" />
                    THREE.JS
                  </span>
                </div>
              </div>

              <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center">
                {FELLOWSHIP_PHASES.map((phase, index) => {
                  const isActive = activePhase === index;
                  return (
                    <button
                      key={phase.months}
                      type="button"
                      aria-pressed={pinnedPhase === index}
                      onClick={() => togglePhase(index)}
                      onMouseEnter={() => setHoveredPhase(index)}
                      onMouseLeave={() => setHoveredPhase(null)}
                      onFocus={() => setHoveredPhase(index)}
                      onBlur={() => setHoveredPhase(null)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                        isActive
                          ? "border-[#4772B3]/70 bg-[#4772B3]/25 text-[#F7F9FC] shadow-[0_0_20px_-6px_rgba(59,130,246,0.8)]"
                          : "border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.55)] text-[#A5B3C7] hover:border-[rgba(148,163,184,0.32)] hover:text-[#F7F9FC]"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: PHASE_COLORS[index],
                          boxShadow: `0 0 10px ${PHASE_COLORS[index]}`,
                        }}
                      />
                      {phase.title === "Capstone & launch" ? "Capstone" : phase.title}
                      <span className="font-mono text-[9px] text-[#7889A0]">
                        {phase.months.replace(/^Months?\s*/, "M")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
            <div className="rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.65)] p-5 backdrop-blur-[16px] sm:p-6">
              {selectedPhase !== null ? (
                <>
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: selectedColor,
                        boxShadow: `0 0 12px ${selectedColor}`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-[#7889A0]">
                        Phase {String(activePhase! + 1).padStart(2, "0")} ·{" "}
                        {selectedPhase.months}
                      </span>
                      <h2 className="mt-1 font-display text-lg font-semibold text-[#F7F9FC]">
                        {selectedPhase.title}
                      </h2>
                    </div>
                    <div className="hidden gap-4 font-mono text-[9px] text-[#7889A0] sm:flex">
                      <span>
                        <span className="block text-[#F7F9FC]">{selectedMonthCount}</span>
                        months
                      </span>
                      <span>
                        <span className="block text-[#F7F9FC]">
                          {selectedPhase.outcomes.length}
                        </span>
                        outcomes
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">
                    {selectedPhase.summary}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {selectedPhase.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex gap-2 text-[11px] leading-relaxed text-[#7889A0]"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#34D399]" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#91B4FF]">
                    PROGRAMME OVERVIEW
                  </span>
                  <h2 className="mt-1 font-display text-lg font-semibold text-[#F7F9FC]">
                    A year with a shape
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#A5B3C7]">
                    Five phases, eleven months and four studio tracks. Pick a
                    phase above or a month on the timeline to see what that
                    stretch of the programme covers.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { value: FELLOWSHIP_MONTH_COUNT, label: "Months" },
                      { value: FELLOWSHIP_PHASES.length, label: "Phases" },
                      { value: FELLOWSHIP_TRACKS.length, label: "Tracks" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                      >
                        <span className="block font-display text-xl font-semibold text-[#F7F9FC]">
                          {item.value}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#7889A0]">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.65)] p-5 backdrop-blur-[16px] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#91B4FF]">
                  MONTH TIMELINE
                </span>
                <span className="font-mono text-[9px] text-[#7889A0]">
                  click a month
                </span>
              </div>
              <div className="mt-4 grid grid-cols-11 gap-1">
                {MONTHS.map((month) => {
                  const phaseIndex = phaseIndexForMonth(month);
                  const color = PHASE_COLORS[phaseIndex];
                  const isActive = activePhase === phaseIndex;
                  return (
                    <button
                      key={month}
                      type="button"
                      aria-label={`Month ${month}, ${FELLOWSHIP_PHASES[phaseIndex].title}`}
                      aria-pressed={isActive}
                      onClick={() => setPinnedPhase(phaseIndex)}
                      className={`group relative rounded-md border-t-2 pb-1.5 pt-2 transition-colors ${
                        isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                      }`}
                      style={{ borderTopColor: color }}
                    >
                      <span
                        className={`block text-center font-mono text-[10px] ${
                          isActive ? "text-[#F7F9FC]" : "text-[#7889A0]"
                        }`}
                      >
                        {month}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/8 pt-3">
                {FELLOWSHIP_PHASES.map((phase, index) => (
                  <span
                    key={phase.months}
                    className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#7889A0]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: PHASE_COLORS[index] }}
                    />
                    {phase.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <p className="sr-only">
          Interactive programme map for the Kavi Fellowship: five orbital rings
          represent the five phases of the eleven-month programme, and eleven
          glowing points represent the months. The phase buttons and month
          timeline highlight the matching ring and nodes.
        </p>
      </div>
    </section>
  );
}
