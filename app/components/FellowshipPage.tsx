"use client";

import Link from "next/link";
import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";

const tracks = [
  {
    icon: "🎓",
    title: "Mentorship",
    desc: "One-on-one guidance from senior engineers and designers building real products.",
  },
  {
    icon: "🧑‍💻",
    title: "Build in public",
    desc: "Ship a portfolio-worthy project with a team, reviewed weekly by experts.",
  },
  {
    icon: "🤝",
    title: "Network",
    desc: "Join a tight community of builders, founders and recruiters.",
  },
  {
    icon: "🎁",
    title: "Opportunities",
    desc: "Top fellows get referrals, internships and early access to Kavi projects.",
  },
];

const schedule = [
  { week: "Weeks 1–2", title: "Foundation", desc: "Onboarding, tooling setup, project ideation and team formation." },
  { week: "Weeks 3–6", title: "Build", desc: "Sprint cycles with weekly mentor reviews, code quality focus and design iteration." },
  { week: "Weeks 7–10", title: "Scale", desc: "Production deployment, testing, performance tuning and user feedback." },
  { week: "Weeks 11–12", title: "Launch & demo", desc: "Demo day presentation, portfolio polish and career prep with referrals." },
];

const faq = [
  { q: "Who can apply?", a: "Students and early-career developers with 0–3 years of experience. We value curiosity and drive over polished resumes." },
  { q: "Is it paid?", a: "The fellowship is free to participate. Top performers receive stipends, internship offers and project-based compensation." },
  { q: "What's the time commitment?", a: "15–20 hours per week. We design it to fit alongside university schedules and part-time work." },
  { q: "Do I need to know a specific tech stack?", a: "We work with React, Next.js, React Native and Node.js. Basic JavaScript knowledge is enough — we'll ramp you up." },
  { q: "What happens after the fellowship?", a: "Top fellows get full-time referrals, internship tracks at Kavi Solutions or partner companies and lifetime community access." },
  { q: "Can I apply if I'm not in India?", a: "Yes. The program is remote-first. We've had fellows across India and Southeast Asia." },
];

const cohorts = [
  { name: "Winter 2026", status: "Open", date: "Jan – Mar 2026" },
  { name: "Spring 2026", status: "Coming soon", date: "Apr – Jun 2026" },
  { name: "Summer 2026", status: "Coming soon", date: "Jul – Sep 2026" },
];

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
              🎓 Fellowship Program
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Launch your career with{" "}
              <span className="text-gradient">Kavi Fellows</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-mist sm:text-lg">
              A 12-week immersive program where students and early-career devs
              build real products, learn from senior engineers, and get hired.
              No fluff — just shipping, mentorship and career acceleration.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#apply"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105"
              >
                Apply now →
              </a>
              <a
                href="#tracks"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Learn more
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full max-w-3xl">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {[
                { value: "12", label: "Weeks immersive" },
                { value: "4+", label: "Cohorts per year" },
                { value: "85%", label: "Placement rate" },
                { value: "Free", label: "No cost to join" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="group flex flex-col items-center gap-1 bg-ink-soft p-6 transition-colors hover:bg-white/5"
                >
                  <span className="font-display text-2xl font-bold text-gradient transition-transform group-hover:scale-110 sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="text-xs text-fog">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              What you get from <span className="text-gradient">the program</span>
            </h2>
          </Reveal>
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((t) => (
              <RevealItem key={t.title}>
                <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/25" />
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/30 text-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                    {t.icon}
                  </span>
                  <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{t.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              12-week <span className="text-gradient">roadmap</span>
            </h2>
          </Reveal>
          <RevealStagger className="space-y-4">
            {schedule.map((s) => (
              <RevealItem key={s.week}>
                <div className="group flex items-start gap-5 rounded-2xl glass p-6 shadow-lift transition-all duration-300 hover:border-white/20 hover:bg-white/5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 font-display text-xs font-bold text-white">
                    {s.week}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-mist">{s.desc}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* COHORTS */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Upcoming <span className="text-gradient">cohorts</span>
            </h2>
          </Reveal>
          <RevealStagger className="grid gap-4 sm:grid-cols-3">
            {cohorts.map((c) => (
              <RevealItem key={c.name}>
                <div className="group relative overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                  <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                  <p className="mt-1 text-sm text-mist">{c.date}</p>
                  <span
                    className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold ${
                      c.status === "Open"
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                        : "bg-white/5 text-fog ring-1 ring-white/10"
                    }`}
                  >
                    {c.status}
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
          <Reveal className="mx-auto mb-10 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>
          <RevealStagger className="space-y-4">
            {faq.map((f) => (
              <RevealItem key={f.q}>
                <details className="group rounded-2xl glass p-6 shadow-lift transition-colors hover:border-white/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold">
                    {f.q}
                    <span className="ml-4 text-mist transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{f.a}</p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* CTA */}
      <section id="apply" className="relative overflow-hidden px-6 pb-28 pt-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-sky-500 p-10 text-center text-white shadow-glow">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to build your future?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                  Applications for Winter 2026 are open. Apply now — spots are limited
                  and we review on a rolling basis.
                </p>
                <Link
                  href="/#contact"
                  className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lift transition-all hover:scale-105"
                >
                  Apply for the fellowship →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
