"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  HandCoins,
  Loader2,
  RefreshCcw,
  Sprout,
  Users,
} from "lucide-react";

const MODEL = [
  {
    icon: GraduationCap,
    title: "Learn",
    detail:
      "A structured training track for people who need skills, direction and a portfolio. The fellowship remains the 11-month foundation.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Build",
    detail:
      "Candidates work on Kavi and client projects with a named deliverable, a mentor and a written review. Client work is a real income source for the company.",
  },
  {
    icon: HandCoins,
    title: "Earn",
    detail:
      "The proposed company track starts a monthly stipend in month 6, with a review and increase at month 12. It is paid under written terms, not a salary promise.",
  },
  {
    icon: Users,
    title: "Place",
    detail:
      "The goal is a better next job, freelance practice or a Kavi project role. Placement support is real; a job guarantee is not.",
  },
  {
    icon: RefreshCcw,
    title: "Return",
    detail:
      "Anyone who loses a job can come back, relearn and try again. The relationship does not end at the first placement.",
  },
] as const;

const JOURNEY = [
  {
    step: "01",
    title: "Apply or return",
    detail:
      "Tell us where you are. A first-time candidate and a person returning after a job loss use the same form.",
  },
  {
    step: "02",
    title: "Training and foundation",
    detail:
      "Communication, digital literacy, track skills and real briefs. Fees and scholarships are confirmed in writing before joining.",
  },
  {
    step: "03",
    title: "Month 6 paid internship",
    detail:
      "The proposed model starts a stipend when the candidate is contributing to client or Kavi work. Project availability and performance apply.",
  },
  {
    step: "04",
    title: "Month 12 review",
    detail:
      "A written review decides the increased stipend, a Kavi role, a client role or placement support with another employer.",
  },
  {
    step: "05",
    title: "Alumni and return",
    detail:
      "Graduates stay in the network. If a job ends, they can return to relearn without starting from zero.",
  },
] as const;

