"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonBody,
  jsonPatch,
  type FellowshipAdminApplication,
  type FellowshipAlumniRecord,
} from "@/lib/fellowship-admin";

const DESTINATIONS = [
  ["", "Not recorded"],
  ["job", "Employment"],
  ["freelance", "Freelance / consulting"],
  ["venture", "Founded a venture"],
  ["further_study", "Further study"],
  ["fellowship", "Another fellowship"],
  ["other", "Other"],
] as const;

type AlumniDraft = {
  applicationId: string;
  name: string;
  email: string;
  cohort: string;
  track: string;
  destinationType: string;
  organisation: string;
  role: string;
  outcome6m: string;
  outcome12m: string;
  mentorWilling: boolean;
  testimonialConsent: boolean;
  notes: string;
};

const EMPTY_DRAFT: AlumniDraft = {
  applicationId: "",
  name: "",
  email: "",
  cohort: "",
  track: "",
  destinationType: "",
  organisation: "",
  role: "",
  outcome6m: "",
  outcome12m: "",
  mentorWilling: false,
  testimonialConsent: false,
  notes: "",
};

export default function AlumniPanel({
  applications,
}: {
  applications: FellowshipAdminApplication[];
}) {
  const [alumni, setAlumni] = useState<FellowshipAlumniRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingID, setEditingID] = useState<string | null>(null);
  const [draft, setDraft] = useState<AlumniDraft>(EMPTY_DRAFT);

  const completed = useMemo(
    () => applications.filter((application) => application.stage === "completed"),
    [applications],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest<{ alumni: FellowshipAlumniRecord[] }>(
        "/api/fellowship-alumni",
      );
      setAlumni(data.alumni ?? []);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load alumni records.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return alumni;
    return alumni.filter((record) =>
      `${record.name} ${record.email} ${record.cohort} ${record.track} ${record.organisation} ${record.role}`
        .toLowerCase()
        .includes(search),
    );
  }, [alumni, query]);

  const openCreate = () => {
    setEditingID(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(true);
    setNotice("");
  };

  const openEdit = (record: FellowshipAlumniRecord) => {
    setEditingID(record.id);
    setDraft({
      applicationId: record.applicationId ?? "",
      name: record.name,
      email: record.email,
      cohort: record.cohort,
      track: record.track,
      destinationType: record.destinationType,
      organisation: record.organisation,
      role: record.role,
      outcome6m: record.outcome6m,
      outcome12m: record.outcome12m,
      mentorWilling: record.mentorWilling,
      testimonialConsent: record.testimonialConsent,
      notes: record.notes,
    });
    setFormOpen(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prefill = (applicationId: string) => {
    const application = applications.find((item) => item.id === applicationId);
    if (!application) {
      setDraft({ ...draft, applicationId: "" });
      return;
    }
    setDraft({
      ...draft,
      applicationId,
      name: application.name,
      email: application.email,
      cohort: application.cohort,
      track: application.track,
    });
  };

  const save = async () => {
    if (saving) return;
    if (!draft.name.trim() || !draft.email.trim()) {
      setError("Alumni name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingID) {
        await adminRequest(`/api/fellowship-alumni/${editingID}`, jsonPatch(draft));
        setNotice("Alumni record updated.");
      } else {
        await adminRequest("/api/fellowship-alumni", jsonBody(draft));
        setNotice("Alumni record added.");
      }
      setFormOpen(false);
      setEditingID(null);
      setDraft(EMPTY_DRAFT);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save the alumni record.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: FellowshipAlumniRecord) => {
    if (!window.confirm(`Delete the alumni record for ${record.name}?`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/fellowship-alumni/${record.id}`, { method: "DELETE" });
      setNotice("Alumni record deleted.");
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete the record.",
      );
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
              <GraduationCap className="h-4 w-4 text-primary" />
              Alumni outcomes
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Completing an application creates the alumni record automatically.
              Record 6 and 12-month destinations only with consent.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add alumni
            </Button>
          </div>
        </CardHeader>

        {formOpen && (
          <CardContent className="border-t border-border">
            {!editingID && completed.length > 0 && (
              <label className="mb-3 block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Start from a completed fellow
                </span>
                <select
                  value={draft.applicationId}
                  onChange={(event) => prefill(event.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  <option value="">Manual alumni record</option>
                  {completed.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.name} · {application.reference}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </span>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </span>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                />
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
                  Track
                </span>
                <Input
                  value={draft.track}
                  onChange={(event) => setDraft({ ...draft, track: event.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Current destination
                </span>
                <select
                  value={draft.destinationType}
                  onChange={(event) =>
                    setDraft({ ...draft, destinationType: event.target.value })
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                >
                  {DESTINATIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Organisation
                </span>
                <Input
                  value={draft.organisation}
                  onChange={(event) =>
                    setDraft({ ...draft, organisation: event.target.value })
                  }
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Role / work
                </span>
                <Input
                  value={draft.role}
                  onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  6-month outcome
                </span>
                <textarea
                  value={draft.outcome6m}
                  onChange={(event) => setDraft({ ...draft, outcome6m: event.target.value })}
                  rows={2}
                  className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  12-month outcome
                </span>
                <textarea
                  value={draft.outcome12m}
                  onChange={(event) => setDraft({ ...draft, outcome12m: event.target.value })}
                  rows={2}
                  className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={draft.mentorWilling}
                  onChange={(event) =>
                    setDraft({ ...draft, mentorWilling: event.target.checked })
                  }
                />
                Willing to mentor or speak
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={draft.testimonialConsent}
                  onChange={(event) =>
                    setDraft({ ...draft, testimonialConsent: event.target.checked })
                  }
                />
                Testimonial and outcome publication consent
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </span>
                <textarea
                  value={draft.notes}
                  onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                  placeholder="Verification source, follow-up date…"
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingID ? "Save record" : "Add record"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormOpen(false);
                  setEditingID(null);
                  setDraft(EMPTY_DRAFT);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">
              {loading
                ? "Loading alumni…"
                : `${filtered.length} of ${alumni.length} alumni`}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, cohort or employer"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No alumni records yet. Completing the fellowship creates one, or add a
              record manually.
            </p>
          )}
          {filtered.map((record) => (
            <div key={record.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{record.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {record.email} · {record.track || "Track not recorded"} ·{" "}
                    {record.cohort || "Cohort not recorded"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {DESTINATIONS.find(([value]) => value === record.destinationType)?.[1] ??
                      record.destinationType ??
                      "Destination not recorded"}
                    {record.organisation ? ` · ${record.organisation}` : ""}
                    {record.role ? ` · ${record.role}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {record.mentorWilling && (
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-600">
                      Mentor willing
                    </span>
                  )}
                  {record.testimonialConsent && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-600">
                      Publication consent
                    </span>
                  )}
                </div>
              </div>
              {(record.outcome6m || record.outcome12m) && (
                <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
                  {record.outcome6m && <p>6 months: {record.outcome6m}</p>}
                  {record.outcome12m && <p>12 months: {record.outcome12m}</p>}
                </div>
              )}
              {record.notes && (
                <p className="mt-2 whitespace-pre-wrap text-[11px] text-muted-foreground">
                  {record.notes}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(record)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void remove(record)}
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
