"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { FELLOWSHIP_TRACKS } from "@/lib/fellowship-data";
import { Reveal } from "@/components/motion";

const STATUS_OPTIONS = [
  "Final-year student",
  "Diploma student / graduate",
  "Recent graduate",
  "Working professional",
  "Returning to work",
  "Other",
] as const;

export default function FellowshipApply() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    status: STATUS_OPTIONS[0] as string,
    track: FELLOWSHIP_TRACKS[0].title as string,
    motivation: "",
    fullTime: false,
    vipassana: false,
    field: false,
    honest: false,
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.fullTime || !form.vipassana || !form.field || !form.honest) {
      setError("Please confirm all four commitments before submitting.");
      return;
    }

    setLoading(true);

    try {
      const message = [
        "Fellowship application",
        `Current status: ${form.status}`,
        `City / district: ${form.city}`,
        `Track interest: ${form.track}`,
        "",
        "Why they want to join:",
        form.motivation,
        "",
        "Commitments confirmed:",
        "- Full-time, 11-month programme",
        "- Compulsory Vipassana and daily practice",
        "- DSN field work and community travel",
        "- Understands there is no salary or job guarantee",
      ].join("\n");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: `Fellowship application — ${form.track}`,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send application");
      }

      setSent(true);
    } catch {
      setError(
        "Could not send the application. Please try again or email kavisolutions1@gmail.com.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="apply" className="relative scroll-mt-24 px-6 pb-28 pt-6">
      <div className="mx-auto max-w-[1152px]">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-[20px] sm:p-10">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
                APPLY
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl">
                Give the next eleven months a direction
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#A5B3C7]">
                This is an expression of interest, not an automatic offer. We
                review every application, then invite shortlisted candidates to
                a conversation.
              </p>

              <ol className="mt-6 space-y-3">
                {[
                  "Submit your interest and track preference.",
                  "We review motivation, commitment and fit.",
                  "Shortlisted candidates meet the team.",
                  "Successful candidates receive written terms.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 text-xs text-[#A5B3C7]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(148,163,184,0.2)] font-mono text-[9px] text-[#91B4FF]">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] p-4">
                <p className="text-[11px] leading-relaxed text-[#7889A0]">
                  No payment is collected here. There is no salary during the
                  learning phase, and no job is guaranteed. Questions about
                  fees, scholarships, accommodation or safety are answered
                  before an offer.
                </p>
              </div>

              <a
                href="mailto:kavisolutions1@gmail.com"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#91B4FF] hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                kavisolutions1@gmail.com
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.9)] p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-[20px] sm:p-8">
              {sent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#34D399]/30 bg-[#34D399]/15 text-[#34D399]">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-[#F7F9FC]">
                    Application received
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[#A5B3C7]">
                    We will review your application and contact you if you are
                    shortlisted. Nothing is confirmed until you receive written
                    cohort terms.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-5 text-xs font-mono text-[#91B4FF] hover:underline"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                        Full name *
                      </span>
                      <input
                        required
                        value={form.name}
                        onChange={(event) => update("name", event.target.value)}
                        placeholder="Your name"
                        className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none transition-colors focus:border-[#91B4FF]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                        Email *
                      </span>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) => update("email", event.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none transition-colors focus:border-[#91B4FF]"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                        Phone *
                      </span>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        placeholder="+91"
                        className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none transition-colors focus:border-[#91B4FF]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                        City / district *
                      </span>
                      <input
                        required
                        value={form.city}
                        onChange={(event) => update("city", event.target.value)}
                        placeholder="e.g. Guntur"
                        className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none transition-colors focus:border-[#91B4FF]"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                        Current status
                      </span>
                      <select
                        value={form.status}
                        onChange={(event) => update("status", event.target.value)}
                        className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                        Track interest
                      </span>
                      <select
                        value={form.track}
                        onChange={(event) => update("track", event.target.value)}
                        className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                      >
                        {FELLOWSHIP_TRACKS.map((track) => (
                          <option key={track.title} value={track.title}>
                            {track.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                      Why do you want to join? *
                    </span>
                    <textarea
                      required
                      rows={4}
                      value={form.motivation}
                      onChange={(event) => update("motivation", event.target.value)}
                      placeholder="What are you trying to build, and why this programme?"
                      className="w-full resize-y rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 py-2.5 text-sm leading-relaxed text-[#F7F9FC] placeholder-[#7889A0] outline-none transition-colors focus:border-[#91B4FF]"
                    />
                  </label>

                  <div className="space-y-2 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] p-4">
                    {[
                      ["fullTime", "I can commit full-time for 11 months."],
                      ["vipassana", "I accept the compulsory Vipassana practice."],
                      ["field", "I am willing to do DSN field work and travel."],
                      ["honest", "I understand there is no salary or job guarantee."],
                    ].map(([key, label]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-[#A5B3C7]"
                      >
                        <input
                          type="checkbox"
                          checked={form[key as keyof typeof form] as boolean}
                          onChange={(event) =>
                            update(
                              key as "fullTime" | "vipassana" | "field" | "honest",
                              event.target.checked,
                            )
                          }
                          className="mt-0.5 h-3.5 w-3.5 rounded border-[rgba(148,163,184,0.4)] accent-[#175CD3]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] px-6 text-sm font-medium text-white shadow-[0_0_24px_rgba(23,92,211,0.35)] transition-colors hover:bg-[#1849A9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending application
                      </>
                    ) : (
                      <>
                        Submit application
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] leading-relaxed text-[#7889A0]">
                    Your details are used only to review this application. No
                    payment is collected through this form.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
