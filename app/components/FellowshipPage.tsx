import Link from "next/link";

import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";
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
      <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-violet-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mist">{description}</p>}
    </Reveal>
  );
}

export default function FellowshipPage() {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-20">
        <GlowOrb className="-left-24 top-10 h-80 w-80 bg-violet-600/30 blur-3xl" />
        <GlowOrb className="-right-24 bottom-10 h-80 w-80 bg-sky-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-600/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gradient ring-1 ring-violet-400/30">
              🎓 {FELLOWSHIP_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              {FELLOWSHIP_HERO.title}{" "}
              <span className="text-gradient">{FELLOWSHIP_HERO.highlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              {FELLOWSHIP_HERO.description}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#apply"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
              >
                Register your interest →
              </a>
              <a
                href="#curriculum"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the 11-month journey
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full max-w-3xl">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {FELLOWSHIP_HERO.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="group flex flex-col items-center gap-1 bg-ink-soft p-6 transition-colors hover:bg-white/5"
                >
                  <span className="font-display text-2xl font-bold text-gradient transition-transform group-hover:scale-110 sm:text-3xl">
                    {metric.value}
                  </span>
                  <span className="text-center text-xs text-fog">{metric.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.5} className="mt-6">
            <p className="text-xs text-fog">
              {FELLOWSHIP_LANGUAGES.primary} primary · {FELLOWSHIP_LANGUAGES.support} support ·
              No placement guarantee
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Who it's for"
            title="If you are willing to do the work, the door is open"
            description="This is not a finishing school for people who already have every advantage. It is a structured way back into learning for people who need a real opportunity."
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FELLOWSHIP_AUDIENCE.map((item) => (
              <RevealItem key={item}>
                <div className="h-full rounded-3xl glass p-5 text-sm leading-relaxed text-mist">
                  <span className="mr-2 text-violet-300">→</span>
                  {item}
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Three pillars"
            title="Silence, leadership and service"
            description="Knowledge without self-awareness becomes arrogance. Skill without service becomes extraction. The programme is built around three practices that keep each other honest."
          />
          <RevealStagger className="grid gap-6 lg:grid-cols-3">
            {FELLOWSHIP_PILLARS.map((pillar) => (
              <RevealItem key={pillar.id}>
                <div className="h-full rounded-3xl glass p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
                    {pillar.icon}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{pillar.summary}</p>
                  <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                    {pillar.practices.map((practice) => (
                      <li key={practice} className="flex gap-2 text-xs leading-relaxed text-mist">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400/70" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="The 11-month journey"
            title="From foundation to a public capstone"
            description="Five phases, one cohort. Every phase ends with something you can show, not just something you attended."
          />
          <div className="space-y-4">
            {FELLOWSHIP_PHASES.map((phase) => (
              <RevealItem key={phase.months}>
                <div className="rounded-3xl glass p-6 sm:p-7">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-300">
                        {phase.months}
                      </span>
                      <h3 className="font-display text-xl font-semibold">{phase.title}</h3>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-fog">
                      Phase {FELLOWSHIP_PHASES.indexOf(phase) + 1} of 5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{phase.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {phase.outcomes.map((outcome) => (
                      <span key={outcome} className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-mist">
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
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Weekly rhythm"
            title="A week that has a shape"
            description="The exact timetable changes by phase and track, but the week always balances learning, building, mentorship, service and rest."
          />
          <RevealStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FELLOWSHIP_WEEK.map((day) => (
              <RevealItem key={day.day}>
                <div className="h-full rounded-2xl glass p-5">
                  <span className="font-display text-xs font-bold text-violet-300">{day.day}</span>
                  <h3 className="mt-1 font-display text-base font-semibold">{day.focus}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-mist">{day.detail}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Tracks"
            title="Choose the work you want to be good at"
            description="Every fellow chooses a primary track in month two. The track sets the project briefs, mentor group and portfolio focus."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2">
            {FELLOWSHIP_TRACKS.map((track) => (
              <RevealItem key={track.title}>
                <div className="h-full rounded-3xl glass p-6">
                  <span className="text-2xl">{track.icon}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{track.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{track.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {track.roles.map((role) => (
                      <span key={role} className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-mist">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* MENTORS & LANGUAGE */}
      <section className="relative px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl glass p-7">
              <h2 className="font-display text-2xl font-bold tracking-tight">Mentors who stay</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                The programme is built around people who are available week after week, not
                one-off guest sessions.
              </p>
              <div className="mt-6 space-y-4">
                {FELLOWSHIP_MENTORS.map((mentor) => (
                  <div key={mentor.name} className="border-t border-white/10 pt-4">
                    <p className="font-display text-base font-semibold">{mentor.name}</p>
                    <p className="text-xs text-violet-300">{mentor.role}</p>
                    <p className="mt-1 text-xs leading-relaxed text-mist">{mentor.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border border-sky-400/20 bg-gradient-to-br from-violet-600/15 to-sky-500/5 p-7">
              <h2 className="font-display text-2xl font-bold tracking-tight">Language</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">{FELLOWSHIP_LANGUAGES.note}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-fog">Primary</p>
                  <p className="mt-1 font-display text-lg font-semibold">{FELLOWSHIP_LANGUAGES.primary}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-fog">Support</p>
                  <p className="mt-1 font-display text-lg font-semibold">{FELLOWSHIP_LANGUAGES.support}</p>
                </div>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-fog">
                Content folders are organised by language so Telugu pages, videos and captions can be
                added without duplicating the layout.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COHORTS */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Cohorts"
            title="The next intake"
            description="Dates are indicative until a cohort is confirmed. Register interest and we will contact you when applications open."
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-3">
            {FELLOWSHIP_COHORTS.map((cohort) => (
              <RevealItem key={cohort.name}>
                <div className="h-full rounded-3xl glass p-6 text-center">
                  <h3 className="font-display text-lg font-semibold">{cohort.name}</h3>
                  <p className="mt-1 text-xs text-mist">{cohort.date}</p>
                  <span className="mt-4 inline-flex rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 ring-1 ring-violet-400/20">
                    {cohort.status}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Frequently asked questions" title="The honest answers" />
          <RevealStagger className="space-y-3">
            {FELLOWSHIP_FAQ.map((item) => (
              <RevealItem key={item.q}>
                <details className="group rounded-2xl glass p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold">
                    {item.q}
                    <span className="ml-4 text-mist transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{item.a}</p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="relative overflow-hidden px-6 pb-28 pt-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-sky-500 p-10 text-center text-white shadow-glow">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Give the next eleven months a direction
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                  Tell us where you are, what you want to build and which track interests you. We
                  will contact you when the next cohort opens.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/#contact"
                    className="rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lift transition-transform hover:scale-105"
                  >
                    Register your interest →
                  </Link>
                  <a
                    href={`mailto:${FELLOWSHIP_CONTACT.email}`}
                    className="rounded-2xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Email the team
                  </a>
                </div>
                <p className="mt-5 text-xs text-white/70">{FELLOWSHIP_CONTACT.location}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
