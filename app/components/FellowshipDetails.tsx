import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  FELLOWSHIP_DETAILS,
  FELLOWSHIP_NOT_PROMISED,
  FELLOWSHIP_PARENT_FAQ,
  FELLOWSHIP_SELECTION_STEPS,
} from "@/lib/fellowship-data";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion";

const DETAIL_ICONS = {
  graduation: GraduationCap,
  wallet: Wallet,
  map: MapPin,
  calendar: CalendarDays,
  shield: ShieldCheck,
  award: Award,
} as const;

const DETAIL_COLORS = {
  graduation: "#3B82F6",
  wallet: "#34D399",
  map: "#06B6D4",
  calendar: "#91B4FF",
  shield: "#FBBF24",
  award: "#8B5CF6",
} as const;

export default function FellowshipDetails() {
  return (
    <section id="details" className="relative scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              THE PRACTICAL DETAILS
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl lg:text-5xl">
            Before you apply, know exactly what this is
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#A5B3C7]">
            Eligibility, selection, money, location, safety and completion — in
            one place. Anything cohort-specific is confirmed in writing before
            you accept an offer.
          </p>
        </Reveal>

        <RevealStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FELLOWSHIP_DETAILS.map((detail) => {
            const Icon = DETAIL_ICONS[detail.icon];
            const color = DETAIL_COLORS[detail.icon];

            return (
              <RevealItem key={detail.id}>
                <div className="group relative h-full overflow-hidden rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 shadow-sm backdrop-blur-[16px]">
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-70"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${color}, transparent)`,
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(148,163,184,0.16)] bg-[#19202E]"
                      style={{ color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#F7F9FC]">
                        {detail.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-[#7889A0]">
                        {detail.summary}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {detail.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 text-xs leading-relaxed text-[#A5B3C7]"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>

        <Reveal delay={0.08} className="mt-6">
          <div className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur-[16px] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
                  SELECTION
                </span>
                <h3 className="mt-1 font-display text-xl font-semibold text-[#F7F9FC]">
                  Four steps, no payment at application
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#7889A0]">
                dates confirmed per cohort
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FELLOWSHIP_SELECTION_STEPS.map((step, index) => (
                <div
                  key={step.step}
                  className="relative rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#91B4FF]">
                      {step.step}
                    </span>
                    {index < FELLOWSHIP_SELECTION_STEPS.length - 1 && (
                      <ArrowRight className="hidden h-3 w-3 text-[#7889A0] lg:block" />
                    )}
                  </div>
                  <h4 className="mt-2 font-display text-sm font-semibold text-[#F7F9FC]">
                    {step.title}
                  </h4>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#A5B3C7]">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal delay={0.1}>
            <div className="h-full rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px] sm:p-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
                FOR PARENTS AND GUARDIANS
              </span>
              <h3 className="mt-1 font-display text-xl font-semibold text-[#F7F9FC]">
                The questions families ask
              </h3>
              <div className="mt-5 space-y-2">
                {FELLOWSHIP_PARENT_FAQ.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] px-4 py-3"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[#F7F9FC]">
                      {item.q}
                      <span className="ml-4 font-mono text-[#91B4FF] transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/[0.06] p-6 backdrop-blur-[16px]">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-[#FBBF24]" />
                  <h3 className="font-display text-base font-semibold text-[#F7F9FC]">
                    What we do not promise
                  </h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {FELLOWSHIP_NOT_PROMISED.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-xs leading-relaxed text-[#A5B3C7]"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#FBBF24]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px]">
                <h3 className="font-display text-base font-semibold text-[#F7F9FC]">
                  Still unsure?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                  Ask about fees, scholarships, accommodation, location or
                  safety before applying. We will put the cohort terms in
                  writing before an offer.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="mailto:kavisolutions1@gmail.com"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.7)] px-3 text-[11px] font-medium text-[#F7F9FC] transition-colors hover:bg-white/[0.06]"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#91B4FF]" />
                    Email the team
                  </a>
                  <Link
                    href="/#contact"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#175CD3] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#1849A9]"
                  >
                    Register interest
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-[#7889A0]">
          Current as of November 2026. Cohort-specific terms are confirmed in
          writing before an offer.
        </p>
      </div>
    </section>
  );
}
