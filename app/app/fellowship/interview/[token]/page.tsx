"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarClock, CheckCircle2, Loader2, MapPin, Video } from "lucide-react";

type Interview = {
  reference: string;
  candidateName: string;
  track: string;
  cohort: string;
  scheduledAt: string;
  mode: string;
  location: string;
  meetingUrl: string;
  status: string;
  candidateConfirmedAt: string | null;
  rescheduleRequestedAt: string | null;
  rescheduleNote: string;
  panel: Array<{ name: string; role: string }>;
};

export default function CandidateInterviewPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/fellowship-interviews/candidate/token/${token}`,
      );
      const payload = (await response.json().catch(() => null)) as
        | { interview?: Interview; message?: string }
        | null;
      if (!response.ok || !payload?.interview) {
        throw new Error(payload?.message ?? "This interview link is invalid.");
      }
      setInterview(payload.interview);
      setNote(payload.interview.rescheduleNote ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the interview.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const confirm = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/fellowship-interviews/candidate/token/${token}/confirm`,
        { method: "POST" },
      );
      const payload = (await response.json().catch(() => null)) as
        | { confirmedAt?: string; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not confirm attendance.");
      }
      setInterview((current) =>
        current
          ? { ...current, candidateConfirmedAt: payload?.confirmedAt ?? new Date().toISOString() }
          : current,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not confirm attendance.");
    } finally {
      setSaving(false);
    }
  };

  const requestReschedule = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/fellowship-interviews/candidate/token/${token}/reschedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        },
      );
      const payload = (await response.json().catch(() => null)) as
        | { requestedAt?: string; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not send the reschedule request.");
      }
      setInterview((current) =>
        current
          ? {
              ...current,
              rescheduleRequestedAt:
                payload?.requestedAt ?? new Date().toISOString(),
              rescheduleNote: note,
            }
          : current,
      );
      setShowReschedule(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not send the request.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] text-[#F7F9FC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#91B4FF]" />
      </main>
    );
  }

  if (error && !interview) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] px-5 py-12 text-[#F7F9FC]">
        <div className="w-full max-w-md rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-7 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · INTERVIEW
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Interview unavailable
          </h1>
          <p className="mt-3 text-sm text-[#A5B3C7]">{error}</p>
        </div>
      </main>
    );
  }

  if (!interview) return null;

  return (
    <main className="min-h-screen bg-[#06060F] px-5 py-10 text-[#F7F9FC]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · INTERVIEW
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Hello {interview.candidateName}
          </h1>
          <p className="mt-1 text-sm text-[#A5B3C7]">
            {interview.track} track · {interview.cohort} cohort ·{" "}
            <span className="font-mono">{interview.reference}</span>
          </p>

          <div className="mt-4 grid gap-2 rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4 text-xs text-[#A5B3C7]">
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
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#91B4FF]" />
                {interview.location}
              </span>
            )}
            {interview.meetingUrl && (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#22D3EE] hover:underline"
              >
                Join meeting: {interview.meetingUrl}
              </a>
            )}
            {interview.panel.length > 0 && (
              <span>
                Panel: {interview.panel.map((member) => member.name).join(", ")}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
            <a
              href={`/api/fellowship-interviews/candidate/token/${token}/calendar.ics`}
              className="text-[#22D3EE] hover:underline"
            >
              Add to calendar (.ics)
            </a>
            <a href="/fellowship/status" className="text-[#91B4FF] hover:underline">
              Check application status
            </a>
          </div>

          {interview.candidateConfirmedAt && (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
              Attendance confirmed on{" "}
              {new Date(interview.candidateConfirmedAt).toLocaleString()}.
            </p>
          )}

          {interview.rescheduleRequestedAt && (
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              Reschedule requested on{" "}
              {new Date(interview.rescheduleRequestedAt).toLocaleString()}. The team
              will email a new time.
            </p>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {interview.status === "scheduled" && (
            <div className="mt-5 flex flex-wrap gap-3">
              {!interview.candidateConfirmedAt && (
                <button
                  type="button"
                  onClick={() => void confirm()}
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-6 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Confirm attendance
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowReschedule((value) => !value)}
                className="inline-flex h-11 items-center rounded-[10px] border border-[rgba(148,163,184,0.24)] px-6 text-sm font-medium text-[#A5B3C7]"
              >
                Request a reschedule
              </button>
            </div>
          )}

          {showReschedule && (
            <div className="mt-3 rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                  Why do you need a new time?
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 py-2 text-xs text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                  placeholder="Share a short reason and any dates that work"
                />
              </label>
              <button
                type="button"
                onClick={() => void requestReschedule()}
                disabled={saving}
                className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-[#175CD3] px-4 text-xs font-medium text-white disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send request
              </button>
            </div>
          )}

          <p className="mt-6 text-[10px] text-[#7889A0]">
            This link is private. Do not forward it. Email kavisolutions1@gmail.com if
            you need help.
          </p>
        </div>
      </div>
    </main>
  );
}
