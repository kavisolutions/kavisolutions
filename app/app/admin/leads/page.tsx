"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Inbox,
  Landmark,
  LayoutDashboard,
  Loader2,
  Mail,
  Moon,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/lib/auth-context";
import {
  isLeadService,
  LEAD_SERVICE_BLURBS,
  LEAD_SERVICE_LABELS,
  LEAD_SERVICES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_TONES,
  type Lead,
  type LeadListResponse,
  type LeadService,
  type LeadStatus,
} from "@/lib/leads";

type ServiceFilter = LeadService | "all";
type StatusFilter = LeadStatus | "all";

const withCookies = (extra: RequestInit = {}): RequestInit => ({
  credentials: "include",
  ...extra,
});

const SERVICE_ICONS: Record<LeadService, LucideIcon> = {
  survey: BarChart3,
  fellow: GraduationCap,
  financial: Wallet,
  government: Landmark,
  farms: Sprout,
  gurukulam: BookOpen,
  contact: Mail,
};

const SERVICE_TABS: { key: ServiceFilter; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All leads", icon: LayoutDashboard },
  ...LEAD_SERVICES.map((key) => ({
    key,
    label: LEAD_SERVICE_LABELS[key],
    icon: SERVICE_ICONS[key],
  })),
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All statuses" },
  ...(["new", "contacted", "qualified", "won", "lost"] as const).map((key) => ({
    key,
    label: LEAD_STATUS_LABELS[key],
  })),
];

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const buildQuery = (service: ServiceFilter, status: StatusFilter, search: string): string => {
  const params = new URLSearchParams();
  if (service !== "all") params.set("service", service);
  if (status !== "all") params.set("status", status);
  const trimmed = search.trim();
  if (trimmed) params.set("search", trimmed);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export default function LeadsAdminPage() {
  const { session, loading: authLoading } = useAuth();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored =
      window.localStorage.getItem("kavi-theme") ||
      window.localStorage.getItem("kavi-admin-theme");
    return stored === "light" ? "light" : "dark";
  });
  const [service, setService] = useState<ServiceFilter>(() => {
    if (typeof window === "undefined") return "all";
    const value = new URLSearchParams(window.location.search).get("service");
    return isLeadService(value) ? value : "all";
  });
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    byService: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ status: LeadStatus; notes: string }>({
    status: "new",
    notes: "",
  });

  useEffect(() => {
    window.localStorage.setItem("kavi-theme", theme);
    window.localStorage.setItem("kavi-admin-theme", theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/leads${buildQuery(service, status, query)}`, withCookies());
      if (response.status === 401 || response.status === 403) {
        setForbidden(true);
        return;
      }
      if (!response.ok) throw new Error("Could not load leads");

      const data = (await response.json()) as LeadListResponse;
      setLeads(data.leads ?? []);
      setCounts(
        data.counts ?? {
          total: 0,
          byService: {},
          byStatus: {},
        },
      );
      setForbidden(false);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }, [service, status, query]);

  useEffect(() => {
    if (authLoading || !session || forbidden) return;
    const timer = window.setTimeout(() => void load(), query.trim() ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, session, forbidden, load, query]);

  const selected = useMemo(
    () => leads.find((item) => item.id === selectedId) ?? null,
    [leads, selectedId],
  );

  const changeService = (next: ServiceFilter) => {
    setService(next);
    setSelectedId(null);
    setNotice("");
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("service");
    else url.searchParams.set("service", next);
    window.history.replaceState(null, "", url);
  };

  const openLead = (lead: Lead) => {
    setSelectedId(lead.id);
    setDraft({ status: lead.status, notes: lead.notes });
    setNotice("");
    setError("");
  };

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/leads/${selected.id}`,
        withCookies({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        }),
      );
      const data = (await response.json().catch(() => null)) as
        | { lead?: Lead; message?: string }
        | null;
      if (!response.ok || !data?.lead) {
        throw new Error(apiErrorMessage(data, "Could not save the lead."));
      }

      const saved = data.lead;
      setLeads((current) =>
        current.map((item) =>
          item.id === saved.id ? { ...item, status: saved.status, notes: saved.notes } : item,
        ),
      );
      setNotice(`${saved.name}'s lead updated`);
      setSelectedId(null);
      void load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the lead.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (lead: Lead) => {
    if (!window.confirm(`Delete the lead from ${lead.name}? This cannot be undone.`)) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/leads/${lead.id}`, withCookies({ method: "DELETE" }));
      if (!response.ok) throw new Error("Could not delete the lead");
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      setNotice("Lead deleted");
      setSelectedId(null);
      void load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the lead.");
    } finally {
      setSaving(false);
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
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-9 w-9 text-primary" />
          <h1 className="mt-4 text-lg font-semibold">Private workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with an administrator account to view leads.
          </p>
          <Link
            href="/login?next=/admin/leads"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Sign in to continue
          </Link>
        </div>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-9 w-9 text-destructive" />
          <h1 className="mt-4 text-lg font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.user.email} is not listed as an administrator.
          </p>
          <Link href="/admin" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            Back to admin console
          </Link>
        </div>
      </main>
    );
  }

  const exportQuery = buildQuery(service, status, query);
  const activeService = SERVICE_TABS.find((tab) => tab.key === service) ?? SERVICE_TABS[0];
  const kpis = [
    {
      label: "Total leads",
      value: counts.total,
      note: "Across all services",
      icon: UserRound,
      accent: "from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-300",
    },
    {
      label: "New",
      value: counts.byStatus.new ?? 0,
      note: "Awaiting first contact",
      icon: Clock,
      accent: "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300",
    },
    {
      label: "Qualified",
      value: counts.byStatus.qualified ?? 0,
      note: "Ready for follow-up",
      icon: Target,
      accent: "from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-300",
    },
    {
      label: "Won",
      value: counts.byStatus.won ?? 0,
      note: "Converted enquiries",
      icon: TrendingUp,
      accent: "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300",
    },
  ];

  return (
    <div
      id="admin-app"
      data-theme={theme}
      className={`admin-app min-h-screen bg-background text-foreground ${theme === "dark" ? "dark" : ""}`}
    >
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-sm font-bold text-white shadow-sm">
            K
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-none">Kavi Solutions</p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">Private workspace</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
            Console
          </p>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin console
          </Link>
          <Link
            href="/admin/leads"
            aria-current="page"
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
          >
            <span className="flex items-center gap-3">
              <Inbox className="h-4 w-4" />
              Lead inbox
            </span>
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary-foreground">
              {counts.total}
            </span>
          </Link>
          <Link
            href="/admin/fellowship"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <GraduationCap className="h-4 w-4" />
            Fellowship
          </Link>
          <Link
            href="/admin/programme"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <Building2 className="h-4 w-4" />
            Programme operations
          </Link>

          <p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
            Viewing
          </p>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <ArrowUpRight className="h-4 w-4" />
            Public website
          </Link>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {(session.user.email?.[0] ?? "A").toUpperCase()}
            </div>
            <p className="min-w-0 flex-1 truncate text-xs font-semibold" title={session.user.email ?? ""}>
              {session.user.email}
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-60">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:hidden">
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Leads</span>
        </div>

        <header className="border-b border-border bg-card/60 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Admin console
              </Link>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Lead inbox</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Private enquiries from every public service, in one place. Open a lead to update
                its status and add internal notes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Private
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          {/* KPI strip */}
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Lead summary">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${kpi.accent} bg-card p-4 shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tabular-nums leading-none">{kpi.value}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{kpi.note}</p>
                  </div>
                  <span className="rounded-xl border border-border/60 bg-background/60 p-2">
                    <kpi.icon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </section>

          {notice && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {notice}
              </span>
              <button aria-label="Dismiss" onClick={() => setNotice("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {error && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span>{error}</span>
              <button aria-label="Dismiss" onClick={() => setError("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Service sub-tabs */}
          <section className="mt-6" aria-label="Lead services">
            <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1.5 shadow-sm [scrollbar-width:thin]">
              {SERVICE_TABS.map((tab) => {
                const active = service === tab.key;
                const count =
                  tab.key === "all" ? counts.total : (counts.byService[tab.key] ?? 0);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => changeService(tab.key)}
                    aria-current={active ? "page" : undefined}
                    title={tab.key === "all" ? "Every service" : LEAD_SERVICE_BLURBS[tab.key]}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all ${
                      active
                        ? "bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {service === "all"
                ? "All public enquiry forms feed this private inbox."
                : LEAD_SERVICE_BLURBS[service]}
            </p>
          </section>

          {/* Toolbar */}
          <section className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, company or message"
                aria-label="Search leads"
                className="h-9 pl-9"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              aria-label="Filter by status"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                  {option.key !== "all" && ` (${counts.byStatus[option.key] ?? 0})`}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <a
              href={`/api/leads/export.csv${exportQuery}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-semibold shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </section>

          {/* Leads table */}
          <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">{activeService.label}</h2>
                <p className="text-[11px] text-muted-foreground">
                  {loading ? "Loading leads…" : `${leads.length} matching ${leads.length === 1 ? "lead" : "leads"}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-12 animate-pulse rounded-lg bg-muted/50" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <Inbox className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">No leads here yet</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Enquiries submitted from the public pages will appear in this inbox.
                </p>
                {(query || status !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setQuery("");
                      setStatus("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Contact</th>
                      {service === "all" && <th className="px-4 py-3">Service</th>}
                      <th className="px-4 py-3">Interest</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Received</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leads.map((lead) => {
                      const ServiceIcon = SERVICE_ICONS[lead.service] ?? Mail;
                      return (
                        <tr
                          key={lead.id}
                          tabIndex={0}
                          onClick={() => openLead(lead)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openLead(lead);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-muted/40 focus:bg-muted/40 focus:outline-none"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {lead.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold leading-tight">{lead.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {lead.email || lead.phone || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          {service === "all" && (
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <ServiceIcon className="h-3.5 w-3.5" />
                                {LEAD_SERVICE_LABELS[lead.service] ?? lead.service}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <p className="max-w-[240px] truncate text-xs font-medium">
                              {lead.subject || lead.kind || "General enquiry"}
                            </p>
                            {lead.organisation && (
                              <p className="mt-0.5 max-w-[240px] truncate text-[11px] text-muted-foreground">
                                {lead.organisation}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                                LEAD_STATUS_TONES[lead.status] ?? LEAD_STATUS_TONES.new
                              }`}
                            >
                              {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(lead.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                              View
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <button
            aria-label="Close lead details"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
          />
          <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {LEAD_SERVICE_LABELS[selected.service] ?? selected.service} lead
                </p>
                <h2 className="mt-1 truncate text-xl font-bold">{selected.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Received {formatDate(selected.createdAt)}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Contact
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {selected.email || "No email"}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 hover:underline">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {selected.phone}
                    </a>
                  )}
                  {selected.organisation && (
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {selected.organisation}
                    </p>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Interest
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug">
                    {selected.subject || selected.kind || "General enquiry"}
                  </p>
                  {selected.kind && <p className="mt-1 text-[11px] text-muted-foreground">{selected.kind}</p>}
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reference
                  </p>
                  <p className="mt-1.5 break-all font-mono text-xs font-medium">
                    {selected.reference || "—"}
                  </p>
                  {selected.source && (
                    <p className="mt-1 text-[11px] text-muted-foreground">from {selected.source}</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Message
                </h3>
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-3 text-sm leading-relaxed">
                  {selected.message || "—"}
                </p>
              </section>

              <section>
                <label
                  htmlFor="lead-status"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Pipeline status
                </label>
                <select
                  id="lead-status"
                  value={draft.status}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    status: event.target.value as LeadStatus,
                  }))}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {STATUS_OPTIONS.filter((option) => option.key !== "all").map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </section>

              <section>
                <label
                  htmlFor="lead-notes"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Internal notes
                  <span className="ml-1 font-normal normal-case tracking-normal">
                    (not visible to visitors)
                  </span>
                </label>
                <textarea
                  id="lead-notes"
                  value={draft.notes}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))}
                  rows={6}
                  placeholder="Call back tomorrow, send proposal…"
                  className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </section>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => void remove(selected)}
                disabled={saving}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => void save()} disabled={saving}>
                  {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Save changes
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
