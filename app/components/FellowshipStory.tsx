"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowRight, Code2, DoorOpen, GraduationCap, Handshake, Sprout } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const FellowshipStoryCanvas = dynamic(
  () => import("@/components/fellowship/FellowshipStoryCanvas"),
  { ssr: false },
);

const STAGES = [
  {
    tag: "APPLY",
    title: "Join the cohort",
    copy: "Register interest, meet the team and choose the track you want to build in. No polished CV required — show the willingness to do the work.",
    color: "#3B82F6",
    icon: DoorOpen,
    bullets: ["Register interest", "Choose a track", "Cohort induction"],
  },
  {
    tag: "INTERVIEW",
    title: "Meet Kavi",
    copy: "A real conversation with the team about where you are, what you want to build and what support you need. Not a formality.",
    color: "#06B6D4",
    icon: Handshake,
    bullets: ["Meet the team", "Share your goals", "Honest fit check"],
  },
  {
    tag: "LEARN & BUILD",
    title: "Do the work",
    copy: "Mentor reviews, live briefs and weekly shipping. Fellows learn by owning a deliverable, not by watching slides.",
    color: "#34D399",
    icon: Code2,
    bullets: ["Live briefs", "Weekly mentor reviews", "Ship every week"],
  },
  {
    tag: "FIELD",
    title: "Serve in the field",
    copy: "DSN immersion with schools, farmers and community organisations. Learn the context you are building for by showing up in it.",
    color: "#FBBF24",
    icon: Sprout,
    bullets: ["DSN immersion", "Community project", "Documented outcome"],
  },
  {
    tag: "CAPSTONE",
    title: "Launch",
    copy: "Deliver a public capstone, present at demo day and leave with a portfolio and a clear next step.",
    color: "#8B5CF6",
    icon: GraduationCap,
    bullets: ["Public demo day", "Portfolio case study", "Next-step plan"],
  },
];

export default function FellowshipStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const light = theme === "light";
  const [stage, setStage] = useState(0);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "unsupported">(
    "loading",
  );
  const reduceMotion = useReducedMotion();

  const handleReady = useCallback(() => setSceneState("ready"), []);
  const handleUnavailable = useCallback(() => setSceneState("unsupported"), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const storyNearViewport = useInView(sectionRef, {
    once: true,
    margin: "0px 0px -25% 0px",
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      STAGES.length - 1,
      Math.max(0, Math.floor(value * STAGES.length)),
    );
    setStage((current) => (current === next ? current : next));
  });

  const active = STAGES[stage];
  const StageIcon = active.icon;

  return (
    <section
      id="fellowship-story"
      ref={sectionRef}
      aria-label="Fellowship journey: apply, interview, build, field service, capstone"
      className="relative h-[500vh] bg-[#F8FAFC] dark:bg-[#07101D]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(23,92,211,0.1),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_50%_60%,rgba(23,92,211,0.16),transparent_62%)]" />

        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            sceneState === "ready" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full border bg-white/70 shadow-[0_0_80px_-20px_rgba(59,130,246,0.6)] dark:bg-[rgba(11,18,32,0.55)] sm:h-56 sm:w-56"
              style={{ borderColor: `${active.color}55` }}
            >
              <span
                className="absolute inset-4 rounded-full border"
                style={{ borderColor: `${active.color}22` }}
              />
              <span
                className="absolute inset-8 rounded-full border"
                style={{ borderColor: `${active.color}18` }}
              />
              <StageIcon
                className="h-14 w-14 sm:h-16 sm:w-16"
                style={{ color: active.color }}
                strokeWidth={1.2}
              />
            </div>
          </div>

          <div className="absolute inset-x-[10%] top-[68%] h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent">
            {STAGES.map((item, index) => (
              <span
                key={item.tag}
                className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                style={{
                  left: `${(index / (STAGES.length - 1)) * 100}%`,
                  backgroundColor:
                    index === stage ? item.color : "rgba(148,163,184,0.35)",
                  boxShadow:
                    index === stage ? `0 0 12px ${item.color}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {storyNearViewport ? (
          <FellowshipStoryCanvas
            progress={scrollYProgress}
            light={light}
            onReady={handleReady}
            onUnavailable={handleUnavailable}
            className="absolute inset-0 h-full w-full"
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-transparent to-[#F8FAFC]/90 dark:from-[#07101D] dark:via-transparent dark:to-[#07101D]/90" />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 pb-10 pt-24 sm:px-8 sm:pb-12">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/75 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-[#0B1017]/65">
              <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#175CD3] dark:text-[#91B4FF]">
                THE FELLOWSHIP JOURNEY
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#64748B] dark:text-[#7889A0]">
              {String(stage + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <motion.div
              key={active.tag}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto max-w-lg rounded-[22px] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)] backdrop-blur-[18px] dark:border-[rgba(148,163,184,0.18)] dark:bg-[rgba(11,18,32,0.66)] dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)] sm:p-6"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: active.color,
                    boxShadow: `0 0 12px ${active.color}`,
                  }}
                />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                  {active.tag}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F7F9FC] sm:text-3xl">
                {active.title}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[#A5B3C7]">
                {active.copy}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {active.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-medium text-[#475569] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#A5B3C7]"
                  >
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: active.color }}
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
              {stage === STAGES.length - 1 && (
                <Link
                  href="/#contact"
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#175CD3] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#1849A9]"
                >
                  Register your interest
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </motion.div>

            <div className="hidden flex-col gap-2.5 pb-1 sm:flex">
              {STAGES.map((item, index) => (
                <span
                  key={item.tag}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: index === stage ? 26 : 10,
                    backgroundColor:
                      index === stage ? item.color : "rgba(148,163,184,0.28)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-200 dark:bg-white/5">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full origin-left bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#68FCBF]"
          />
        </div>
      </div>

      <ol className="sr-only">
        {STAGES.map((item) => (
          <li key={item.tag}>
            {item.tag}: {item.title}. {item.copy}
          </li>
        ))}
      </ol>
    </section>
  );
}
