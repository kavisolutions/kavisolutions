"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonBody,
  jsonPatch,
  type FellowshipAdminApplication,
  type FellowshipInterview,
  type FellowshipMentor,
} from "@/lib/fellowship-admin";
import {
  FELLOWSHIP_STAGE_LABELS,
  isFellowshipStage,
} from "@/lib/fellowship-application";

const RECOMMENDATIONS = [
  ["offer", "Recommend offer"],
  ["waitlist", "Recommend waitlist"],
  ["reject", "Recommend reject"],
] as const;

type ScoreDraft = {
  motivationScore: number;
  commitmentScore: number;
  communicationScore: number;
  problemScore: number;
  fieldScore: number;
  fitScore: number;
  recommendation: "offer" | "waitlist" | "reject";
  notes: string;
};

const EMPTY_SCORE: ScoreDraft = {
  motivationScore: 3,
  commitmentScore: 3,
  communicationScore: 3,
  problemScore: 3,
  fieldScore: 3,
  fitScore: 3,
  recommendation: "offer",
  notes: "",
};

const SCORE_FIELDS = [
  ["motivationScore", "Motivation and self-awareness"],
  ["commitmentScore", "Commitment and resilience"],
  ["communicationScore", "Communication and collaboration"],
  ["problemScore", "Track aptitude / problem solving"],
  ["fieldScore", "Field and service readiness"],
  ["fitScore", "Support needs and cohort fit"],
] as const;

const toLocalInput = (value: string | Date): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const defaultSlot = (): string => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setHours(10, 0, 0, 0);
  return toLocalInput(date);
};

const statusTone = (status: string): string => {
  if (status === "completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
  }
  if (status === "cancelled") {
    return "border-border bg-muted/40 text-muted-foreground";
  }
  if (status === "no_show") {
    return "border-red-500/30 bg-red-500/10 text-red-600";
  }
  return "border-sky-500/30 bg-sky-500/10 text-sky-600";
};

