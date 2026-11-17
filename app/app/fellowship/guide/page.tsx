import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FellowshipGuidePrint from "@/components/FellowshipGuidePrint";
import {
  FELLOWSHIP_AT_A_GLANCE,
  FELLOWSHIP_DETAILS,
  FELLOWSHIP_PARENT_FAQ,
  FELLOWSHIP_SELECTION_STEPS,
} from "@/lib/fellowship-data";

export const metadata: Metadata = {
  title: "Kavi Fellowship — Programme Guide | Kavi Solutions",
  description:
    "Print-friendly Kavi Fellowship guide: eligibility, selection, money, location, safety, completion and parent/guardian questions.",
};

export default function FellowshipGuide() {
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-slate-900 print:px-0 print:py-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/fellowship"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to fellowship
          </Link>
          <FellowshipGuidePrint />
        </div>

        <header className="mt-8 border-b border-slate-200 pb-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700">
            KAVI SOLUTIONS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Kavi Fellowship — Programme Guide
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            An 11-month, full-time cohort programme in Andhra Pradesh and
            Telangana. English primary, Telugu support. No salary, no placement
            guarantee. Cohort-specific terms are confirmed in writing before an
            offer.
          </p>
          <p className="mt-3 font-mono text-[10px] text-slate-500">
            Current as of November 2026
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">At a glance</h2>
          <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
            {FELLOWSHIP_AT_A_GLANCE.map((item) => (
              <div key={item.label} className="bg-white p-3">
                <dt className="font-mono text-[8px] uppercase tracking-wider text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-0.5 text-[11px] font-medium leading-snug">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Details</h2>
          <div className="mt-3 space-y-4">
            {FELLOWSHIP_DETAILS.map((detail) => (
              <div key={detail.id}>
                <h3 className="text-sm font-semibold">{detail.title}</h3>
                <ul className="mt-1.5 space-y-1">
                  {detail.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-[11px] leading-relaxed text-slate-600"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Selection</h2>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {FELLOWSHIP_SELECTION_STEPS.map((step) => (
              <li
                key={step.step}
                className="rounded-lg border border-slate-200 p-3"
              >
                <span className="font-mono text-[9px] text-blue-700">
                  {step.step}
                </span>
                <h3 className="mt-1 text-xs font-semibold">{step.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 break-before-page">
          <h2 className="text-lg font-semibold">A note for parents and guardians</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            This programme asks for a serious commitment: full-time attendance,
            compulsory Vipassana, field work and travel. It does not offer a
            salary or guarantee a job. It does offer structure, mentors, real
            project work and a public capstone. Ask us for the written cohort
            terms — including fees, scholarships, accommodation and safety —
            before your ward accepts an offer.
          </p>
          <dl className="mt-4 space-y-3">
            {FELLOWSHIP_PARENT_FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-xs font-semibold">{item.q}</dt>
                <dd className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 border-t border-slate-200 pt-5">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            Email: kavisolutions1@gmail.com
            <br />
            Location: Andhra Pradesh &amp; Telangana · cohort residencies
            announced per batch.
          </p>
          <p className="mt-3 text-[10px] text-slate-500">
            Apply at kavisolutions.in/fellowship#apply. Do not pay anything
            through the website.
          </p>
        </section>
      </div>
    </main>
  );
}
