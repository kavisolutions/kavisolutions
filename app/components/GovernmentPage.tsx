import Link from "next/link";

import GovernmentForms from "@/components/GovernmentForms";
import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";
import {
  GOVERNMENT_APPROACH,
  GOVERNMENT_ASSESSMENT,
  GOVERNMENT_CAPABILITIES,
  GOVERNMENT_CONTACT,
  GOVERNMENT_FAQ,
  GOVERNMENT_FOCUS_AREAS,
  GOVERNMENT_HERO,
  GOVERNMENT_PLATFORM_GROUPS,
  GOVERNMENT_POLYCET_JOURNEY,
} from "@/lib/government-data";

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
      <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-sky-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mist">{description}</p>}
    </Reveal>
  );
}

export function GovernmentPage() {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-20">
        <GlowOrb className="-left-24 top-10 h-80 w-80 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-25 blur-3xl" />
        <GlowOrb className="-right-24 bottom-10 h-80 w-80 bg-gradient-to-br from-amber-500 to-orange-500 opacity-15 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-sky-300 ring-1 ring-sky-400/20">
              🏛️ {GOVERNMENT_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              {GOVERNMENT_HERO.title}{" "}
              <span className="text-gradient">{GOVERNMENT_HERO.highlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              {GOVERNMENT_HERO.description}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#enquiry"
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
              >
                Discuss a modernisation brief →
              </a>
              <a
                href="#focus"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore focus areas
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full">
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {GOVERNMENT_HERO.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col items-center gap-1 bg-ink-soft p-6 transition-colors hover:bg-white/5"
                >
                  <span className="font-display text-2xl font-bold text-gradient sm:text-3xl">
                    {metric.value}
                  </span>
                  <span className="text-center text-xs text-fog">{metric.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Our approach"
            title="Start with the citizen journey, not the homepage"
            description="A government platform is only as good as the task a citizen can complete on it. We map the end-to-end journey first, then modernise the layers underneath."
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {GOVERNMENT_APPROACH.map((item) => (
              <RevealItem key={item.step}>
                <div className="h-full rounded-3xl glass p-5">
                  <span className="font-display text-xs font-bold text-sky-300">{item.step}</span>
                  <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{item.summary}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FOCUS AREAS */}
      <section id="focus" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Focus areas"
            title="Where we can help"
            description="Four connected workstreams. Each can be delivered as an assessment, a fixed-scope project or an embedded workstream alongside an existing team."
          />
          <RevealStagger className="grid gap-6 md:grid-cols-2">
            {GOVERNMENT_FOCUS_AREAS.map((area) => (
              <RevealItem key={area.slug}>
                <div className="h-full rounded-3xl glass p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
                    {area.icon}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold">{area.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{area.summary}</p>
                  <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                    {area.items.map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-relaxed text-mist">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* PLATFORM DIRECTORY */}
      <section id="platforms" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Platform directory"
            title="Initial assessment focus: Andhra Pradesh"
            description="We are building a structured directory of public platforms, starting with AP state government, education and examination services. These are evaluation candidates, not clients or confirmed partnerships."
          />
          <RevealStagger className="grid gap-6 lg:grid-cols-3">
            {GOVERNMENT_PLATFORM_GROUPS.map((group) => (
              <RevealItem key={group.id}>
                <div className="h-full rounded-3xl glass p-6">
                  <h3 className="font-display text-lg font-semibold">{group.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{group.summary}</p>
                  <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                    {group.platforms.map((platform) => (
                      <li key={platform} className="flex gap-2 text-xs leading-relaxed text-mist">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400/70" />
                        {platform}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
          <Reveal className="mx-auto mt-8 max-w-3xl text-center">
            <p className="text-xs leading-relaxed text-fog">
              Platform names are used for assessment and capability illustration only. No
              government body has endorsed this page or engaged Kavi Solutions unless a signed
              agreement says otherwise.
            </p>
          </Reveal>
        </div>
      </section>

      {/* POLYCET JOURNEY */}
      <section id="polycet" className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Reference journey"
            title="POLYCET: notification to admission"
            description="A single examination journey touches notifications, applications, payments, hall tickets, results, counselling and college admission. Improving one screen without fixing the hand-offs rarely helps the student."
          />
          <div className="relative space-y-4 border-l border-white/10 pl-6">
            {GOVERNMENT_POLYCET_JOURNEY.map((step) => (
              <RevealItem key={step.step}>
                <div className="relative rounded-2xl glass p-6">
                  <span className="absolute -left-[2.15rem] top-6 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-[10px] font-bold text-white">
                    {step.step}
                  </span>
                  <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{step.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.improvements.map((item) => (
                      <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-mist">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* ASSESSMENT FRAMEWORK */}
      <section id="assessment" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Assessment framework"
            title="A repeatable way to find what matters"
            description="Every platform gets the same structured review, so findings are comparable and improvements can be sequenced honestly."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GOVERNMENT_ASSESSMENT.map((group) => (
              <RevealItem key={group.title}>
                <div className="h-full rounded-3xl glass p-6">
                  <h3 className="font-display text-base font-semibold">{group.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-relaxed text-mist">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-blue-600/15 to-cyan-500/5 p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-sky-300">
                🛡️ Security & compliance
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Security work starts with authorisation
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist">
                Government platforms hold sensitive citizen data. We work within a written scope,
                avoid intrusive testing without permission, and report findings responsibly. The
                goal is a safer service — not a headline.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Authentication and session hardening",
                  "Role-based access and least privilege",
                  "Secure API and database patterns",
                  "Secrets and dependency hygiene",
                  "Audit logging and incident readiness",
                  "Privacy and retention safeguards",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-xs text-mist">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Technology capabilities"
            title="Data, frontend and backend — under one team"
            description="Modernisation fails when the layers are outsourced to people who never speak to each other. We keep the architecture and the delivery in the same conversation."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GOVERNMENT_CAPABILITIES.map((capability) => (
              <RevealItem key={capability.title}>
                <div className="h-full rounded-3xl glass p-6">
                  <span className="text-2xl">{capability.icon}</span>
                  <h3 className="mt-3 font-display text-base font-semibold">{capability.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {capability.items.map((item) => (
                      <li key={item} className="text-xs leading-relaxed text-mist">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Common questions" title="Before you brief us" />
          <RevealStagger className="space-y-3">
            {GOVERNMENT_FAQ.map((item) => (
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

      {/* ENQUIRY */}
      <section id="enquiry" className="relative px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="rounded-3xl glass p-8">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Talk to us about a public platform
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-mist">
                Share the department, platform and problem. If the work needs formal procurement
                or written authorisation first, say so — we will keep the conversation at the right
                level.
              </p>
              <div className="mt-8 space-y-3 text-sm">
                <p className="text-mist">
                  <span className="font-semibold text-white">Email:</span>{" "}
                  <a className="text-sky-300 hover:text-sky-200" href={`mailto:${GOVERNMENT_CONTACT.email}`}>
                    {GOVERNMENT_CONTACT.email}
                  </a>
                </p>
                <p className="text-mist">
                  <span className="font-semibold text-white">Location:</span> {GOVERNMENT_CONTACT.location}
                </p>
              </div>
              <p className="mt-8 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-200/80">
                We do not claim government empanelment, accreditation or an existing client
                relationship on this page. Any assessment begins only after written authorisation.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <GovernmentForms />
          </Reveal>
        </div>
      </section>

      <div className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-fog sm:flex-row">
          <p>
            Kavi Government Technology Services — a business vertical of{" "}
            <Link href="/" className="text-mist transition-colors hover:text-white">
              Kavi Solutions
            </Link>
            .
          </p>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/projects" className="transition-colors hover:text-white">
              Projects
            </Link>
            <Link href="/#contact" className="transition-colors hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
