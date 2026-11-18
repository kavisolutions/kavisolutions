"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertOctagon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonBody,
  type FellowshipAdminApplication,
  type FellowshipCase,
} from "@/lib/fellowship-admin";

const CATEGORIES = ["posh", "safeguarding", "grievance", "wellbeing", "other"] as const;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["open", "investigating", "resolved", "closed"] as const;

export default function CasesPanel({
  applications,
}: {
  applications: FellowshipAdminApplication[];
}) {
  const [cases, setCases] = useState<FellowshipCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [applicationId, setApplicationId] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("grievance");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("medium");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const data = await adminRequest<{ cases: FellowshipCase[]; openCount: number }>(
        `/api/fellowship-cases${query}`,
      );
      setCases(data.cases ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load cases.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const create = async () => {
    if (summary.trim().length < 4) {
      setError("Add a short case summary.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        "/api/fellowship-cases",
        jsonBody({
          applicationId: applicationId || undefined,
          category,
          severity,
          summary,
          details,
          assignedTo: assignedTo || undefined,
        }),
      );
      setNotice("Confidential case created.");
      setSummary("");
      setDetails("");
      setAssignedTo("");
      setApplicationId("");
      setFormOpen(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the case.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (entry: FellowshipCase, status: string) => {
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-cases/${entry.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      setNotice(`Case marked ${status}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the case.");
    }
  };

  const resolve = async (entry: FellowshipCase) => {
    const resolution = window.prompt("Resolution summary");
    if (!resolution) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-cases/${entry.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "resolved", resolution }),
        },
      );
      setNotice("Case resolved and recorded.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resolve the case.");
    }
  };

  const remove = async (entry: FellowshipCase) => {
    const confirmation = window.prompt(
      "This permanently deletes a confidential case. Type DELETE to confirm.",
    );
    if (confirmation !== "DELETE") return;
    try {
      await adminRequest(`/api/fellowship-cases/${entry.id}`, { method: "DELETE" });
      setNotice("Case deleted.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the case.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-700">
        Confidential. POSH, safeguarding and grievance cases must follow Kavi&apos;s
        written escalation policy and legal advice. This screen records cases; it is
        not a substitute for an investigation process.
      </div>

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
              <AlertOctagon className="h-4 w-4 text-amber-500" />
              Safeguarding and grievance cases
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Restricted to admins. Record the minimum necessary information and do
              not paste medical or identity documents into the case notes.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setFormOpen((value) => !value)}>
              <Plus className="h-4 w-4" />
              New case
            </Button>
          </div>
        </CardHeader>

        {formOpen && (
          <CardContent className="border-t border-border">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Linked application (optional)
                </span>
                <select
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  <option value="">No linked application</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.name} · {application.reference}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as (typeof CATEGORIES)[number])
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  {CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Severity
                </span>
                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value as (typeof SEVERITIES)[number])
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  {SEVERITIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary
                </span>
                <Input
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Short, factual summary"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Details
                </span>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                  placeholder="What happened, who was involved, immediate action taken"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned to
                </span>
                <Input
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  placeholder="Named case owner"
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => void create()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Create case
              </Button>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Loading cases…" : `${cases.length} case${cases.length === 1 ? "" : "s"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!loading && cases.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No cases match this filter.
            </p>
          )}
          {cases.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-xl border p-4 ${
                entry.severity === "critical" || entry.severity === "high"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {entry.category} · {entry.severity}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {entry.candidateName
                      ? `${entry.candidateName} · ${entry.candidateReference}`
                      : "No linked application"}{" "}
                    · {new Date(entry.createdAt).toLocaleDateString()}
                    {entry.assignedTo ? ` · ${entry.assignedTo}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] ${
                    ["open", "investigating"].includes(entry.status)
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {entry.status}
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium">{entry.summary}</p>
              {entry.details && (
                <p className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">
                  {entry.details}
                </p>
              )}
              {entry.resolution && (
                <p className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11px] text-emerald-700">
                  Resolution: {entry.resolution}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.status !== "investigating" && entry.status !== "resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void updateStatus(entry, "investigating")}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Start investigation
                  </Button>
                )}
                {entry.status !== "resolved" && entry.status !== "closed" && (
                  <Button variant="outline" size="sm" onClick={() => void resolve(entry)}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Resolve
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void remove(entry)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
