"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Search,
  UserCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiErrorMessage } from "@/lib/api-error";
import {
  FELLOWSHIP_APPLICATION_STAGES,
  FELLOWSHIP_STAGE_LABELS,
  FELLOWSHIP_STAGE_TONES,
  type FellowshipApplicationStage,
} from "@/lib/fellowship-application";
import {
  FELLOWSHIP_POLICY_DEFAULTS,
  type FellowshipPolicy,
} from "@/lib/fellowship-policy";
import AlumniPanel from "@/components/admin/fellowship/AlumniPanel";
import CasesPanel from "@/components/admin/fellowship/CasesPanel";
import DashboardPanel from "@/components/admin/fellowship/DashboardPanel";
import DeliveryPanel from "@/components/admin/fellowship/DeliveryPanel";
import InterviewsPanel from "@/components/admin/fellowship/InterviewsPanel";
import MentorsPanel from "@/components/admin/fellowship/MentorsPanel";
import OnboardingPanel from "@/components/admin/fellowship/OnboardingPanel";
import ReviewsPanel from "@/components/admin/fellowship/ReviewsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Application = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  candidateStatus: string;
  track: string;
  motivation: string;
  fullTime: boolean;
  vipassana: boolean;
  fieldWork: boolean;
  termsAccepted: boolean;
  cohort: string;
  stage: FellowshipApplicationStage;
  offerExpiresAt: string | null;
  offerReminderSentAt: string | null;
  waitlistPosition: number | null;
  waitlistExpiresAt: string | null;
  completedAt: string | null;
  candidateToken: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const withCookies = (extra: RequestInit = {}): RequestInit => ({
  credentials: "include",
  ...extra,
});