export default function GurukulamPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    kind: "gurukulam",
    background: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Add your name.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError("Add an email address or phone number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/fellowship-programme/public/gurukulam-interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(data?.message || "Could not send the interest form.");
      }
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the interest form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-ink font-sans text-[#F7F9FC]">
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(23,92,211,0.28),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(6,182,212,0.16),transparent_40%)]" />
        <div className="relative mx-auto max-w-[1152px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(148,163,184,0.2)] bg-[rgba(18,29,47,0.7)] px-3 py-1.5">
            <Sprout className="h-3.5 w-3.5 text-[#34D399]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A5B3C7]">
              Long-term pathway · proposed
            </span>
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            A gurukulam that does not end at the first job.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#A5B3C7] sm:text-lg">
            The Kavi Gurukulam is the proposed company-backed pathway after the
            fellowship: learn, work on real client projects, earn a stipend from
            month 6, and come back if a job ends. First cohort is still under
            design; nothing here overrides written terms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#interest"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1849A9]"
            >
              Register interest
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/fellowship"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[rgba(148,163,184,0.24)] px-5 text-sm font-medium text-[#F7F9FC] transition-colors hover:bg-white/5"
            >
              See the 11-month fellowship
            </Link>
            <Link
              href="/fellowship/support"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-emerald-500/30 bg-emerald-500/[0.06] px-5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10"
            >
              Support a candidate
            </Link>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["11 months", "Fellowship foundation"],
              ["Month 6", "Proposed stipend start"],
              ["Month 12", "Review and increase"],
              ["Lifetime", "Return and relearn"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[18px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.8)] p-5 backdrop-blur-[16px]"
              >
                <p className="font-display text-2xl font-semibold text-[#F7F9FC]">{value}</p>
                <p className="mt-1 text-xs text-[#A5B3C7]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1152px]">
          <div className="mb-8 max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              THE MODEL
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Learning, work and income in one system.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">
              The company has two income sources: the training contribution and
              client work delivered by candidates. We are not adding an exit or
              gratitude fee.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MODEL.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-5"
                >
                  <Icon className="h-5 w-5 text-[#91B4FF]" />
                  <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-[1152px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              TWO WAYS IN
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Start fresh, or start again.
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-5">
                <h3 className="font-display text-lg font-semibold">Gurukulam candidate</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                  For diploma students, graduates, final-year students and career
                  switchers who want training plus real work experience.
                </p>
              </div>
              <div className="rounded-[20px] border border-emerald-500/20 bg-emerald-500/[0.05] p-5">
                <h3 className="font-display text-lg font-semibold">Returner</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                  For anyone who lost a job and needs to relearn, rebuild confidence
                  and go back out with a current portfolio. No shame, no restart from
                  zero.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {JOURNEY.map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-[18px] border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.7)] p-5"
              >
                <span className="font-mono text-xs text-[#91B4FF]">{item.step}</span>
                <div>
                  <h3 className="font-display text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#A5B3C7]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1152px] rounded-[28px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.8)] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                MONEY, HONESTLY
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                No hidden exit fee. No invented salary.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">
                The training contribution and client work fund the company.
                Scholarships and donations can reduce a candidate&apos;s contribution.
                Every amount is confirmed in writing before joining.
              </p>
              <Link
                href="/fellowship/support"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#34D399] underline-offset-4 hover:underline"
              >
                <HandCoins className="h-4 w-4" />
                Pledge a scholarship or equipment grant
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Training contribution",
                "Client project income",
                "Scholarship or donation",
                "Stipend from month 6",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[#0B1220] px-4 py-3 text-xs text-[#A5B3C7]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34D399]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-3 border-t border-[rgba(148,163,184,0.12)] pt-6 sm:grid-cols-3">
            <p className="text-xs leading-relaxed text-[#7889A0]">
              <span className="font-semibold text-[#F7F9FC]">Not promised:</span> a job,
              a fixed salary, a guaranteed client project or a stipend before written
              terms.
            </p>
            <p className="text-xs leading-relaxed text-[#7889A0]">
              <span className="font-semibold text-[#F7F9FC]">Not collected:</span> online
              payment, card details or documents through this page.
            </p>
            <p className="text-xs leading-relaxed text-[#7889A0]">
              <span className="font-semibold text-[#F7F9FC]">Not added:</span> a gratitude
              or exit fee when someone leaves for a job.
            </p>
          </div>
        </div>
      </section>

      <section id="interest" className="scroll-mt-24 px-6 pb-24 pt-8">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-6 text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              REGISTER INTEREST
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Put your name in the first Gurukulam list.
            </h2>
            <p className="mt-3 text-sm text-[#A5B3C7]">
              This is not an application or an offer. The team will contact you when
              the pathway opens.
            </p>
          </div>

          {sent ? (
            <div className="rounded-[24px] border border-emerald-500/30 bg-emerald-500/[0.06] p-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <h3 className="mt-4 font-display text-2xl font-semibold">Interest recorded</h3>
              <p className="mt-2 text-sm text-[#A5B3C7]">
                The team will contact you using the details you shared.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-5 text-xs font-semibold text-[#91B4FF] underline-offset-4 hover:underline"
              >
                Add another person
              </button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 sm:p-8"
            >
              {error && (
                <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                  {error}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Full name *</span>
                  <input
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">I am</span>
                  <select
                    value={form.kind}
                    onChange={(event) => update("kind", event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                  >
                    <option value="gurukulam">A new candidate</option>
                    <option value="returner">Returning after a job loss</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Phone / WhatsApp</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="+91"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">City / district</span>
                  <input
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="e.g. Guntur"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Background</span>
                  <textarea
                    value={form.background}
                    onChange={(event) => update("background", event.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 py-2.5 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="Education, last role, skills, what you want to build."
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Goal</span>
                  <textarea
                    value={form.goal}
                    onChange={(event) => update("goal", event.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 py-2.5 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="A job, a client practice, a venture, or time to relearn."
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1849A9] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Register interest
              </button>
              <p className="mt-3 text-[11px] text-[#7889A0]">
                No payment is collected here. Fees, scholarships and stipend terms are
                confirmed in writing.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
