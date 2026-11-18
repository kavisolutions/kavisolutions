"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type Review = {
  id: string;
  submittedAt: string | null;
  motivationScore: number | null;
  commitmentScore: number | null;
  communicationScore: number | null;
  problemScore: number | null;
  fieldScore: number | null;
  fitScore: number | null;
  recommendation: string;
  notes: string;
  average: number | null;
};

type Payload = {
  review: Review;
  application: {
    reference: string;
    name: string;
    email: string;
    city: string;
    candidateStatus: string;
    track: string;
    motivation: string;
    cohort: string;
  };
};

const FIELDS = [
  ["motivationScore", "Motivation and self-awareness"],
  ["commitmentScore", "Commitment and resilience"],
  ["communicationScore", "Communication and collaboration"],
  ["problemScore", "Track aptitude / problem solving"],
  ["fieldScore", "Field and service readiness"],
  ["fitScore", "Support needs and cohort fit"],
] as const;

const RECOMMENDATIONS = [
  ["offer", "Recommend interview"],
  ["waitlist", "Recommend waitlist"],
  ["reject", "Recommend reject"],
] as const;

type Scores = {
  motivationScore: number;
  commitmentScore: number;
  communicationScore: number;
  problemScore: number;
  fieldScore: number;
  fitScore: number;
};

const EMPTY: Scores = {
  motivationScore: 3,
  commitmentScore: 3,
  communicationScore: 3,
  problemScore: 3,
  fieldScore: 3,
  fitScore: 3,
};

export default function MentorReviewPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Scores>(EMPTY);
  const [recommendation, setRecommendation] = useState<
    "offer" | "waitlist" | "reject"
  >("offer");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-reviews/token/${token}`);
      const payload = (await response.json().catch(() => null)) as
        | (Payload & { message?: string })
        | null;
      if (!response.ok || !payload?.review || !payload.application) {
        throw new Error(payload?.message ?? "This review link is invalid or expired.");
      }
      setData(payload);
      const review = payload.review;
      setScores({
        motivationScore: review.motivationScore ?? 3,
        commitmentScore: review.commitmentScore ?? 3,
        communicationScore: review.communicationScore ?? 3,
        problemScore: review.problemScore ?? 3,
        fieldScore: review.fieldScore ?? 3,
        fitScore: review.fitScore ?? 3,
      });
      setRecommendation(
        review.recommendation === "waitlist" || review.recommendation === "reject"
          ? review.recommendation
          : "offer",
      );
      setNotes(review.notes ?? "");
      setSubmitted(Boolean(review.submittedAt));
      setEditing(!review.submittedAt);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load this review.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-reviews/token/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, recommendation, notes }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not submit the review.");
      }
      setSubmitted(true);
      setEditing(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit the review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] text-[#F7F9FC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#91B4FF]" />
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] px-5 py-12 text-[#F7F9FC]">
        <div className="w-full max-w-md rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-7 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · REVIEW
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Review unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) return null;
  const application = data.application;

  return (
    <main className="min-h-screen bg-[#06060F] px-5 py-10 text-[#F7F9FC]">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            APPLICATION REVIEW · PRIVATE
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {application.name}
          </h1>
          <p className="mt-1 text-sm text-[#A5B3C7]">
            {application.track} track · {application.cohort} cohort ·{" "}
            <span className="font-mono">{application.reference}</span>
          </p>
          <p className="mt-1 text-xs text-[#7889A0]">
            {application.email}
            {application.city ? ` · ${application.city}` : ""}
            {application.candidateStatus ? ` · ${application.candidateStatus}` : ""}
          </p>

          <div className="mt-4 rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
              Motivation from the application
            </p>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#C7D2E5]">
              {application.motivation}
            </p>
          </div>

          {submitted && !editing ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Review submitted
              </p>
              <p className="mt-1 text-xs text-emerald-200/80">
                Thank you. The programme team sees your scores and written evidence.
              </p>
              <div className="mt-3 grid gap-x-6 gap-y-1 text-[11px] text-[#C7D2E5] sm:grid-cols-2">
                {FIELDS.map(([key, label]) => (
                  <span key={key} className="flex justify-between gap-3">
                    <span>{label}</span>
                    <span className="font-mono">{scores[key]}/5</span>
                  </span>
                ))}
                <span className="flex justify-between gap-3 sm:col-span-2">
                  <span>Recommendation</span>
                  <span>
                    {RECOMMENDATIONS.find(([value]) => value === recommendation)?.[1]}
                  </span>
                </span>
              </div>
              {notes && (
                <p className="mt-3 whitespace-pre-wrap border-t border-emerald-500/20 pt-3 text-[11px] text-[#C7D2E5]">
                  {notes}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setSubmitted(false);
                }}
                className="mt-4 text-[11px] font-medium text-[#91B4FF] hover:underline"
              >
                Update my review
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                  Scores · 1 weak, 5 strong
                </p>
                <div className="mt-3 space-y-4">
                  {FIELDS.map(([key, label]) => (
                    <div key={key} className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium">{label}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            aria-label={`${label}: ${value}`}
                            onClick={() => setScores({ ...scores, [key]: value })}
                            className={`h-8 w-8 rounded-lg border font-mono text-xs ${
                              scores[key] === value
                                ? "border-[#91B4FF] bg-[#175CD3] text-white"
                                : "border-[rgba(148,163,184,0.24)] bg-[#0B1220] text-[#A5B3C7]"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                  Recommendation
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RECOMMENDATIONS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRecommendation(value)}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        recommendation === value
                          ? "border-[#91B4FF] bg-[#175CD3]/30 text-white"
                          : "border-[rgba(148,163,184,0.24)] bg-[#0B1220] text-[#A5B3C7]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                    Evidence and notes
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={5}
                    className="mt-1 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 py-2 text-xs leading-relaxed text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                    placeholder="Why these scores? Note evidence, support needs or red flags."
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#175CD3] px-6 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit review
              </button>
            </form>
          )}

          <p className="mt-6 text-[10px] leading-relaxed text-[#7889A0]">
            This link is private to you. Do not forward it. Review scores are visible
            only to the fellowship programme team.
          </p>
        </div>
      </div>
    </main>
  );
}