const toLocalInput = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export default function FellowshipApplicationsAdmin() {
  const { session, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<
    | "dashboard"
    | "applications"
    | "reviews"
    | "interviews"
    | "mentors"
    | "fellowship"
    | "onboarding"
    | "alumni"
    | "cases"
  >("dashboard");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [checkedIDs, setCheckedIDs] = useState<string[]>([]);
  const [bulkStage, setBulkStage] =
    useState<FellowshipApplicationStage>("review");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [draft, setDraft] = useState<{
    stage: FellowshipApplicationStage;
    cohort: string;
    notes: string;
    offerExpiresAt: string;
    waitlistPosition: string;
    waitlistExpiresAt: string;
  } | null>(null);
  const [policy, setPolicy] = useState<FellowshipPolicy | null>(null);
  const [policyDraft, setPolicyDraft] = useState<FellowshipPolicy>(
    FELLOWSHIP_POLICY_DEFAULTS,
  );
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [response, policyResponse] = await Promise.all([
        fetch("/api/fellowship-applications", withCookies()),
        fetch("/api/fellowship-policy", withCookies()),
      ]);
      if (
        response.status === 401 ||
        response.status === 403 ||
        policyResponse.status === 401 ||
        policyResponse.status === 403
      ) {
        setForbidden(true);
        return;
      }
      if (!response.ok) throw new Error("Could not load applications");

      const data = (await response.json()) as { applications?: Application[] };
      setApplications(data.applications ?? []);

      if (policyResponse.ok) {
        const policyData = (await policyResponse.json()) as {
          policy?: FellowshipPolicy;
        };
        if (policyData.policy) {
          setPolicy(policyData.policy);
          setPolicyDraft(policyData.policy);
        }
      }

      setForbidden(false);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, load, session]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStage =
        stageFilter === "all" || application.stage === stageFilter;
      const haystack =
        `${application.name} ${application.email} ${application.reference} ${application.track} ${application.city}`.toLowerCase();
      return matchesStage && (!search || haystack.includes(search));
    });
  }, [applications, query, stageFilter]);

  const selected = applications.find((application) => application.id === selectedID) ?? null;

  const select = (application: Application) => {
    setSelectedID(application.id);
    setDraft({
      stage: application.stage,
      cohort: application.cohort,
      notes: application.notes,
      offerExpiresAt: application.offerExpiresAt
        ? toLocalInput(application.offerExpiresAt)
        : "",
      waitlistPosition:
        application.waitlistPosition !== null
          ? String(application.waitlistPosition)
          : "",
      waitlistExpiresAt: application.waitlistExpiresAt
        ? toLocalInput(application.waitlistExpiresAt)
        : "",
    });
    setNotice("");
    setError("");
  };

  const save = async () => {
    if (!selected || !draft || saving) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/fellowship-applications/${selected.id}`,
        withCookies({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: draft.stage,
            cohort: draft.cohort,
            notes: draft.notes,
            offerExpiresAt: draft.offerExpiresAt
              ? new Date(draft.offerExpiresAt).toISOString()
              : null,
            waitlistPosition: draft.waitlistPosition
              ? Number(draft.waitlistPosition)
              : null,
            waitlistExpiresAt: draft.waitlistExpiresAt
              ? new Date(draft.waitlistExpiresAt).toISOString()
              : null,
          }),
        }),
      );
      const data = (await response.json().catch(() => null)) as {
        application?: Application;
        message?: string;
      } | null;

      if (!response.ok || !data?.application) {
        throw new Error(apiErrorMessage(data, "Could not save the application."));
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === data.application!.id ? data.application! : application,
        ),
      );
      setNotice("Application updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const removeApplication = async () => {
    if (!selected) return;
    const confirmation = window.prompt(
      `Type DELETE to permanently delete ${selected.name}'s application and related records.`,
    );
    if (confirmation !== "DELETE") return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/fellowship-applications/${selected.id}`, {
        ...withCookies({ method: "DELETE" }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(apiErrorMessage(data, "Could not delete the application."));
      }
      setApplications((current) =>
        current.filter((application) => application.id !== selected.id),
      );
      setSelectedID(null);
      setDraft(null);
      setNotice("Application and related records deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete.");
    } finally {
      setSaving(false);
    }
  };

  const bulkApply = async () => {
    if (!checkedIDs.length) return;
    setBulkSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/fellowship-applications/bulk", {
        ...withCookies({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: checkedIDs, stage: bulkStage }),
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        applications?: Application[];
        changed?: number;
        message?: string;
      } | null;
      if (!response.ok || !data?.applications) {
        throw new Error(apiErrorMessage(data, "Could not update the applications."));
      }
      const byId = new Map(
        data.applications.map((application) => [application.id, application]),
      );
      setApplications((current) =>
        current.map((application) => byId.get(application.id) ?? application),
      );
      setNotice(`${data.changed ?? checkedIDs.length} application(s) updated.`);
      setCheckedIDs([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update.");
    } finally {
      setBulkSaving(false);
    }
  };

  const savePolicy = async () => {
    if (savingPolicy) return;
    setSavingPolicy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/fellowship-policy",
        withCookies({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(policyDraft),
        }),
      );
      const data = (await response.json().catch(() => null)) as {
        policy?: FellowshipPolicy;
        message?: string;
      } | null;

      if (!response.ok || !data?.policy) {
        throw new Error(apiErrorMessage(data, "Could not save the policy terms."));
      }

      setPolicy(data.policy);
      setPolicyDraft(data.policy);
      setNotice("Cohort terms updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save.");
    } finally {
      setSavingPolicy(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Fellowship applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/login?next=/admin/fellowship" className="text-sm font-medium text-primary hover:underline">
              Sign in to continue
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {session.user.email} is not listed as an administrator.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Fellowship programme
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Run admissions from review and interviews through onboarding, the
              active fellowship and alumni outcomes.
            </p>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/30 p-1.5">
          {(
            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["applications", "Applications", ClipboardList],
              ["reviews", "Reviews", ClipboardCheck],
              ["interviews", "Interviews", CalendarClock],
              ["mentors", "Mentors", UserRound],
              ["fellowship", "Fellowship", UserCheck],
              ["onboarding", "Onboarding", UserCheck],
              ["alumni", "Alumni", GraduationCap],
              ["cases", "Cases", AlertOctagon],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setError("");
                setNotice("");
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                tab === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {(error || notice) && (
          <div
            className={`mt-4 rounded-lg border p-3 text-xs ${
              error
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            }`}
          >
            {error || notice}
          </div>
        )}

        {tab === "applications" && (
          <>
        <Card className="mt-5">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Cohort and policy terms</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                These values appear in the public “Cohort terms” panel and guide.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPolicyOpen((current) => !current)}
            >
              {policyOpen ? "Hide" : "Edit terms"}
            </Button>
          </CardHeader>
          {policyOpen && (
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["fee", "Fee / contribution"],
                    ["scholarship", "Scholarship"],
                    ["stipend", "Stipend"],
                    ["accommodation", "Accommodation and food"],
                    ["insurance", "Insurance / medical"],
                    ["eligibility", "Eligibility"],
                    ["leave", "Leave"],
                    ["cohortNote", "Location / residency"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <textarea
                      value={policyDraft[key]}
                      onChange={(event) =>
                        setPolicyDraft({ ...policyDraft, [key]: event.target.value })
                      }
                      rows={3}
                      className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Next intake
                  </span>
                  <Input
                    value={policyDraft.nextIntake}
                    onChange={(event) =>
                      setPolicyDraft({ ...policyDraft, nextIntake: event.target.value })
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Seats
                  </span>
                  <Input
                    value={policyDraft.seats}
                    onChange={(event) =>
                      setPolicyDraft({ ...policyDraft, seats: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] text-muted-foreground">
                  {policy?.updatedAt
                    ? `Last updated ${new Date(policy.updatedAt).toLocaleString()}`
                    : "Using default terms"}
                </span>
                <Button onClick={() => void savePolicy()} disabled={savingPolicy}>
                  {savingPolicy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save terms
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {filtered.length} of {applications.length}
                </CardTitle>
                <select
                  value={stageFilter}
                  onChange={(event) => setStageFilter(event.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-xs"
                >
                  <option value="all">All stages</option>
                  {FELLOWSHIP_APPLICATION_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {FELLOWSHIP_STAGE_LABELS[stage]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, reference or track"
                  className="pl-9"
                />
              </div>
              {checkedIDs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
                  <span className="text-[10px] font-medium">
                    {checkedIDs.length} selected
                  </span>
                  <select
                    value={bulkStage}
                    onChange={(event) =>
                      setBulkStage(event.target.value as FellowshipApplicationStage)
                    }
                    className="h-8 rounded-lg border border-border bg-background px-2 text-[10px]"
                  >
                    {FELLOWSHIP_APPLICATION_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {FELLOWSHIP_STAGE_LABELS[stage]}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => void bulkApply()} disabled={bulkSaving}>
                    {bulkSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Apply to selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCheckedIDs([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && applications.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No applications match this view.
                </p>
              ) : (
                filtered.map((application) => {
                  const color = FELLOWSHIP_STAGE_TONES[application.stage];
                  const active = selectedID === application.id;
                  return (
                    <div key={application.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${application.name}`}
                        checked={checkedIDs.includes(application.id)}
                        onChange={(event) =>
                          setCheckedIDs((current) =>
                            event.target.checked
                              ? [...current, application.id]
                              : current.filter((id) => id !== application.id),
                          )
                        }
                        className="mt-4"
                      />
                      <button
                        type="button"
                        onClick={() => select(application)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          active
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{application.name}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              {application.reference} · {application.track}
                            </p>
                          </div>
                          <span
                            className="rounded-full border px-2 py-1 text-[10px] font-medium"
                            style={{
                              color,
                              borderColor: `${color}55`,
                              backgroundColor: `${color}14`,
                            }}
                          >
                            {FELLOWSHIP_STAGE_LABELS[application.stage]}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                          <span>{application.email}</span>
                          <span>{application.city || "City not given"}</span>
                          <span>
                            {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-base">
                {selected ? "Application details" : "Select an application"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected || !draft ? (
                <p className="text-sm text-muted-foreground">
                  Choose an application to see motivation, commitments and update its stage.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold">{selected.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {selected.reference}
                    </p>
                    <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {selected.email}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {selected.phone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {selected.city || "—"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3" />{" "}
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Motivation
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">
                      {selected.motivation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {[
                      ["Full-time", selected.fullTime],
                      ["Vipassana", selected.vipassana],
                      ["Field work", selected.fieldWork],
                      ["Terms accepted", selected.termsAccepted],
                    ].map(([label, value]) => (
                      <span
                        key={String(label)}
                        className={`rounded-lg border px-2 py-1.5 ${
                          value
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {label}: {value ? "yes" : "no"}
                      </span>
                    ))}
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Stage
                    </span>
                    <select
                      value={draft.stage}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          stage: event.target.value as FellowshipApplicationStage,
                        })
                      }
                      className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                    >
                      {FELLOWSHIP_APPLICATION_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {FELLOWSHIP_STAGE_LABELS[stage]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cohort
                    </span>
                    <Input
                      value={draft.cohort}
                      onChange={(event) => setDraft({ ...draft, cohort: event.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Offer response deadline
                    </span>
                    <Input
                      type="datetime-local"
                      value={draft.offerExpiresAt}
                      onChange={(event) =>
                        setDraft({ ...draft, offerExpiresAt: event.target.value })
                      }
                    />
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      Set when the stage is Offer. Leaving it empty on a new offer
                      defaults to seven days.
                    </span>
                  </label>

                  {draft.stage === "waitlisted" && (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Waitlist position
                        </span>
                        <Input
                          type="number"
                          min={1}
                          value={draft.waitlistPosition}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              waitlistPosition: event.target.value,
                            })
                          }
                          placeholder="Auto-assigned if empty"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Waitlist review by
                        </span>
                        <Input
                          type="datetime-local"
                          value={draft.waitlistExpiresAt}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              waitlistExpiresAt: event.target.value,
                            })
                          }
                        />
                        <span className="mt-1 block text-[10px] text-muted-foreground">
                          Defaults to 30 days when first waitlisted.
                        </span>
                      </label>
                    </>
                  )}

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Internal notes
                    </span>
                    <textarea
                      value={draft.notes}
                      onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                      rows={4}
                      className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                      placeholder="Interview notes, documents requested, follow-up date…"
                    />
                  </label>

                  <Button onClick={() => void save()} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save changes
                  </Button>

                  {selected.candidateToken && selected.stage === "offer" && (
                    <a
                      href={`/fellowship/offer/${selected.candidateToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center text-[10px] font-medium text-primary hover:underline"
                    >
                      Open candidate offer page
                    </a>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive"
                    onClick={() => void removeApplication()}
                    disabled={saving}
                  >
                    Delete application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </>
        )}

        {tab === "interviews" && (
          <div className="mt-5">
            <InterviewsPanel
              applications={applications}
              onApplicationsChanged={() => void load()}
            />
          </div>
        )}

        {tab === "mentors" && (
          <div className="mt-5">
            <MentorsPanel />
          </div>
        )}

        {tab === "onboarding" && (
          <div className="mt-5">
            <OnboardingPanel
              applications={applications}
              onApplicationsChanged={() => void load()}
            />
          </div>
        )}

        {tab === "alumni" && (
          <div className="mt-5">
            <AlumniPanel applications={applications} />
          </div>
        )}

        {tab === "dashboard" && (
          <div className="mt-5">
            <DashboardPanel />
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-5">
            <ReviewsPanel applications={applications} />
          </div>
        )}

        {tab === "fellowship" && (
          <div className="mt-5">
            <DeliveryPanel applications={applications} />
          </div>
        )}

        {tab === "cases" && (
          <div className="mt-5">
            <CasesPanel applications={applications} />
          </div>
        )}
      </div>
    </main>
  );
}
