import Link from "next/link";

import FinancialForms from "@/components/FinancialForms";
import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";
import {
  BUSINESS_SERVICES,
  FINANCIAL_APPROACH,
  FINANCIAL_AUDIENCES,
  FINANCIAL_COMPLIANCE,
  FINANCIAL_CONTACT,
  FINANCIAL_FAQ,
  FINANCIAL_HERO,
  FINANCIAL_INDUSTRIES,
  INDIVIDUAL_SERVICES,
  type FinancialService,
} from "@/lib/financial-data";

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
      <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mist">{description}</p>}
    </Reveal>
  );
}

function ServiceCard({ service }: { service: FinancialService }) {
  return (
    <div className="h-full rounded-3xl glass p-6 transition-transform duration-300 hover:-translate-y-1">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl">
        {service.icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mist">{service.summary}</p>
      <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
        {service.items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-relaxed text-mist">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/70" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FinancialPage() {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* 1. HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-20">
        <GlowOrb className="-left-24 top-10 h-80 w-80 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-25 blur-3xl" />
        <GlowOrb className="-right-24 bottom-10 h-80 w-80 bg-gradient-to-br from-sky-500 to-blue-600 opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/20">
              💼 {FINANCIAL_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              {FINANCIAL_HERO.title}{" "}
              <span className="text-gradient">{FINANCIAL_HERO.highlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              {FINANCIAL_HERO.description}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#enquiry"
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
              >
                Request a consultation →
              </a>
              <a
                href="#individual"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore services
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full">
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {FINANCIAL_HERO.metrics.map((metric) => (
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
            title="Advice that starts with your numbers"
            description="Filing a return is a task. Knowing what next year looks like is the point. We work with individuals and businesses across the full cycle — organise the records, file correctly, then plan forward from there."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {FINANCIAL_APPROACH.map((step) => (
              <RevealItem key={step.step}>
                <div className="h-full rounded-3xl glass p-6 transition-transform duration-300 hover:-translate-y-1">
                  <span className="font-display text-2xl font-bold text-emerald-400/60">
                    {step.step}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{step.summary}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* TWO TRACKS */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Who we work with"
            title="Two tracks, one team"
            description="Individuals and businesses have different documentation, deadlines and decisions. The work is scoped separately for each."
          />
          <RevealStagger className="grid gap-6 md:grid-cols-2">
            {FINANCIAL_AUDIENCES.map((audience) => (
              <RevealItem key={audience.id}>
                <div className="h-full rounded-3xl glass p-7">
                  <span className="text-2xl">{audience.icon}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{audience.summary}</p>
                  <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                    {audience.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm text-mist">
                        <span className="text-emerald-400">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#enquiry"
                    className="mt-6 inline-flex text-xs font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                  >
                    Start a {audience.id} enquiry →
                  </a>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 3. INDIVIDUAL SERVICES */}
      <section id="individual" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Individual services"
            title="For salaried employees & professionals"
            description="ITR filing, tax planning, budgeting and investment structure — handled together rather than as unrelated annual chores."
          />
          <RevealStagger className="grid gap-5 md:grid-cols-2">
            {INDIVIDUAL_SERVICES.map((service) => (
              <RevealItem key={service.slug}>
                <ServiceCard service={service} />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 4. BUSINESS SERVICES */}
      <section id="business" className="relative overflow-hidden px-6 py-24">
        <GlowOrb className="-right-32 top-0 h-96 w-96 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Business services"
            title="For firms, startups & companies"
            description="Entity taxation, bookkeeping, cash flow and planning for proprietorships, partnerships, LLPs, startups and companies."
          />
          <RevealStagger className="grid gap-5 md:grid-cols-2">
            {BUSINESS_SERVICES.map((service) => (
              <RevealItem key={service.slug}>
                <ServiceCard service={service} />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 5. TAX PLANNING */}
      <section id="tax-planning" className="relative px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-300">
                Tax planning
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                The best time to plan tax is not March
              </h2>
              <p className="mt-4 text-base leading-relaxed text-mist">
                Most tax savings are decided months before the return is filed — how income is
                structured, which regime fits, what documentation exists. We look at the whole year
                rather than optimising the last three weeks of it.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-fog">
                Planning is done within the current legal framework. We do not structure
                transactions to avoid tax unlawfully, and we will decline work that asks us to.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: "⚖️", title: "Regime comparison", desc: "Old vs. new, modelled on your actual numbers." },
                { icon: "🗓️", title: "Year-round planning", desc: "Decisions at the point they still matter." },
                { icon: "📄", title: "Documentation", desc: "Proofs and records that survive scrutiny." },
                { icon: "🔔", title: "Notices & compliance", desc: "Handled through qualified professionals." },
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

      {/* 6. INVESTMENT PLANNING */}
      <section id="investment" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Investment planning"
            title="Structure savings around goals, not tips"
            description="Emergency fund first, then goals by horizon and risk tolerance. This is planning and education — not regulated investment advice, and we do not sell products or promise returns."
          />
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🎯", title: "Goal setting", desc: "Education, home, retirement — each with a timeline and a number." },
              { icon: "🛟", title: "Emergency fund", desc: "The buffer that stops a shock becoming a loan." },
              { icon: "📈", title: "SIP & mutual funds", desc: "Planning guidance on route and amount, not product sales." },
              { icon: "🏦", title: "Fixed income", desc: "Where deposits and debt fit in the allocation." },
              { icon: "🌅", title: "Retirement", desc: "How much is enough, and what the gap looks like." },
              { icon: "🧭", title: "Portfolio review", desc: "Diversification and drift, reviewed periodically." },
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
          <Reveal className="mt-6">
            <p className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-xs leading-relaxed text-amber-100/90">
              <span className="font-semibold text-amber-300">Important:</span> investment
              guidance here is educational planning support. It is not regulated investment advice.
              Where a recommendation requires a registered adviser, it must come from one.
              Investments carry risk, including loss of capital; past performance does not
              indicate future returns.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 7. FINANCIAL PLANNING */}
      <section id="planning" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Financial planning"
            title="A written plan, not a conversation"
            description="Individual and business planning produce a document you can act on and revisit — budget, allocations, projections and the assumptions behind them."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl glass p-7">
                <h3 className="font-display text-lg font-semibold">For individuals</h3>
                <ul className="mt-4 space-y-2.5">
                  {[
                    "Monthly income and expense planning",
                    "Budget preparation",
                    "Savings and investment allocation",
                    "Loan and EMI planning",
                    "Tax-saving planning",
                    "Education and retirement goals",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-mist">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl glass p-7">
                <h3 className="font-display text-lg font-semibold">For businesses</h3>
                <ul className="mt-4 space-y-2.5">
                  {[
                    "Revenue and expense planning",
                    "Monthly cash flow projections",
                    "Budget preparation",
                    "Profitability analysis",
                    "Working capital management",
                    "Financial performance tracking",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-mist">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. CASH FLOW MANAGEMENT */}
      <section id="cash-flow" className="relative overflow-hidden px-6 py-24">
        <GlowOrb className="-left-32 top-10 h-96 w-96 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Cash flow management"
            title="Know what is coming before it arrives"
            description="Profit on paper and money in the bank are different things. We help individuals and businesses keep the second one visible."
          />
          <Reveal>
            <div className="rounded-3xl glass p-7">
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  "Cash flow planning and forecasting",
                  "Working capital requirement assessment",
                  "Cash transaction documentation and reconciliation",
                  "Expense tracking and record maintenance",
                  "Business cash management guidance",
                  "Financial process improvement",
                ].map((item) => (
                  <div key={item} className="flex gap-2.5 text-sm text-mist">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
                <p className="text-xs leading-relaxed text-mist">
                  <span className="font-semibold text-emerald-300">Lawful processes only:</span>{" "}
                  all cash-related work runs through documented, traceable and compliant processes.
                  We do not handle undocumented cash, and we do not assist with tax evasion.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMPLIANCE / TRUST */}
      <section id="compliance" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Trust & compliance"
            title={FINANCIAL_COMPLIANCE.title}
            description={FINANCIAL_COMPLIANCE.intro}
          />
          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FINANCIAL_COMPLIANCE.points.map((point) => (
              <RevealItem key={point.title}>
                <div
                  className={`h-full rounded-3xl glass p-6 ${
                    point.tone === "limit" ? "border-amber-400/20" : ""
                  }`}
                >
                  <h3 className="font-display text-base font-semibold">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{point.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Who this is for"
            title="Types of clients we work with"
          />
          <Reveal className="flex flex-wrap justify-center gap-2.5">
            {FINANCIAL_INDUSTRIES.map((industry) => (
              <span
                key={industry}
                className="rounded-full glass px-4 py-2 text-xs font-medium text-mist"
              >
                {industry}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 9 & 10. ENQUIRY + CONTACT */}
      <section id="enquiry" className="relative overflow-hidden px-6 py-24">
        <GlowOrb className="-left-20 bottom-0 h-80 w-80 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <div className="mb-8">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-300">
                    Enquiry
                  </span>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Request a consultation
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-mist">
                    Tell us briefly what you need. The first conversation to understand your
                    situation is free; if it needs detailed analysis we will quote for that
                    separately and in advance.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mb-8 space-y-3">
                  <a
                    href={`mailto:${FINANCIAL_CONTACT.email}?subject=Financial%20services%20enquiry`}
                    className="flex items-center gap-3 text-mist transition-colors hover:text-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl glass text-lg">
                      ✉️
                    </span>
                    {FINANCIAL_CONTACT.email}
                  </a>
                  <div className="flex items-center gap-3 text-mist">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl glass text-lg">
                      📍
                    </span>
                    {FINANCIAL_CONTACT.location}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-fog">
                  Common questions
                </h3>
                <div className="space-y-3">
                  {FINANCIAL_FAQ.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-2xl glass px-5 py-4 transition-colors open:bg-white/[0.07]"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
                        {item.q}
                        <span className="shrink-0 text-fog transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-mist">{item.a}</p>
                    </details>
                  ))}
                </div>
              </Reveal>
            </div>

            <div>
              <Reveal delay={0.1}>
                <FinancialForms />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-fog sm:flex-row">
          <p>
            Kavi Financial Services — a business vertical of{" "}
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
