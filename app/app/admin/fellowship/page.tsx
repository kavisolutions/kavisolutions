"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertOctagon,
  Award,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Inbox,
  Layers3,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
  type LucideIcon,
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
import {
  AdminShell,
  type AdminNavGroup,
} from "@/components/admin/shared/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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

const NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        key: "team",
        label: "Team members",
        icon: Users,
        href: "/admin?section=team",
      },
      {
        key: "roles",
        label: "Roles",
        icon: BriefcaseBusiness,
        href: "/admin?section=roles",
      },
      {
        key: "teams",
        label: "Teams",
        icon: Layers3,
        href: "/admin?section=teams",
      },
      {
        key: "projects",
        label: "Projects",
        icon: FolderKanban,
        href: "/admin?section=projects",
      },
      {
        key: "certificates",
        label: "Certificates",
        icon: Award,
        href: "/admin?section=certificates",
      },
      {
        key: "administrators",
        label: "Administrators",
        icon: ShieldCheck,
        href: "/admin?section=admins",
      },
      {
        key: "settings",
        label: "Settings",
        icon: Settings2,
        href: "/admin?section=settings",
      },
    ],
  },
  {
    label: "Services",
    items: [
      {
        key: "survey",
        label: "Survey & Research",
        icon: BarChart3,
        href: "/admin/survey",
      },
      {
        key: "leads",
        label: "Lead inbox",
        icon: Inbox,
        href: "/admin/leads",
      },
      {
        key: "fellowship",
        label: "Fellowship",
        icon: GraduationCap,
        href: "/admin/fellowship",
      },
      {
        key: "programme",
        label: "Programme",
        icon: Layers3,
        href: "/admin/programme",
      },
    ],
  },
];

