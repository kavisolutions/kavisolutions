"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Download,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WhatsAppPanel from "@/components/admin/fellowship/WhatsAppPanel";
import {
  adminRequest,
  type FellowshipAuditEntry,
  type FellowshipDashboard,
  type FellowshipEmailTemplate,
} from "@/lib/fellowship-admin";
import { FELLOWSHIP_STAGE_LABELS, isFellowshipStage } from "@/lib/fellowship-application";

const stat = (label: string, value: string | number, hint?: string) => (
  <div key={label} className="rounded-xl border border-border bg-card p-3">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 text-xl font-semibold">{value}</p>
    {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
  </div>
);

export default function DashboardPanel() {
  const [dashboard, setDashboard] = useState<FellowshipDashboard | null>(null);
  const [audit, setAudit] = useState<FellowshipAuditEntry[]>([]);
  const [templates, setTemplates] = useState<FellowshipEmailTemplate[]>([]);
  const [templateKey, setTemplateKey] = useState("stage.offer");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardData, auditData, templateData] = await Promise.all([
        adminRequest<FellowshipDashboard>("/api/fellowship-operations/dashboard"),
        adminRequest<{ entries: FellowshipAuditEntry[] }>(
          "/api/fellowship-audit?limit=40",
        ),
        adminRequest<{ templates: FellowshipEmailTemplate[] }>(
          "/api/fellowship-email-templates",
        ),
      ]);
      setDashboard(dashboardData);
      setAudit(auditData.entries ?? []);
      const list = templateData.templates ?? [];
      setTemplates(list);
      const current = list.find((template) => template.key === templateKey);
      setSubject(current?.subject ?? "");
      setBody(current?.body ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, [templateKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectTemplate = (key: string) => {
    setTemplateKey(key);
    const current = templates.find((template) => template.key === key);
    setSubject(current?.subject ?? "");
    setBody(current?.body ?? "");
  };

  const saveTemplate = async () => {
    setSavingTemplate(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-email-templates/${templateKey}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, body }),
        },
      );
      setNotice("Email template saved. Stage updates will use this copy.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async () => {
    if (!window.confirm("Delete this template and fall back to the built-in copy?")) return;
    setSavingTemplate(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/fellowship-email-templates/${templateKey}`, {
        method: "DELETE",
      });
      setNotice("Template deleted. Built-in copy will be used.");
      setSubject("");
      setBody("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const run = async (
    key: string,
    path: string,
    label: string,
  ) => {
    setRunning(key);
    setError("");
    setNotice("");
    try {
      const data = await adminRequest<{ sent: number }>(path, { method: "POST" });
      setNotice(data.sent ? `${label}: ${data.sent} sent.` : `${label}: nothing due.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not run ${label}.`);
    } finally {
      setRunning("");
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
              <Activity className="h-4 w-4 text-primary" />
              Admissions dashboard
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Live pipeline counts, conversion, alerts and the latest audit trail.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <a
              href="/api/fellowship-applications/export.csv"
              className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !dashboard ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : dashboard ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {stat("Applications", dashboard.applications.total)}
                {stat("Interview rate", `${dashboard.applications.interviewRate}%`)}
                {stat("Offer rate", `${dashboard.applications.offerRate}%`)}
                {stat("Completion rate", `${dashboard.applications.completionRate}%`)}
                {stat("Upcoming interviews", dashboard.interviews.upcoming, `${dashboard.interviews.nextSevenDays} in 7 days`)}
                {stat("Offers expiring", dashboard.offers.expiringSoon, "within 72 hours")}
                {stat("Pending reviews", dashboard.reviews.pending, `${dashboard.reviews.assigned} assigned`)}
                {stat("At-risk fellows", dashboard.delivery.atRisk)}
                {stat("Open cases", dashboard.cases.open)}
                {stat("Waitlisted", dashboard.waitlist.active)}
                {stat("Alumni", dashboard.alumni.total, `${dashboard.alumni.published} published`)}
                {stat("Mentor willing", dashboard.alumni.mentorWilling)}
              </div>

              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pipeline
                </p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(dashboard.applications.stages)
                    .sort((left, right) => right[1] - left[1])
                    .map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-muted-foreground">
                          {isFellowshipStage(stage)
                            ? FELLOWSHIP_STAGE_LABELS[stage]
                            : stage}
                        </span>
                        <span className="font-mono">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void run(
                      "interviews",
                      "/api/fellowship-interviews/reminders/run",
                      "Interview reminders",
                    )
                  }
                  disabled={Boolean(running)}
                >
                  {running === "interviews" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  Run interview reminders
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void run(
                      "offers",
                      "/api/fellowship-applications/offers/reminders/run",
                      "Offer reminders",
                    )
                  }
                  disabled={Boolean(running)}
                >
                  {running === "offers" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  Run offer reminders
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void run(
                      "alumni",
                      "/api/fellowship-alumni/follow-ups/run",
                      "Alumni follow-ups",
                    )
                  }
                  disabled={Boolean(running)}
                >
                  {running === "alumni" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  Run alumni follow-ups
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {audit.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No audit entries yet.
            </p>
          )}
          {audit.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[10px]"
            >
              <span className="font-medium">{entry.action}</span>
              <span className="text-muted-foreground">
                {entry.actorEmail} · {new Date(entry.createdAt).toLocaleString()}
                {entry.detail ? ` · ${entry.detail}` : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <WhatsAppPanel />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage email templates</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional overrides for stage-update emails. Placeholders:
            {" "}
            <code>{"{{name}}"}</code>, <code>{"{{reference}}"}</code>,{" "}
            <code>{"{{track}}"}</code>, <code>{"{{cohort}}"}</code>,{" "}
            <code>{"{{stage}}"}</code>, <code>{"{{offerExpiry}}"}</code>,{" "}
            <code>{"{{offerUrl}}"}</code>. Leave empty to use the built-in email.
          </p>
        </CardHeader>
        <CardContent>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Template
            </span>
            <select
              value={templateKey}
              onChange={(event) => selectTemplate(event.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
            >
              {[
                "stage.applied",
                "stage.review",
                "stage.interview",
                "stage.waitlisted",
                "stage.offer",
                "stage.accepted",
                "stage.onboarded",
                "stage.active",
                "stage.completed",
                "stage.rejected",
                "stage.withdrawn",
              ].map((key) => (
                <option key={key} value={key}>
                  {key}
                  {templates.some((template) => template.key === key)
                    ? " (custom)"
                    : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Subject
            </span>
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Kavi Fellowship status update — {{reference}}"
            />
          </label>
          <label className="mt-2 block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Body
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
              placeholder={`Hello {{name}},\n\nYour application {{reference}} is now at {{stage}}.\n\nKavi Fellowship team`}
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => void saveTemplate()}
              disabled={savingTemplate}
            >
              {savingTemplate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => void deleteTemplate()}
              disabled={savingTemplate}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete override
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
