"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, GraduationCap, Calendar, Clock, MapPin, Users } from "lucide-react";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";
import {
  FELLOWSHIP_AUDIENCE,
  FELLOWSHIP_COHORTS,
  FELLOWSHIP_CONTACT,
  FELLOWSHIP_FAQ,
  FELLOWSHIP_HERO,
  FELLOWSHIP_LANGUAGES,
  FELLOWSHIP_MENTORS,
  FELLOWSHIP_PHASES,
  FELLOWSHIP_PILLARS,
  FELLOWSHIP_TRACKS,
  FELLOWSHIP_WEEK,
} from "@/lib/fellowship-data";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[#A5B3C7]">{description}</p>
      )}
    </Reveal>
  );
}

export default function FellowshipPage() {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-36 pb-20">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-[#175CD3]/20 via-[#8B5CF6]/10 to-transparent blur-[120px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                {FELLOWSHIP_HERO.eyebrow}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F7F9FC] leading-[1.1]">
              {FELLOWSHIP_HERO.title}{" "}
              <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">
                {FELLOWSHIP_HERO.highlight}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#A5B3C7]">
              {FELLOWSHIP_HERO.description}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-8 text-[15px] font-medium transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)]"
              >
                <span>Register your interest</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#curriculum"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,29,47,0.7)] px-7 text-[15px] font-medium text-[#F7F9FC] backdrop-blur-md transition-all hover:bg-white/[0.08]"
              >
                <span>See the 11-month journey</span>
              </a>
            </div>
          </Reveal>

          {/* Metrics Ribbon */}
          <Reveal delay={0.4} className="mt-14 w-full max-w-3xl mx-auto">
            <TiltCard
              intensity={6}
              className="overflow-hidden rounded-[20px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] backdrop-blur-[20px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
            >
              <div className="grid grid-cols-2 divide-y divide-[rgba(148,163,184,0.12)] sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
                {FELLOWSHIP_HERO.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex flex-col items-center justify-center p-6 text-center"
                  >
                    <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F7F9FC]">
                      {metric.value}
                    </span>
                    <span className="mt-1 text-[11px] font-mono uppercase tracking-wider text-[#7889A0]">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.5} className="mt-6">
            <p className="text-xs font-mono text-[#7889A0]">
              {FELLOWSHIP_LANGUAGES.primary} primary · {FELLOWSHIP_LANGUAGES.support} support · No placement guarantee
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="relative px-6 py-20">
        <div className="mx-auto max-w-[1152px]">
          <SectionHeading
            eyebrow="CANDIDATE PROFILE"
            title="If you are willing to do the work, the door is open"
            description="This is not a finishing school for people who already have every advantage. It is a structured way back into learning for people who need a real opportunity."
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FELLOWSHIP_AUDIENCE.map((item) => (
              <RevealItem key={item}>
                <TiltCard
                  intensity={6}
                  className="h-full rounded-[20px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#34D399] mt-0.5" />
                    <p className="text-sm leading-relaxed text-[#A5B3C7]">{item}</p>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="relative px-6 py-20">
        <div className="mx-auto max-w-[1152px]">
          <SectionHeading
            eyebrow="FOUNDATIONAL DISCIPLINES"
            title="Three Non-Negotiable Pillars"
            description="Knowledge without self-awareness becomes arrogance. Skill without service becomes extraction. The programme is built around three practices that keep each other honest."
          />
          <RevealStagger className="grid gap-6 lg:grid-cols-3">
            {FELLOWSHIP_PILLARS.map((pillar) => (
              <RevealItem key={pillar.id}>
                <TiltCard
                  intensity={8}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
                  <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] text-2xl">
                      {pillar.icon}
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold text-[#F7F9FC]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#A5B3C7]">{pillar.summary}</p>
                    <ul className="mt-6 space-y-2 border-t border-[rgba(148,163,184,0.12)] pt-5">
                      {pillar.practices.map((practice) => (
                        <li key={practice} className="flex gap-2 text-xs leading-relaxed text-[#7889A0]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#91B4FF]" />
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" className="relative px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="THE 11-MONTH JOURNEY"
            title="From foundation to a public capstone"
            description="Five phases, one cohort. Every phase ends with something you can show, not just something you attended."
          />
          <div className="space-y-4">
            {FELLOWSHIP_PHASES.map((phase, idx) => (
              <RevealItem key={phase.months}>
                <div className="rounded-[20px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-7 shadow-md">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#91B4FF]">
                        {phase.months}
                      </span>
                      <h3 className="font-display text-xl font-semibold text-[#F7F9FC]">
                        {phase.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.14)] px-3 py-1 text-[11px] font-mono text-[#7889A0]">
                      Phase {idx + 1} of 5
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#A5B3C7] mb-4">{phase.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.outcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className="rounded-full bg-[#19202E] border border-[rgba(148,163,184,0.12)] px-3 py-1 text-[11px] font-mono text-[#91B4FF]"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* WEEKLY RHYTHM */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-[1152px]">
          <SectionHeading
            eyebrow="OPERATIONAL TIMETABLE"
            title="A week that has a shape"
            description="The exact timetable changes by phase and track, but the week always balances learning, building, mentorship, service and rest."
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FELLOWSHIP_WEEK.map((day) => (
              <RevealItem key={day.day}>
                <div className="h-full rounded-[20px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-5 shadow-sm">
                  <span className="font-mono text-xs font-semibold text-[#91B4FF] uppercase tracking-wider">
                    {day.day}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-[#F7F9FC]">
                    {day.focus}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">{day.detail}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="relative px-6 py-20">
        <div className="mx-auto max-w-[1152px]">
          <SectionHeading
            eyebrow="STUDIO SPECIALIZATIONS"
            title="Four Core Studio Tracks"
            description="Every fellow chooses a primary track in month two. The track sets the project briefs, mentor group and portfolio focus."
          />
          <RevealStagger className="grid gap-6 sm:grid-cols-2">
            {FELLOWSHIP_TRACKS.map((track) => (
              <RevealItem key={track.title}>
                <TiltCard
                  intensity={7}
                  className="h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 shadow-md"
                >
                  <span className="text-3xl mb-3 block">{track.icon}</span>
                  <h3 className="font-display text-xl font-semibold text-[#F7F9FC]">
                    {track.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#A5B3C7]">{track.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {track.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.14)] px-3 py-1 text-[11px] font-mono text-[#91B4FF]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* COHORTS */}
      <section id="cohorts" className="relative px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="UPCOMING SESSIONS"
            title="The next intake"
            description="Dates are indicative until a cohort is confirmed. Register interest and we will contact you when applications open."
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-3">
            {FELLOWSHIP_COHORTS.map((cohort) => (
              <RevealItem key={cohort.name}>
                <TiltCard
                  intensity={6}
                  className="h-full rounded-[20px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 text-center shadow-sm"
                >
                  <h3 className="font-display text-lg font-semibold text-[#F7F9FC]">
                    {cohort.name}
                  </h3>
                  <p className="mt-1 text-xs font-mono text-[#A5B3C7]">{cohort.date}</p>
                  <span className="mt-4 inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-[11px] font-mono font-semibold text-[#91B4FF] border border-blue-500/20">
                    {cohort.status}
                  </span>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="HONEST DISCLOSURES" title="The honest answers" />
          <RevealStagger className="space-y-3">
            {FELLOWSHIP_FAQ.map((item) => (
              <RevealItem key={item.q}>
                <details className="group rounded-[18px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 transition-all">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-[#F7F9FC]">
                    {item.q}
                    <span className="ml-4 font-mono text-[#91B4FF] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">{item.a}</p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="relative px-6 pb-28 pt-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] backdrop-blur-[20px] p-10 sm:p-14 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />
              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl">
                Give the next eleven months a direction
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-[#A5B3C7] leading-relaxed">
                Tell us where you are, what you want to build and which track interests you. We will contact you when the next cohort opens.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-8 text-[15px] font-medium transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)]"
                >
                  <span>Register your interest</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`mailto:${FELLOWSHIP_CONTACT.email}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(18,29,47,0.7)] px-7 text-[15px] font-medium text-[#F7F9FC] backdrop-blur-md transition-all hover:bg-white/[0.08]"
                >
                  <span>Email the team</span>
                </a>
              </div>
              <p className="mt-6 text-xs font-mono text-[#7889A0]">{FELLOWSHIP_CONTACT.location}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
