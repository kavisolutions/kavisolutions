"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  HandCoins,
  Headset,
  Image as ImageIcon,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Sprout,
  Trophy,
  Wallet,
} from "lucide-react";

import ProgrammeOverview from "@/components/admin/programme/ProgrammeOverview";
import ProgrammePanel from "@/components/admin/programme/ProgrammePanel";
import StipendGenerator from "@/components/admin/programme/StipendGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { adminRequest, type FellowshipAdminApplication } from "@/lib/fellowship-admin";
import {
  PROGRAMME_RESOURCES,
  programmeResource,
  type ProgrammeCollegeOption,
} from "@/lib/programme-admin";

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
            <CardTitle>Programme operations</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/login?next=/admin/programme" className="text-sm font-medium text-primary hover:underline">
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
      <div className="mx-auto max-w-[1320px]">
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
              Programme operations
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              College outreach, content, customer care, fees, intern payroll, client work,
              placements, donations and the Gurukulam pathway.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/admin/fellowship">
              <Button variant="outline" size="sm">
                Fellowship admissions
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1.5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4">
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

        <p className="mt-6 text-[11px] text-muted-foreground">
          Only {PROGRAMME_RESOURCES.length} operational registers are shown. Money values are
          recorded in INR. The website does not collect online payments for fees or donations.
        </p>
      </div>
    </main>
  );
}
