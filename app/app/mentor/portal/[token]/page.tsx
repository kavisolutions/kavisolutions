"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarClock, CheckCircle2, ClipboardCheck, Loader2, Video } from "lucide-react";

type Assignment = {
  interviewId: string;
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
  scorecardToken: string;
  submittedAt: string | null;
  tokenRevokedAt: string | null;
  tokenExpiresAt: string | null;
  myScoreAverage: number | null;
};

type Payload = {
  mentor: { name: string; email: string; title: string; expertise: string };
  assignments: Assignment[];
};

export default function MentorPortalPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-mentors/portal/${token}`);
      const payload = (await response.json().catch(() => null)) as
        | (Payload & { message?: string })
        | null;
      if (!response.ok || !payload?.mentor) {
        throw new Error(payload?.message ?? "This mentor portal link is invalid.");
      }
      setData(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the portal.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

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
            KAVI FELLOWSHIP · MENTOR
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Portal unavailable</h1>
          <p className="mt-3 text-sm text-[#A5B3C7]">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) return null;
  const upcoming = data.assignments.filter(
    (assignment) => assignment.status === "scheduled",
  );
  const past = data.assignments.filter(
    (assignment) => assignment.status !== "scheduled",
  );

  return (
    <main className="min-h-screen bg-[#06060F] px-5 py-10 text-[#F7F9FC]">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · MENTOR PORTAL
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {data.mentor.name}
          </h1>
          <p className="mt-1 text-sm text-[#A5B3C7]">
            {data.mentor.title || "Mentor"} · {data.mentor.email}
          </p>
          {data.mentor.expertise && (
            <p className="mt-1 text-xs text-[#7889A0]">{data.mentor.expertise}</p>
          )}

          <h2 className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
            Upcoming interviews ({upcoming.length})
          </h2>
          <div className="mt-2 space-y-2">
            {upcoming.length === 0 && (
              <p className="rounded-xl border border-dashed border-[rgba(148,163,184,0.24)] p-4 text-xs text-[#A5B3C7]">
                No upcoming interviews assigned.
              </p>
            )}
            {upcoming.map((assignment) => (
              <div
                key={assignment.interviewId}
                className="rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(6,6,15,0.5)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{assignment.candidateName}</p>
                    <p className="font-mono text-[10px] text-[#7889A0]">
                      {assignment.reference} · {assignment.track}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#A5B3C7]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(assignment.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "full",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })}{" "}
                        IST
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {assignment.mode}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] ${
                      assignment.submittedAt
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-sky-500/30 bg-sky-500/10 text-sky-300"
                    }`}
                  >
                    {assignment.submittedAt
                      ? `Score submitted${assignment.myScoreAverage ? ` · ${assignment.myScoreAverage}/5` : ""}`
                      : "Scorecard pending"}
                  </span>
                </div>
                {assignment.meetingUrl && (
                  <a
                    href={assignment.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-[11px] text-[#22D3EE] hover:underline"
                  >
                    {assignment.meetingUrl}
                  </a>
                )}
                {assignment.location && (
                  <p className="mt-1 text-[11px] text-[#A5B3C7]">{assignment.location}</p>
                )}
                {assignment.candidateConfirmedAt && (
                  <p className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] text-emerald-300">
                    Candidate confirmed attendance.
                  </p>
                )}
                {assignment.rescheduleRequestedAt && (
                  <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] text-amber-300">
                    Candidate requested a reschedule
                    {assignment.rescheduleNote ? `: ${assignment.rescheduleNote}` : "."}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                  <a
                    href={`/mentor/interview/${assignment.scorecardToken}`}
                    className="inline-flex items-center gap-1 font-medium text-[#91B4FF] hover:underline"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    {assignment.submittedAt ? "Update scorecard" : "Open scorecard"}
                  </a>
                  <a
                    href={`/api/fellowship-interviews/token/${assignment.scorecardToken}/calendar.ics`}
                    className="text-[#22D3EE] hover:underline"
                  >
                    Add to calendar
                  </a>
                </div>
              </div>
            ))}
          </div>

          {past.length > 0 && (
            <>
              <h2 className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Past interviews ({past.length})
              </h2>
              <div className="mt-2 space-y-1">
                {past.map((assignment) => (
                  <div
                    key={assignment.interviewId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[rgba(148,163,184,0.14)] bg-[rgba(6,6,15,0.4)] px-3 py-2 text-[11px]"
                  >
                    <span>
                      {assignment.candidateName} · {assignment.reference}
                    </span>
                    <span className="text-[#7889A0]">
                      {assignment.status}
                      {assignment.submittedAt ? (
                        <CheckCircle2 className="ml-1 inline h-3 w-3 text-emerald-400" />
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="mt-6 text-[10px] text-[#7889A0]">
            This portal is private. Do not forward the link. Contact the fellowship
            team if an assignment is missing.
          </p>
        </div>
      </div>
    </main>
  );
}