export default function InterviewsPanel({
  applications,
  onApplicationsChanged,
}: {
  applications: FellowshipAdminApplication[];
  onApplicationsChanged?: () => void;
}) {
  const [interviews, setInterviews] = useState<FellowshipInterview[]>([]);
  const [mentors, setMentors] = useState<FellowshipMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [expandedID, setExpandedID] = useState<string | null>(null);
  const [rescheduleID, setRescheduleID] = useState<string | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [scorecardID, setScorecardID] = useState<string | null>(null);
  const [scoreDraft, setScoreDraft] = useState<ScoreDraft>(EMPTY_SCORE);

  const [applicationId, setApplicationId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultSlot);
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [mentorIds, setMentorIds] = useState<string[]>([]);
  const [adminEmails, setAdminEmails] = useState("");

  const schedulable = useMemo(
    () =>
      applications.filter((application) =>
        ["applied", "review", "interview", "waitlisted", "offer"].includes(
          application.stage,
        ),
      ),
    [applications],
  );

  const activeMentors = useMemo(
    () => mentors.filter((mentor) => mentor.status === "active"),
    [mentors],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [interviewData, mentorData] = await Promise.all([
        adminRequest<{ interviews: FellowshipInterview[] }>("/api/fellowship-interviews"),
        adminRequest<{ mentors: FellowshipMentor[] }>("/api/fellowship-mentors"),
      ]);
      setInterviews(interviewData.interviews ?? []);
      setMentors(mentorData.mentors ?? []);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load interviews.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const resetForm = () => {
    setApplicationId("");
    setScheduledAt(defaultSlot());
    setMode("online");
    setLocation("");
    setMeetingUrl("");
    setMentorIds([]);
    setAdminEmails("");
    setFormOpen(false);
  };

  const schedule = async () => {
    if (saving) return;
    const emails = adminEmails
      .split(/[\s,;]+/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (!applicationId) {
      setError("Choose an application to interview.");
      return;
    }
    if (!scheduledAt) {
      setError("Choose the interview date and time.");
      return;
    }
    if (!mentorIds.length && !emails.length) {
      setError("Add at least one mentor or admin email to the panel.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        "/api/fellowship-interviews",
        jsonBody({
          applicationId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          mode,
          location,
          meetingUrl,
          mentorIds,
          adminEmails: emails,
        }),
      );
      setNotice("Interview scheduled. Candidate and panel invitations sent.");
      resetForm();
      await load();
      onApplicationsChanged?.();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not schedule the interview.",
      );
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (interview: FellowshipInterview, status: string) => {
    if (
      status === "cancelled" &&
      !window.confirm(`Cancel the interview with ${interview.candidateName}?`)
    ) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-interviews/${interview.id}`,
        jsonPatch({ status }),
      );
      setNotice(`Interview marked ${status.replace("_", " ")}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the interview.");
    }
  };

  const reschedule = async (interview: FellowshipInterview) => {
    if (!rescheduleAt) {
      setError("Choose a new date and time.");
      return;
    }
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-interviews/${interview.id}`,
        jsonPatch({ scheduledAt: new Date(rescheduleAt).toISOString() }),
      );
      setNotice("Interview rescheduled and the panel notified.");
      setRescheduleID(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reschedule.");
    }
  };

  const submitScorecard = async (interview: FellowshipInterview) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-interviews/${interview.id}/scorecard`,
        jsonBody(scoreDraft),
      );
      setNotice("Scorecard saved. The panel average has been updated.");
      setScorecardID(null);
      setScoreDraft(EMPTY_SCORE);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the scorecard.");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/mentor/interview/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Private scorecard link copied.");
    } catch {
      setError("Could not copy the link. Open it and copy from the address bar.");
    }
  };

  return (
    <div className="space-y-4">
      {(error || notice) && (
        <div
          className={`rounded-lg border p-3 text-xs ${
            error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
          }`}
        >
          {error || notice}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" />
              Interview schedule
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Schedule a panel, send private scorecards and record admin interviews.
              Scheduling moves the application to Interview stage.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setFormOpen((current) => !current)}>
              <Plus className="h-4 w-4" />
              Schedule interview
            </Button>
          </div>
        </CardHeader>

        {formOpen && (
          <CardContent className="border-t border-border">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Application
                </span>
                <select
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  <option value="">Choose an application</option>
                  {schedulable.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.name} · {application.reference} ·{" "}
                      {isFellowshipStage(application.stage)
                        ? FELLOWSHIP_STAGE_LABELS[application.stage]
                        : application.stage}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Date and time (your local time)
                </span>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mode
                </span>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as "online" | "offline")}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  <option value="online">Online</option>
                  <option value="offline">In person</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Meeting link
                </span>
                <Input
                  value={meetingUrl}
                  onChange={(event) => setMeetingUrl(event.target.value)}
                  placeholder="https://meet.example.com/…"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Location (for in-person)
                </span>
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Campus, room or city"
                />
              </label>

              <div className="sm:col-span-2">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mentor panel
                </p>
                {activeMentors.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
                    No active mentors. Add mentors in the Mentors tab, or use admin
                    emails below.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeMentors.map((mentor) => {
                      const checked = mentorIds.includes(mentor.id);
                      return (
                        <label
                          key={mentor.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[11px] ${
                            checked
                              ? "border-primary/40 bg-primary/5"
                              : "border-border bg-background"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              setMentorIds((current) =>
                                event.target.checked
                                  ? [...current, mentor.id]
                                  : current.filter((id) => id !== mentor.id),
                              )
                            }
                          />
                          <span>
                            {mentor.name}
                            {mentor.title ? ` · ${mentor.title}` : ""}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin panel emails
                </span>
                <Input
                  value={adminEmails}
                  onChange={(event) => setAdminEmails(event.target.value)}
                  placeholder="admin1@example.com, admin2@example.com"
                />
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  Admins get the same private scorecard link as mentors.
                </span>
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => void schedule()} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarClock className="h-4 w-4" />
                )}
                Schedule and send invites
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading
              ? "Loading interviews…"
              : `${interviews.length} interview${interviews.length === 1 ? "" : "s"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!loading && interviews.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No interviews scheduled yet.
            </p>
          )}
          {interviews.map((interview) => {
            const expanded = expandedID === interview.id;
            const scoring = scorecardID === interview.id;
            return (
              <div
                key={interview.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{interview.candidateName}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {interview.reference} · {interview.track}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {interview.mode}
                      </span>
                      {interview.average !== null && (
                        <span className="inline-flex items-center gap-1">
                          <ClipboardCheck className="h-3 w-3" />
                          Panel average {interview.average}/5
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-medium ${statusTone(
                      interview.status,
                    )}`}
                  >
                    {interview.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {interview.panel.map((member) => (
                    <span
                      key={member.id}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] ${
                        member.submittedAt
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                          : "border-border bg-muted/30 text-muted-foreground"
                      }`}
                      title={
                        member.submittedAt
                          ? `Submitted ${new Date(member.submittedAt).toLocaleString()}`
                          : "Awaiting scorecard"
                      }
                    >
                      {member.submittedAt && <CheckCircle2 className="h-3 w-3" />}
                      {member.name || member.email}
                      {member.role === "admin" ? " (admin)" : ""}
                      {member.average !== null ? ` · ${member.average}/5` : ""}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedID(expanded ? null : interview.id)}
                  >
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScorecardID(scoring ? null : interview.id);
                      setScoreDraft(EMPTY_SCORE);
                    }}
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Score as admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRescheduleID(rescheduleID === interview.id ? null : interview.id);
                      setRescheduleAt(toLocalInput(interview.scheduledAt));
                    }}
                  >
                    Reschedule
                  </Button>
                  {interview.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void changeStatus(interview, "completed")}
                    >
                      Mark completed
                    </Button>
                  )}
                  {interview.status !== "no_show" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void changeStatus(interview, "no_show")}
                    >
                      No show
                    </Button>
                  )}
                  {interview.status !== "cancelled" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => void changeStatus(interview, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {rescheduleID === interview.id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-muted/20 p-3">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        New date and time
                      </span>
                      <Input
                        type="datetime-local"
                        value={rescheduleAt}
                        onChange={(event) => setRescheduleAt(event.target.value)}
                      />
                    </label>
                    <Button size="sm" onClick={() => void reschedule(interview)}>
                      Save and notify
                    </Button>
                  </div>
                )}

                {scoring && (
                  <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Admin scorecard · {interview.candidateName}
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {SCORE_FIELDS.map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted-foreground">{label}</span>
                          <select
                            value={scoreDraft[key]}
                            onChange={(event) =>
                              setScoreDraft({
                                ...scoreDraft,
                                [key]: Number(event.target.value),
                              })
                            }
                            className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                          >
                            {[1, 2, 3, 4, 5].map((score) => (
                              <option key={score} value={score}>
                                {score}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                      <label className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">Recommendation</span>
                        <select
                          value={scoreDraft.recommendation}
                          onChange={(event) =>
                            setScoreDraft({
                              ...scoreDraft,
                              recommendation: event.target
                                .value as ScoreDraft["recommendation"],
                            })
                          }
                          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                        >
                          {RECOMMENDATIONS.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <textarea
                      value={scoreDraft.notes}
                      onChange={(event) =>
                        setScoreDraft({ ...scoreDraft, notes: event.target.value })
                      }
                      rows={3}
                      placeholder="Evidence, risks and follow-up needs"
                      className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => void submitScorecard(interview)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save scorecard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setScorecardID(null);
                          setScoreDraft(EMPTY_SCORE);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {expanded && (
                  <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                    {interview.meetingUrl && (
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[11px] text-primary hover:underline"
                      >
                        Meeting link: {interview.meetingUrl}
                      </a>
                    )}
                    {interview.location && (
                      <p className="text-[11px] text-muted-foreground">
                        Location: {interview.location}
                      </p>
                    )}
                    {interview.panel.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-lg border border-border bg-background p-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] font-medium">
                            {member.name || member.email}{" "}
                            <span className="font-normal text-muted-foreground">
                              ({member.role})
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={() => void copyLink(member.token)}
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                          >
                            <Copy className="h-3 w-3" />
                            Copy scorecard link
                          </button>
                        </div>
                        {member.submittedAt ? (
                          <div className="mt-1.5 text-[10px] text-muted-foreground">
                            <p>
                              Submitted {new Date(member.submittedAt).toLocaleString()} ·
                              Average {member.average ?? "—"}/5 · Recommendation:{" "}
                              {member.recommendation || "—"}
                            </p>
                            {member.notes && (
                              <p className="mt-1 whitespace-pre-wrap text-[11px] text-foreground">
                                {member.notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1.5 text-[10px] text-muted-foreground">
                            Scorecard not submitted yet.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
