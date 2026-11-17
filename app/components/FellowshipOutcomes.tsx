import Link from "next/link";
import { ArrowRight, BarChart3, Quote } from "lucide-react";
import {
  FELLOWSHIP_MEASURES,
  FELLOWSHIP_NEXT_STEPS,
} from "@/lib/fellowship-data";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion";

export default function FellowshipOutcomes() {
  return (
    <section id="outcomes" className="relative px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              AFTER THE FELLOWSHIP
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl lg:text-5xl">
            A next step, not a promise
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#A5B3C7]">
            Fellows leave with a portfolio, a public capstone and a written
            next-step plan. We publish outcomes we can verify — not
            testimonials we do not have.
          </p>
        </Reveal>

        <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FELLOWSHIP_NEXT_STEPS.map((step, index) => (
            <RevealItem key={step.title}>
              <div className="h-full rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-5 backdrop-blur-[16px]">
                <span className="font-mono text-[10px] text-[#91B4FF]">
                  0{index + 1}
                </span>
                <h3 className="mt-2 font-display text-base font-semibold text-[#F7F9FC]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                  {step.detail}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={0.08}>
            <div className="h-full rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px] sm:p-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#34D399]" />
                <h3 className="font-display text-lg font-semibold text-[#F7F9FC]">
                  What we will publish
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                After the first cohort completes, this page will show
                cohort-level outcomes. We do not publish numbers before they
                exist.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {FELLOWSHIP_MEASURES.map((measure) => (
                  <li
                    key={measure}
                    className="flex gap-2 text-[11px] leading-relaxed text-[#A5B3C7]"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#34D399]" />
                    {measure}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="flex h-full flex-col justify-between rounded-[24px] border border-blue-500/20 bg-blue-500/[0.06] p-6 backdrop-blur-[16px] sm:p-8">
              <div>
                <Quote className="h-5 w-5 text-[#91B4FF]" />
                <h3 className="mt-3 font-display text-lg font-semibold text-[#F7F9FC]">
                  First cohort: January 2027
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                  Alumni stories, destinations and outcome data will be added
                  only after fellows complete the programme. Until then, judge
                  us by the structure, the mentors and the terms in writing.
                </p>
              </div>
              <Link
                href="#apply"
                className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-[10px] bg-[#175CD3] px-4 text-xs font-medium text-white transition-colors hover:bg-[#1849A9]"
              >
                Apply for the first cohort
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
