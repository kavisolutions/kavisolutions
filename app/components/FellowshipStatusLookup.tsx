"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Search } from "lucide-react";
import { apiErrorMessage } from "@/lib/api-error";
import {
  FELLOWSHIP_PIPELINE_STAGES,
  FELLOWSHIP_STAGE_LABELS,
  FELLOWSHIP_STAGE_TONES,
  isFellowshipStage,
  type FellowshipApplicationStage,
} from "@/lib/fellowship-application";
import { useSupportEmail } from "@/lib/support-email";

type ApplicationStatus = {
  reference: string;
  name: string;
  track: string;
  cohort: string;
  stage: FellowshipApplicationStage;
  offerExpiresAt: string | null;
  waitlistPosition: number | null;
  waitlistExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function FellowshipStatusLookup() {
  const supportEmail = useSupportEmail();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setApplication(null);

    try {
      const response = await fetch("/api/fellowship-applications/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.trim(), email: email.trim() }),
      });
      const data = (await response.json().catch(() => null)) as {
        application?: ApplicationStatus;
        message?: string;
      } | null;

      if (!response.ok || !data?.application) {
        throw new Error(apiErrorMessage(data, "Application not found."));
      }

      setApplication(data.application);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Application not found.",
      );
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = application
    ? application.stage === "waitlisted"
      ? FELLOWSHIP_PIPELINE_STAGES.indexOf("interview")
      : FELLOWSHIP_PIPELINE_STAGES.indexOf(application.stage)
    : -1;
  const activeColor = application
    ? FELLOWSHIP_STAGE_TONES[application.stage]
    : "#3B82F6";

  return (
    <main className="min-h-screen bg-ink px-5 py-12 text-[#F7F9FC]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/fellowship"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#91B4FF] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to fellowship
        </Link>

        <div className="mt-6 rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] backdrop-blur-[18px] sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            APPLICATION STATUS
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F7F9FC] sm:text-3xl">
            Check your fellowship application
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#A5B3C7]">
            Use the reference from your confirmation email, or the reference
            shown after submitting the form.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                Application reference
              </span>
              <input
                required
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="KF-2026-AB12CD34"
                className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 font-mono text-sm uppercase text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-[#A5B3C7]">
                Email used in the application
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#175CD3] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1849A9] disabled:opacity-60 sm:col-span-2 sm:w-fit"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Checking" : "Check status"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {application && (
            <div className="mt-7 border-t border-[rgba(148,163,184,0.16)] pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7889A0]">
                    {application.reference}
                  </span>
                  <h2 className="mt-1 font-display text-xl font-semibold text-[#F7F9FC]">
                    {application.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#A5B3C7]">
                    {application.track} · {application.cohort}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{
                    color: activeColor,
                    borderColor: `${activeColor}55`,
                    backgroundColor: `${activeColor}14`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: activeColor }}
                  />
                  {FELLOWSHIP_STAGE_LABELS[application.stage]}
                </span>
              </div>

              {isFellowshipStage(application.stage) &&
                (application.stage === "waitlisted" ? (
                  <p className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
                    You are on the waitlist
                    {application.waitlistPosition
                      ? ` at position ${application.waitlistPosition}`
                      : ""}
                    . Your interview is complete and your application stays open. The
                    team will contact you if a seat becomes available for your track and
                    cohort.
                    {application.waitlistExpiresAt
                      ? ` The team will review your place by ${new Date(
                          application.waitlistExpiresAt,
                        ).toLocaleDateString("en-IN", {
                          dateStyle: "full",
                          timeZone: "Asia/Kolkata",
                        })}.`
                      : ""}
                  </p>
                ) : application.stage === "rejected" ||
                  application.stage === "withdrawn" ? (
                    <p className="mt-5 rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.55)] p-4 text-xs leading-relaxed text-[#A5B3C7]">
                      This application is closed. You can email {supportEmail} if
                      you believe this is a mistake or want feedback.
                    </p>
                  ) : (
                    <>
                      {application.stage === "offer" && application.offerExpiresAt && (
                        <p className="mt-5 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-4 text-xs leading-relaxed text-[#DDD6FE]">
                          Please respond to your offer by{" "}
                          <strong>
                            {new Date(application.offerExpiresAt).toLocaleString("en-IN", {
                              dateStyle: "full",
                              timeStyle: "short",
                              timeZone: "Asia/Kolkata",
                            })}{" "}
                            IST
                          </strong>
                          .
                        </p>
                      )}
                      <ol className="mt-6 space-y-2">
                        {FELLOWSHIP_PIPELINE_STAGES.map((stage, index) => {
                          const complete = index <= activeIndex;
                          const current = index === activeIndex;
                          const color = FELLOWSHIP_STAGE_TONES[stage];
                          return (
                            <li
                              key={stage}
                              className="flex items-center gap-3 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] px-4 py-3"
                            >
                              <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] font-mono"
                                style={{
                                  color: complete ? color : "#7889A0",
                                  borderColor: complete
                                    ? `${color}66`
                                    : "rgba(148,163,184,0.2)",
                                  backgroundColor: complete ? `${color}14` : "transparent",
                                }}
                              >
                                {complete ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  index + 1
                                )}
                              </span>
                              <span
                                className={`text-xs ${
                                  current
                                    ? "font-semibold text-[#F7F9FC]"
                                    : "text-[#A5B3C7]"
                                }`}
                              >
                                {FELLOWSHIP_STAGE_LABELS[stage]}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </>
                  ))}

              <p className="mt-4 text-[10px] text-[#7889A0]">
                Last updated {new Date(application.updatedAt).toLocaleDateString()}.
                This page does not show internal notes. Email {supportEmail} for
                questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