function SectionHeader({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      <span className="h-3 w-0.5 rounded-full bg-violet-500" />
      {children}
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader>
            <CardTitle>Fellowship applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/login?next=/admin/fellowship"
              className="text-sm font-medium text-violet-600 hover:underline"
            >
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
        <Card className="w-full max-w-md rounded-2xl">
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
    <AdminShell
      title="Fellowship"
      subtitle="Admissions to alumni operations"
      headerIcon={GraduationCap}
      pill="Programme Management"
      bannerTitle="Manage Fellowship"
      bannerDescription="Run admissions, reviews, onboarding and alumni from one place."
      bannerIcon={GraduationCap}
      groups={NAV_GROUPS}
      activeKey="fellowship"
      liveHref="/fellowship"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Admissions pipeline
            </h2>
            <Badge
              variant="secondary"
              className="rounded-full bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/20"
            >
              {applications.length} total
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Move candidates from application and review through interviews and
            onboarding.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => void load()}
          disabled={loading}
          title="Refresh applications"
          aria-label="Refresh applications"
          className="h-9 w-9 rounded-full border-border/80 bg-card"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-muted/40 p-1.5">
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
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all",
              tab === value
                ? "bg-violet-600 text-white shadow-sm shadow-violet-500/25"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {(error || notice) && (
        <div
          className={cn(
            "mb-5 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs",
            error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
          )}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
            {error ? (
              <AlertOctagon className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </span>
          {error || notice}
        </div>
      )}

      {tab === "applications" && (
        <>
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/70 p-5">
              <SectionHeader
                icon={Settings2}
                title="Cohort and policy terms"
                description="These values appear in the public “Cohort terms” panel and guide."
              >
                <label className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  {policyOpen ? "Hide" : "Edit terms"}
                  <Switch
                    checked={policyOpen}
                    onCheckedChange={setPolicyOpen}
                    aria-label="Edit terms"
                  />
                </label>
              </SectionHeader>
            </CardHeader>
            {policyOpen && (
              <CardContent className="p-5">
                <div className="grid gap-4 sm:grid-cols-2">
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
                      <FieldLabel>{label}</FieldLabel>
                      <textarea
                        value={policyDraft[key]}
                        onChange={(event) =>
                          setPolicyDraft({ ...policyDraft, [key]: event.target.value })
                        }
                        rows={3}
                        className="w-full resize-y rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/30"
                      />
                    </label>
                  ))}
                  <label className="block">
                    <FieldLabel>Next intake</FieldLabel>
                    <Input
                      value={policyDraft.nextIntake}
                      onChange={(event) =>
                        setPolicyDraft({ ...policyDraft, nextIntake: event.target.value })
                      }
                      className="rounded-xl border-border/80 bg-background/60"
                    />
                  </label>
                  <label className="block">
                    <FieldLabel>Seats</FieldLabel>
                    <Input
                      value={policyDraft.seats}
                      onChange={(event) =>
                        setPolicyDraft({ ...policyDraft, seats: event.target.value })
                      }
                      className="rounded-xl border-border/80 bg-background/60"
                    />
                  </label>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                  <span className="text-[10px] text-muted-foreground">
                    {policy?.updatedAt
                      ? `Last updated ${new Date(policy.updatedAt).toLocaleString()}`
                      : "Using default terms"}
                  </span>
                  <Button
                    onClick={() => void savePolicy()}
                    disabled={savingPolicy}
                    className="rounded-xl bg-violet-600 hover:bg-violet-500"
                  >
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

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
            <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionHeader
                    icon={ClipboardList}
                    title="Applications"
                    description={`${filtered.length} of ${applications.length} in view`}
                  />
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="h-9 w-[150px] rounded-full border-border/80 bg-background text-xs">
                      <SelectValue placeholder="All stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stages</SelectItem>
                      {FELLOWSHIP_APPLICATION_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {FELLOWSHIP_STAGE_LABELS[stage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, email, reference or track"
                    className="rounded-xl border-border/80 bg-background/60 pl-9"
                  />
                </div>
                {checkedIDs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/5 p-2.5">
                    <Badge className="rounded-full bg-violet-600 text-white">
                      {checkedIDs.length} selected
                    </Badge>
                    <Select
                      value={bulkStage}
                      onValueChange={(value) =>
                        setBulkStage(value as FellowshipApplicationStage)
                      }
                    >
                      <SelectTrigger className="h-8 w-[150px] rounded-full border-border/80 bg-background text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FELLOWSHIP_APPLICATION_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {FELLOWSHIP_STAGE_LABELS[stage]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => void bulkApply()}
                      disabled={bulkSaving}
                      className="rounded-full bg-violet-600 hover:bg-violet-500"
                    >
                      {bulkSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Apply to selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Clear selection"
                      aria-label="Clear selection"
                      onClick={() => setCheckedIDs([])}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-10 pl-5">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="hidden md:table-cell">Track</TableHead>
                      <TableHead className="hidden sm:table-cell">Applied</TableHead>
                      <TableHead className="w-12 pr-5 text-right">
                        <span className="sr-only">Open</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No applications match this view.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((application) => {
                        const color = FELLOWSHIP_STAGE_TONES[application.stage];
                        const active = selectedID === application.id;
                        return (
                          <TableRow
                            key={application.id}
                            data-state={active ? "selected" : undefined}
                            onClick={() => select(application)}
                            className={cn(
                              "cursor-pointer",
                              active && "bg-violet-500/5",
                            )}
                          >
                            <TableCell
                              className="pl-5"
                              onClick={(event) => event.stopPropagation()}
                            >
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
                                className="h-4 w-4 rounded border-border accent-violet-600"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[11px] font-semibold text-violet-600 ring-1 ring-violet-500/20">
                                  {initials(application.name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {application.name}
                                  </p>
                                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                                    {application.reference} · {application.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="rounded-full border px-2.5 py-1 text-[10px] font-medium"
                                style={{
                                  color,
                                  borderColor: `${color}55`,
                                  backgroundColor: `${color}14`,
                                }}
                              >
                                {FELLOWSHIP_STAGE_LABELS[application.stage]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                              {application.track}
                            </TableCell>
                            <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="pr-5 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Open ${application.name}`}
                                title={`Open ${application.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  select(application);
                                }}
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-violet-600"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="h-fit rounded-2xl border-border/80 shadow-sm lg:sticky lg:top-6">
              <CardHeader className="border-b border-border/70 p-5">
                <SectionHeader
                  icon={UserRound}
                  title={
                    selected ? "Application details" : "Select an application"
                  }
                />
              </CardHeader>
              <CardContent className="p-5">
                {!selected || !draft ? (
                  <p className="text-sm text-muted-foreground">
                    Choose an application to see motivation, commitments and
                    update its stage.
                  </p>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold">{selected.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {selected.reference}
                      </p>
                      <div className="mt-3 space-y-2 text-[11px] text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                            <Mail className="h-3 w-3" />
                          </span>
                          {selected.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                            <Phone className="h-3 w-3" />
                          </span>
                          {selected.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                            <MapPin className="h-3 w-3" />
                          </span>
                          {selected.city || "—"}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                            <CalendarDays className="h-3 w-3" />
                          </span>
                          {new Date(selected.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5">
                      <FieldLabel>Motivation</FieldLabel>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">
                        {selected.motivation}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["Full-time", selected.fullTime],
                        ["Vipassana", selected.vipassana],
                        ["Field work", selected.fieldWork],
                        ["Terms accepted", selected.termsAccepted],
                      ].map(([label, value]) => (
                        <Badge
                          key={String(label)}
                          variant="outline"
                          className={cn(
                            "justify-center rounded-full border px-2 py-1.5 text-[10px] font-medium",
                            value
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              : "border-border/80 text-muted-foreground",
                          )}
                        >
                          {label}: {value ? "yes" : "no"}
                        </Badge>
                      ))}
                    </div>

                    <label className="block">
                      <FieldLabel>Stage</FieldLabel>
                      <Select
                        value={draft.stage}
                        onValueChange={(value) =>
                          setDraft({
                            ...draft,
                            stage: value as FellowshipApplicationStage,
                          })
                        }
                      >
                        <SelectTrigger className="h-9 w-full rounded-xl border-border/80 bg-background/60 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FELLOWSHIP_APPLICATION_STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {FELLOWSHIP_STAGE_LABELS[stage]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="block">
                      <FieldLabel>Cohort</FieldLabel>
                      <Input
                        value={draft.cohort}
                        onChange={(event) =>
                          setDraft({ ...draft, cohort: event.target.value })
                        }
                        className="rounded-xl border-border/80 bg-background/60"
                      />
                    </label>

                    <label className="block">
                      <FieldLabel>Offer response deadline</FieldLabel>
                      <Input
                        type="datetime-local"
                        value={draft.offerExpiresAt}
                        onChange={(event) =>
                          setDraft({ ...draft, offerExpiresAt: event.target.value })
                        }
                        className="rounded-xl border-border/80 bg-background/60"
                      />
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        Set when the stage is Offer. Leaving it empty on a new
                        offer defaults to seven days.
                      </span>
                    </label>

                    {draft.stage === "waitlisted" && (
                      <>
                        <label className="block">
                          <FieldLabel>Waitlist position</FieldLabel>
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
                            className="rounded-xl border-border/80 bg-background/60"
                          />
                        </label>
                        <label className="block">
                          <FieldLabel>Waitlist review by</FieldLabel>
                          <Input
                            type="datetime-local"
                            value={draft.waitlistExpiresAt}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                waitlistExpiresAt: event.target.value,
                              })
                            }
                            className="rounded-xl border-border/80 bg-background/60"
                          />
                          <span className="mt-1 block text-[10px] text-muted-foreground">
                            Defaults to 30 days when first waitlisted.
                          </span>
                        </label>
                      </>
                    )}

                    <label className="block">
                      <FieldLabel>Internal notes</FieldLabel>
                      <textarea
                        value={draft.notes}
                        onChange={(event) =>
                          setDraft({ ...draft, notes: event.target.value })
                        }
                        rows={4}
                        className="w-full resize-y rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/30"
                        placeholder="Interview notes, documents requested, follow-up date…"
                      />
                    </label>

                    <Button
                      onClick={() => void save()}
                      disabled={saving}
                      className="w-full rounded-xl bg-violet-600 hover:bg-violet-500"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save changes
                    </Button>

                    {selected.candidateToken && selected.stage === "offer" && (
                      <a
                        href={`/fellowship/offer/${selected.candidateToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center text-[10px] font-medium text-violet-600 hover:underline"
                      >
                        Open candidate offer page
                      </a>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => void removeApplication()}
                      disabled={saving}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
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
    </AdminShell>
  );
}
