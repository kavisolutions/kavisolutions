import Link from "next/link";

import SurveyForms from "@/components/SurveyForms";
import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";
import {
  SURVEY_APPROACH,
  SURVEY_CLIENT_QUESTIONS,
  SURVEY_CONTACT,
  SURVEY_ENGAGEMENT_MODELS,
  SURVEY_FIELD_NETWORK,
  SURVEY_HERO,
  SURVEY_INDUSTRIES,
  SURVEY_OPPORTUNITIES,
  SURVEY_SURVEYOR_QUESTIONS,
  SURVEY_VERTICALS,
} from "@/lib/survey-data";

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
      <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-teal-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mist">{description}</p>}
    </Reveal>
  );
}

function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl glass px-5 py-4 transition-colors open:bg-white/[0.07]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
            {item.q}
            <span className="shrink-0 text-fog transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-mist">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function SurveyPage() {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* 1. HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-20">
        <GlowOrb className="-left-24 top-10 h-80 w-80 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-25 blur-3xl" />
        <GlowOrb className="-right-24 bottom-10 h-80 w-80 bg-gradient-to-br from-sky-500 to-cyan-500 opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-teal-300 ring-1 ring-teal-400/20">
              🔎 {SURVEY_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              {SURVEY_HERO.title} <span className="text-gradient">{SURVEY_HERO.highlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              {SURVEY_HERO.description}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#client-enquiry"
                className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
              >
                Discuss a survey project →
              </a>
              <a
                href="#join-network"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Join the survey network
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full">
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {SURVEY_HERO.metrics.map((metric) => (
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

      {/* 2. ABOUT / APPROACH */}
      <section id="approach" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="About us"
            title="Research you can defend"
            description="Most survey problems are design problems. We start from the decision the data has to support, then work backwards to the instrument, the sample and the fieldwork — so the numbers hold up when someone questions them."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SURVEY_APPROACH.map((step) => (
              <RevealItem key={step.step}>
                <div className="h-full rounded-3xl glass p-6 transition-transform duration-300 hover:-translate-y-1">
                  <span className="font-display text-2xl font-bold text-teal-400/60">{step.step}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{step.summary}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 3. SURVEY SERVICES (six verticals) */}
      <section id="services" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Survey services"
            title="Six research verticals"
            description="Field surveys, market research, political and social research, analysis, predictive work and academic support — each with its own method and its own deliverable."
          />
          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SURVEY_VERTICALS.map((vertical) => (
              <RevealItem key={vertical.slug}>
                <div className="h-full rounded-3xl glass p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl">
                      {vertical.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                      {vertical.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{vertical.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{vertical.summary}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                    {vertical.services.map((service) => (
                      <li key={service} className="flex gap-2 text-xs leading-relaxed text-mist">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400/70" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 4. MARKET RESEARCH — narrative band */}
      <section className="relative overflow-hidden px-6 py-24">
        <GlowOrb className="-right-32 top-0 h-96 w-96 bg-gradient-to-br from-sky-500 to-cyan-500 opacity-15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-sky-300">
                Market research
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Test the assumption before you spend on it
              </h2>
              <p className="mt-4 text-base leading-relaxed text-mist">
                Product launches, brand repositioning, pricing changes — the expensive mistakes
                are usually assumptions that were never checked. We design the study that checks
                them and report what the data actually says, including when the answer is no.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-fog">
                Every engagement distinguishes measured findings from estimates and predictions,
                with assumptions and limitations stated explicitly.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: "🎯", title: "Brand perception", desc: "How the market sees you vs. competitors." },
                { icon: "🧪", title: "Product validation", desc: "Feedback before a full launch." },
                { icon: "💬", title: "Customer satisfaction", desc: "Where the experience breaks down." },
                { icon: "🔍", title: "Competitor research", desc: "Positioning, pricing and share." },
                { icon: "📉", title: "Adoption studies", desc: "Who uses it, and who drops off." },
                { icon: "📐", title: "Opportunity sizing", desc: "How big the market actually is." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl glass p-5">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-mist">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. FIELD OPERATIONS & NETWORK */}
      <section id="field-operations" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Field operations"
            title={SURVEY_FIELD_NETWORK.title}
            description={SURVEY_FIELD_NETWORK.description}
          />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <ul className="grid gap-3 sm:grid-cols-2">
                {SURVEY_FIELD_NETWORK.points.map((point) => (
                  <li key={point} className="flex gap-3 rounded-2xl glass px-4 py-3.5">
                    <span className="mt-0.5 text-teal-400">✓</span>
                    <span className="text-sm leading-relaxed text-mist">{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="h-full rounded-3xl glass p-6">
                <h3 className="font-display text-lg font-semibold">Network at a glance</h3>
                <dl className="mt-5 space-y-4">
                  {SURVEY_FIELD_NETWORK.capabilities.map((capability) => (
                    <div key={capability.label}>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                        {capability.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-mist">{capability.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. DATA ANALYSIS & REPORTING */}
      <section id="analysis" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Data analysis & reporting"
            title="From raw responses to a decision"
            description="Collection is half the work. The other half is cleaning, structuring and analysing the data — then presenting it in the form the reader will actually use."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🧹", title: "Cleaning & validation", desc: "Duplicate checks, logic validation, outlier review and back-checks against field records." },
              { icon: "🗂️", title: "Structuring", desc: "Coding open responses, building the analysis dataset and documenting every transformation." },
              { icon: "📊", title: "Statistical analysis", desc: "Cross-tabs, weighting, significance testing and comparative analysis across segments." },
              { icon: "📑", title: "Reports & dashboards", desc: "Executive summaries, full reports, charts and dashboards tailored to the audience." },
            ].map((item) => (
              <RevealItem key={item.title}>
                <div className="h-full rounded-3xl glass p-6">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{item.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 7. PREDICTIVE RESEARCH */}
      <section className="relative overflow-hidden px-6 py-24">
        <GlowOrb className="-left-32 top-10 h-96 w-96 bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Predictive research"
            title="Forecasting that states its limits"
            description="Predictive work is only useful if the reader knows how much confidence to place in it. We separate what the data measured from what we inferred, and we publish the assumptions."
          />
          <Reveal>
            <div className="rounded-3xl glass p-7">
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { label: "Measured", tone: "text-emerald-300", desc: "Directly observed in the collected data. Highest confidence." },
                  { label: "Estimated", tone: "text-amber-300", desc: "Modelled from the data using stated assumptions and weighting." },
                  { label: "Predicted", tone: "text-violet-300", desc: "Scenario-based forecast. Directional, with limitations declared." },
                ].map((item) => (
                  <div key={item.label}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${item.tone}`}>
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-mist">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs leading-relaxed text-fog">
                  Deliverables include research-based presentations, business and market insight
                  decks, and decision-support reports. Where sufficient data does not exist, we
                  say so instead of forecasting anyway.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. ACADEMIC SUPPORT */}
      <section id="academic" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-amber-300">
                  Academic research support
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Support across the research lifecycle
                </h2>
                <p className="mt-4 text-base leading-relaxed text-mist">
                  For students, scholars, educational institutions and research organisations —
                  from questionnaire design and fieldwork through to data processing and
                  presentation preparation.
                </p>
                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                    Research integrity
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    We support the collection and analysis of real data. We do not fabricate data,
                    results or findings, and we will decline work that requires it.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {[
                  "Primary and secondary data collection",
                  "Questionnaire and survey design",
                  "Research methodology support",
                  "Field research coordination",
                  "Data processing and analysis",
                  "Research report preparation",
                  "Research paper data support",
                  "Charts, tables and presentations",
                  "Research findings documentation",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 rounded-xl glass px-4 py-3">
                    <span className="text-amber-300">•</span>
                    <span className="text-xs leading-relaxed text-mist">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. ENGAGEMENT MODELS */}
      <section id="engagement" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Engagement models"
            title="Five ways to work with us"
            description="Start with the piece you need. Every model can extend into a full engagement later."
          />
          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SURVEY_ENGAGEMENT_MODELS.map((model) => (
              <RevealItem key={model.id}>
                <div className="h-full rounded-3xl glass p-6 transition-transform duration-300 hover:-translate-y-1">
                  <span className="text-2xl">{model.icon}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{model.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{model.summary}</p>
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-fog">
                    <span className="font-semibold text-teal-300">Best for:</span> {model.bestFor}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 10. INDUSTRIES + OPPORTUNITIES */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Sectors"
            title="Industries we work across"
            description="Field research is sector-agnostic; the method and the compliance requirements are not. These are the sectors we are set up for."
          />
          <Reveal className="mb-14 flex flex-wrap justify-center gap-2.5">
            {SURVEY_INDUSTRIES.map((industry) => (
              <span
                key={industry}
                className="rounded-full glass px-4 py-2 text-xs font-medium text-mist"
              >
                {industry}
              </span>
            ))}
          </Reveal>

          <Reveal>
            <div className="rounded-3xl glass p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold">Business development</h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-mist">
                    Organisations we are in discussion with or exploring opportunities with. These
                    are potential engagements, not confirmed clients or partnerships.
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-fog">
                  Opportunities
                </span>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SURVEY_OPPORTUNITIES.map((opportunity) => (
                  <li
                    key={opportunity.name}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-white">{opportunity.name}</p>
                    <p className="mt-0.5 text-xs text-fog">{opportunity.note}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] leading-relaxed text-fog">
                This list is maintained as the network expands and will be updated as
                conversations progress.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11. JOIN NETWORK + 12. CLIENT ENQUIRY, with FAQs */}
      <section id="join-network" className="relative overflow-hidden px-6 py-24">
        <GlowOrb className="-left-20 bottom-0 h-80 w-80 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <div className="mb-8">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-teal-300">
                    Join our network
                  </span>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Work with us on field projects
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-mist">
                    We are building a network of surveyors, field researchers, coordinators and
                    analysts across India. Register your details and we will contact you when a
                    project needs someone with your location and language coverage.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-fog">
                  Common questions
                </h3>
                <Faq items={SURVEY_SURVEYOR_QUESTIONS} />
              </Reveal>

              <Reveal delay={0.15}>
                <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-fog">
                  For clients
                </h3>
                <Faq items={SURVEY_CLIENT_QUESTIONS} />
              </Reveal>
            </div>

            <div id="client-enquiry">
              <Reveal delay={0.1}>
                <SurveyForms />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative px-6 pb-28 pt-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="rounded-3xl glass p-8 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Talk to the research team
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mist">
                Tell us the question you need answered and the locations involved. We will come
                back with a proposed method, timeline and cost.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={`mailto:${SURVEY_CONTACT.email}?subject=Survey%20%26%20research%20enquiry`}
                  className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
                >
                  {SURVEY_CONTACT.email}
                </a>
                <a
                  href="#client-enquiry"
                  className="rounded-2xl glass px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Use the enquiry form
                </a>
              </div>
              <p className="mt-5 text-xs text-fog">{SURVEY_CONTACT.location}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Back to main site */}
      <div className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-fog sm:flex-row">
          <p>
            Kavi Survey &amp; Research Solutions — a business vertical of{" "}
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
