"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
  Video,
} from "lucide-react";

type Panel = {
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

type TokenResponse = {
  interview: {
    reference: string;
    candidateName: string;
    candidateEmail: string;
    track: string;
    cohort: string;
    scheduledAt: string;
    mode: string;
    location: string;
    meetingUrl: string;
    status: string;
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
  scorecard: Panel;
};

type Scores = {
  motivationScore: number;
  commitmentScore: number;
  communicationScore: number;
  problemScore: number;
  fieldScore: number;
  fitScore: number;
};

const SCORE_FIELDS = [
  {
    key: "motivationScore",
    label: "Motivation and self-awareness",
    hint: "Why this work, why now, and what they understand about themselves.",
  },
  {
    key: "commitmentScore",
    label: "Commitment and resilience",
    hint: "Full-time availability, 11 months, Vipassana and field work.",
  },
  {
    key: "communicationScore",
    label: "Communication and collaboration",
    hint: "Clarity, listening, feedback and working with others.",
  },
  {
    key: "problemScore",
    label: "Track aptitude / problem solving",
    hint: "How they reason through a real track scenario.",
  },
  {
    key: "fieldScore",
    label: "Field and service readiness",
    hint: "Respect for community context and willingness to serve.",
  },
  {
    key: "fitScore",
    label: "Support needs and cohort fit",
    hint: "What support they need and whether the cohort can provide it.",
  },
] as const;

const RECOMMENDATIONS = [
  ["offer", "Recommend offer"],
  ["waitlist", "Recommend waitlist"],
  ["reject", "Recommend reject"],
] as const;

const EMPTY_SCORES: Scores = {
  motivationScore: 3,
  commitmentScore: 3,
  communicationScore: 3,
  problemScore: 3,
  fieldScore: 3,
  fitScore: 3,
};

export default function MentorInterviewPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [data, setData] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [recommendation, setRecommendation] = useState<"offer" | "waitlist" | "reject">(
    "offer",
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [panelComplete, setPanelComplete] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-interviews/token/${token}`);
      const payload = (await response.json().catch(() => null)) as
        | (TokenResponse & { message?: string })
        | null;
      if (!response.ok || !payload?.interview || !payload.scorecard) {
        throw new Error(
          payload?.message ??
            "This scorecard link is invalid or has expired. Ask the fellowship team for a new link.",
        );
      }
      setData(payload);
      const panel = payload.scorecard;
      setScores({
        motivationScore: panel.motivationScore ?? 3,
        commitmentScore: panel.commitmentScore ?? 3,
        communicationScore: panel.communicationScore ?? 3,
        problemScore: panel.problemScore ?? 3,
        fieldScore: panel.fieldScore ?? 3,
        fitScore: panel.fitScore ?? 3,
      });
      setRecommendation(
        panel.recommendation === "waitlist" || panel.recommendation === "reject"
          ? panel.recommendation
          : "offer",
      );
      setNotes(panel.notes ?? "");
      setSubmitted(Boolean(panel.submittedAt));
      setEditing(!panel.submittedAt);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load this scorecard.",
      );
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
      const response = await fetch(`/api/fellowship-interviews/token/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, recommendation, notes }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { completed?: boolean; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not submit the scorecard.");
      }
      setSubmitted(true);
      setEditing(false);
      setPanelComplete(Boolean(payload?.completed));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not submit the scorecard.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditor = () => {
    setEditing(true);
    setSubmitted(false);
    setPanelComplete(false);
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
            KAVI FELLOWSHIP · PANEL
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Scorecard unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">{error}</p>
          <p className="mt-4 text-[10px] text-[#7889A0]">
            Do not share this link. Email kavisolutions1@gmail.com if you need help.
          </p>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { interview, scorecard } = data;
  const application = interview.application;
  const alreadySubmitted = Boolean(scorecard.submittedAt);

  return (
    <main className="min-h-screen bg-[#06060F] px-5 py-10 text-[#F7F9FC]">
      <div className="mx-auto max-w-3xl">
        <a
          href="/fellowship"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#91B4FF] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kavi Fellowship
        </a>

        <div className="mt-5 rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] backdrop-blur-[18px] sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            INTERVIEW PANEL · PRIVATE SCORECARD
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {application.name}
          </h1>
          <p className="mt-1 text-sm text-[#A5B3C7]">
            {application.track} track · {application.cohort} cohort ·{" "}
            <span className="font-mono">{application.reference}</span>
          </p>

          <div className="mt-4 grid gap-2 rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4 text-xs text-[#A5B3C7] sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5 text-[#91B4FF]" />
              {new Date(interview.scheduledAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </span>
            <span className="inline-flex items-center gap-2">
              <Video className="h-3.5 w-3.5 text-[#91B4FF]" />
              {interview.mode}
            </span>
            {interview.location && (
              <span className="inline-flex items-center gap-2 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-[#91B4FF]" />
                {interview.location}
              </span>
            )}
            {interview.meetingUrl && (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#22D3EE] hover:underline sm:col-span-2"
              >
                Join meeting: {interview.meetingUrl}
              </a>
            )}
            <span className="sm:col-span-2">
              Candidate: {application.email}
              {application.city ? ` · ${application.city}` : ""}
            </span>
          </div>

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
                Scorecard submitted
              </p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">
                Thank you. Your scores are recorded privately.
                {panelComplete
                  ? " The full panel has now submitted and the interview is marked complete."
                  : " The interview is marked complete when every panelist submits."}
              </p>
              <div className="mt-3 grid gap-x-6 gap-y-1 text-[11px] text-[#C7D2E5] sm:grid-cols-2">
                {SCORE_FIELDS.map((field) => (
                  <span key={field.key} className="flex justify-between gap-3">
                    <span>{field.label}</span>
                    <span className="font-mono">{scores[field.key]}/5</span>
                  </span>
                ))}
                <span className="flex justify-between gap-3 sm:col-span-2">
                  <span>Recommendation</span>
                  <span className="font-medium">
                    {RECOMMENDATIONS.find(([value]) => value === recommendation)?.[1]}
                  </span>
                </span>
              </div>
              {notes && (
                <p className="mt-3 whitespace-pre-wrap border-t border-emerald-500/20 pt-3 text-[11px] leading-relaxed text-[#C7D2E5]">
                  {notes}
                </p>
              )}
              <button
                type="button"
                onClick={openEditor}
                className="mt-4 text-[11px] font-medium text-[#91B4FF] hover:underline"
              >
                Update my scorecard
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                  Scores · 1 weak, 5 strong
                </p>
                <div className="mt-3 space-y-4">
                  {SCORE_FIELDS.map((field) => (
                    <div key={field.key}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-xs font-medium text-[#F7F9FC]">
                          {field.label}
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((score) => {
                            const active = scores[field.key] === score;
                            return (
                              <button
                                key={score}
                                type="button"
                                aria-label={`${field.label}: ${score}`}
                                onClick={() =>
                                  setScores({ ...scores, [field.key]: score })
                                }
                                className={`h-8 w-8 rounded-lg border font-mono text-xs transition-colors ${
                                  active
                                    ? "border-[#91B4FF] bg-[#175CD3] text-white"
                                    : "border-[rgba(148,163,184,0.24)] bg-[#0B1220] text-[#A5B3C7] hover:border-[#91B4FF]/60"
                                }`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-[#7889A0]">{field.hint}</p>
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
                      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                        recommendation === value
                          ? "border-[#91B4FF] bg-[#175CD3]/30 text-white"
                          : "border-[rgba(148,163,184,0.24)] bg-[#0B1220] text-[#A5B3C7] hover:border-[#91B4FF]/60"
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
                    className="mt-1 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 py-2 text-xs leading-relaxed text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    placeholder="What did they say or do that supports these scores? Note any risk, support need or follow-up."
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#175CD3] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1849A9] disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {alreadySubmitted ? "Update scorecard" : "Submit scorecard"}
              </button>
            </form>
          )}

          <p className="mt-6 text-[10px] leading-relaxed text-[#7889A0]">
            This link is private to you. Do not forward it. Scores are visible only
            to the fellowship programme team and are used with written interview
            notes for admissions decisions.
          </p>
        </div>
      </div>
    </main>
  );
}
