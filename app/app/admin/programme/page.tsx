"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  HandCoins,
  Headset,
  Image as ImageIcon,
  Inbox,
  IndianRupee,
  Layers3,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sprout,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { AdminShell, type AdminNavGroup } from "@/components/admin/shared/AdminShell";
import ProgrammeOverview from "@/components/admin/programme/ProgrammeOverview";
import ProgrammePanel from "@/components/admin/programme/ProgrammePanel";
import StipendGenerator from "@/components/admin/programme/StipendGenerator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { adminRequest, type FellowshipAdminApplication } from "@/lib/fellowship-admin";
import {
  PROGRAMME_RESOURCES,
  programmeResource,
  type ProgrammeCollegeOption,
} from "@/lib/programme-admin";
import { cn } from "@/lib/utils";

const NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { key: "team", label: "Team members", icon: Users, href: "/admin?section=team" },
      { key: "roles", label: "Roles", icon: BriefcaseBusiness, href: "/admin?section=roles" },
      { key: "teams", label: "Teams", icon: Layers3, href: "/admin?section=teams" },
      { key: "projects", label: "Projects", icon: FolderKanban, href: "/admin?section=projects" },
      { key: "certificates", label: "Certificates", icon: Award, href: "/admin?section=certificates" },
      { key: "admins", label: "Administrators", icon: ShieldCheck, href: "/admin?section=admins" },
      { key: "settings", label: "Settings", icon: Settings2, href: "/admin?section=settings" },
    ],
  },
  {
    label: "Services",
    items: [
      { key: "survey", label: "Survey & Research", icon: BarChart3, href: "/admin/survey" },
      { key: "leads", label: "Lead inbox", icon: Inbox, href: "/admin/leads" },
      { key: "fellowship", label: "Fellowship", icon: GraduationCap, href: "/admin/fellowship" },
      { key: "programme", label: "Programme", icon: ClipboardList, href: "/admin/programme" },
    ],
  },
];

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "colleges", label: "Colleges", icon: GraduationCap },
  { key: "sessions", label: "Sessions", icon: CalendarDays },
  { key: "questions", label: "Field FAQs", icon: MessageSquareText },
  { key: "content", label: "Content", icon: ImageIcon },
  { key: "inquiries", label: "Care queue", icon: Headset },
  { key: "fees", label: "Fees", icon: IndianRupee },
  { key: "stipends", label: "Payroll", icon: Wallet },
  { key: "clients", label: "Client work", icon: BriefcaseBusiness },
  { key: "placements", label: "Placements", icon: Trophy },
  { key: "donations", label: "Donations", icon: HandCoins },
  { key: "gurukulam", label: "Gurukulam", icon: Sprout },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProgrammeAdminPage() {
  const { session, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>("overview");
  const [applications, setApplications] = useState<FellowshipAdminApplication[]>([]);
  const [colleges, setColleges] = useState<ProgrammeCollegeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [applicationData, collegeData] = await Promise.all([
        adminRequest<{ applications: FellowshipAdminApplication[] }>(
          "/api/fellowship-applications",
        ),
        adminRequest<{ items: ProgrammeCollegeOption[] }>(
          "/api/fellowship-programme/admin/colleges?limit=1000",
        ),
      ]);
      setApplications(applicationData.applications ?? []);
      setColleges(collegeData.items ?? []);
      setForbidden(false);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not load programme data.";
      if (message.toLowerCase().includes("forbidden") || message.toLowerCase().includes("admin")) {
        setForbidden(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !session) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, load, session]);

  const resource = useMemo(
    () => (tab === "overview" ? null : programmeResource(tab)),
    [tab],
  );

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-sm rounded-2xl border-border/70 text-center shadow-lg">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
            <Badge
              variant="outline"
              className="rounded-full border-violet-500/20 bg-violet-500/10 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600"
            >
              Programme
            </Badge>
            <p className="text-sm text-muted-foreground">Checking admin access…</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
        <Card className="w-full max-w-md rounded-2xl border-border/70 text-center shadow-xl">
          <CardHeader className="pb-3">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <Badge
              variant="outline"
              className="mx-auto rounded-full border-violet-500/20 bg-violet-500/10 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600"
            >
              Private workspace
            </Badge>
            <CardTitle className="mt-3 text-xl">Programme operations</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/login?next=/admin/programme"
              className="text-sm font-medium text-primary hover:underline"
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
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
        <Card className="w-full max-w-md rounded-2xl border-border/70 text-center shadow-xl">
          <CardHeader className="pb-3">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <Badge
              variant="outline"
              className="mx-auto rounded-full border-destructive/30 bg-destructive/10 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-destructive"
            >
              Access denied
            </Badge>
            <CardTitle className="mt-3 text-xl">Programme operations</CardTitle>
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
      title="Programme"
      subtitle="Outreach, operations and student support"
      headerIcon={ClipboardList}
      pill="Programme Management"
      bannerTitle="Manage Programme"
      bannerDescription="Track outreach, content, fees, client work, placements and donations."
      bannerIcon={ClipboardList}
      groups={NAV_GROUPS}
      activeKey="programme"
      liveHref="/"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/admin/fellowship">
            <Button variant="outline" size="sm" className="rounded-lg">
              Fellowship admissions
            </Button>
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <Card className="overflow-hidden rounded-2xl border-border/70">
          <CardHeader className="border-b border-border/70 bg-muted/20 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-0.5 rounded-full bg-violet-500" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
                        Operational registers
                      </p>
                    </span>
                    <Badge
                      variant="outline"
                      className="rounded-full border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600"
                    >
                      {TABS.length} views
                    </Badge>
                  </div>
                  <CardTitle className="mt-1.5 text-base">Programme workspaces</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose a register to review or update its records.
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="h-8 rounded-full border-border bg-background/60 px-3 text-[11px] font-semibold text-muted-foreground"
              >
                INR amounts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-1.5 [scrollbar-width:thin]">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={tab === key ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                    tab === key
                      ? "bg-violet-500/10 text-violet-600 shadow-xs ring-1 ring-violet-500/20"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-wrap items-center gap-2 p-4 text-xs text-destructive">
              <Badge
                variant="outline"
                className="rounded-full border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive"
              >
                Action needed
              </Badge>
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {tab === "overview" && <ProgrammeOverview />}
          {tab === "stipends" && (
            <div className="space-y-4">
              <StipendGenerator
                applications={applications}
                onGenerated={() => setRefreshKey((current) => current + 1)}
              />
              {resource && (
                <ProgrammePanel
                  key={`${resource.key}-${refreshKey}`}
                  resource={resource}
                  applications={applications}
                  colleges={colleges}
                  refreshKey={refreshKey}
                />
              )}
            </div>
          )}
          {tab !== "overview" && tab !== "stipends" && resource && (
            <ProgrammePanel
              key={resource.key}
              resource={resource}
              applications={applications}
              colleges={colleges}
            />
          )}
        </div>

        <Card className="rounded-2xl border-border/70 bg-muted/20 shadow-none">
          <CardContent className="flex flex-wrap items-center gap-2 p-4 text-[11px] text-muted-foreground">
            <Badge
              variant="outline"
              className="rounded-full border-border bg-background/60 px-2.5 py-0.5 text-[10px] font-semibold"
            >
              INR
            </Badge>
            <span>
              Only {PROGRAMME_RESOURCES.length} operational registers are shown. Money values are
              recorded in INR. The website does not collect online payments for fees or donations.
            </span>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
