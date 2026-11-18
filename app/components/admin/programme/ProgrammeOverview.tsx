"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  HandCoins,
  IndianRupee,
  Loader2,
  Megaphone,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminRequest } from "@/lib/fellowship-admin";
import { formatMoney } from "@/lib/programme-admin";

type Dashboard = {
  colleges: { total: number; contacted: number; sessions: number; followUpsDue: number };
  sessions: { planned: number; completed: number };
  questions: { open: number; published: number };
  content: { ideas: number; drafts: number; scheduled: number; published: number };
  care: { new: number; open: number; overdue: number };
  fees: { billed: number; collected: number; outstanding: number; pending: number };
  payroll: { dueAmount: number; paidAmount: number; planned: number };
  clients: { active: number; contractValue: number; received: number; outstanding: number };
  placements: { offers: number; joined: number };
  donations: { pledged: number; received: number; count: number };
  gurukulam: { total: number; new: number; returners: number };
};

const Tile = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-xl border border-border bg-card p-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
    <p className="mt-1 text-xl font-semibold">{value}</p>
    {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
  </div>
);

const Group = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{children}</CardContent>
  </Card>
);

export default function ProgrammeOverview() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await adminRequest<Dashboard>("/api/fellowship-programme/dashboard"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the programme dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading programme dashboard…
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-8">
          <p className="text-sm text-destructive">{error || "Dashboard unavailable."}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Live counts across outreach, content, care, finance and pathways.
        </p>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Group title="Outreach" icon={Megaphone}>
        <Tile label="Colleges" value={data.colleges.total} icon={GraduationCap} />
        <Tile label="Contacted" value={data.colleges.contacted} icon={Users} />
        <Tile label="Follow-ups due" value={data.colleges.followUpsDue} icon={AlertCircle} />
        <Tile label="Sessions planned" value={data.sessions.planned} icon={CalendarDays} />
      </Group>

      <Group title="Content and care" icon={Sparkles}>
        <Tile label="Content ideas" value={data.content.ideas} icon={Sparkles} />
        <Tile label="In review" value={data.content.drafts} icon={BarChart3} />
        <Tile label="Published" value={data.content.published} icon={Megaphone} />
        <Tile label="Open enquiries" value={data.care.open} icon={AlertCircle} hint={`${data.care.overdue} callback overdue`} />
      </Group>

      <Group title="Money" icon={IndianRupee}>
        <Tile label="Fees billed" value={formatMoney(data.fees.billed)} icon={IndianRupee} />
        <Tile label="Fees collected" value={formatMoney(data.fees.collected)} icon={HandCoins} />
        <Tile label="Fees outstanding" value={formatMoney(data.fees.outstanding)} icon={AlertCircle} />
        <Tile label="Client contract value" value={formatMoney(data.clients.contractValue)} icon={BriefcaseBusiness} />
      </Group>

      <Group title="Payroll and pathways" icon={GraduationCap}>
        <Tile label="Stipends due" value={formatMoney(data.payroll.dueAmount)} icon={IndianRupee} />
        <Tile label="Stipends paid" value={formatMoney(data.payroll.paidAmount)} icon={HandCoins} />
        <Tile label="Placements joined" value={data.placements.joined} icon={BriefcaseBusiness} />
        <Tile label="Gurukulam leads" value={data.gurukulam.new} icon={GraduationCap} hint={`${data.gurukulam.returners} returners`} />
      </Group>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Other signals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <p>Field FAQs published: <span className="font-semibold text-foreground">{data.questions.published}</span></p>
          <p>Client work received: <span className="font-semibold text-foreground">{formatMoney(data.clients.received)}</span></p>
          <p>Donations received: <span className="font-semibold text-foreground">{formatMoney(data.donations.received)}</span></p>
          <p>Donation pledges: <span className="font-semibold text-foreground">{formatMoney(data.donations.pledged)}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}
