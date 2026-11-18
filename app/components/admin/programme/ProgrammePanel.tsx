"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminRequest, jsonBody, jsonPatch } from "@/lib/fellowship-admin";
import {
  formatMoney,
  formatProgrammeDate,
  programmeStatusTone,
  type ProgrammeApplicationOption,
  type ProgrammeCollegeOption,
  type ProgrammeField,
  type ProgrammeResource,
} from "@/lib/programme-admin";

type Row = Record<string, unknown>;
type Draft = Record<string, string | boolean>;

const dateInput = (value: unknown): string => {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const initialDraft = (resource: ProgrammeResource): Draft => {
  const draft: Draft = {};
  for (const field of resource.fields) {
    if (field.readOnly) continue;
    if (field.kind === "checkbox") draft[field.key] = false;
    else if (field.kind === "select") draft[field.key] = field.options?.[0]?.value ?? "";
    else draft[field.key] = "";
  }
  return draft;
};

const rowDraft = (resource: ProgrammeResource, row: Row): Draft => {
  const draft: Draft = {};
  for (const field of resource.fields) {
    if (field.readOnly) continue;
    if (field.kind === "checkbox") draft[field.key] = Boolean(row[field.key]);
    else if (field.kind === "date") draft[field.key] = dateInput(row[field.key]);
    else draft[field.key] = String(row[field.key] ?? "");
  }
  return draft;
};

const isMoneyKey = (key: string) => /amount|value/i.test(key);

function FieldInput({
  field,
  value,
  applications,
  colleges,
  onChange,
}: {
  field: ProgrammeField;
  value: string | boolean;
  applications: ProgrammeApplicationOption[];
  colleges: ProgrammeCollegeOption[];
  onChange: (value: string | boolean) => void;
}) {
  const className =
    "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (field.kind === "checkbox") {
    return (
      <label className="flex h-10 items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        {field.label}
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.kind === "application") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        <option value="">No linked application</option>
        {applications.map((application) => (
          <option key={application.id} value={application.id}>
            {application.name} · {application.reference}
          </option>
        ))}
      </select>
    );
  }

  if (field.kind === "college") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        <option value="">No linked college</option>
        {colleges.map((college) => (
          <option key={college.id} value={college.id}>
            {college.name}
          </option>
        ))}
      </select>
    );
  }

  if (field.kind === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={field.placeholder}
        className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  if (field.kind === "date") {
    return (
      <Input
        type="date"
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.kind === "number") {
    return (
      <Input
        type="number"
        min={0}
        value={String(value ?? "")}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      value={String(value ?? "")}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function ProgrammePanel({
  resource,
  applications,
  colleges,
  refreshKey = 0,
}: {
  resource: ProgrammeResource;
  applications: ProgrammeApplicationOption[];
  colleges: ProgrammeCollegeOption[];
  refreshKey?: number;
}) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => initialDraft(resource));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest<{ items: Row[] }>(resource.endpoint);
      setItems(data.items ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load records.");
    } finally {
      setLoading(false);
    }
  }, [resource.endpoint]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;
    return items.filter((row) =>
      Object.values(row).some((value) =>
        typeof value === "string" ? value.toLowerCase().includes(search) : false,
      ),
    );
  }, [items, query]);

  const columns = useMemo(
    () => resource.fields.filter((field) => field.table).slice(0, 8),
    [resource.fields],
  );

  const startCreate = () => {
    setEditingId(null);
    setDraft(initialDraft(resource));
    setFormOpen(true);
    setError("");
    setNotice("");
  };

  const startEdit = (row: Row) => {
    setEditingId(String(row.id));
    setDraft(rowDraft(resource, row));
    setFormOpen(true);
    setError("");
    setNotice("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload: Record<string, unknown> = {};
      for (const field of resource.fields) {
        if (field.readOnly) continue;
        const value = draft[field.key];
        if (field.kind === "number") payload[field.key] = Number(value || 0);
        else if (field.kind === "checkbox") payload[field.key] = Boolean(value);
        else payload[field.key] = value;
      }
      if (editingId) {
        await adminRequest(`${resource.endpoint}/${editingId}`, jsonPatch(payload));
        setNotice(`${resource.singular} updated.`);
      } else {
        await adminRequest(resource.endpoint, jsonBody(payload));
        setNotice(`${resource.singular} created.`);
      }
      setFormOpen(false);
      setEditingId(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the record.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete this ${resource.singular.toLowerCase()}?`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`${resource.endpoint}/${String(row.id)}`, { method: "DELETE" });
      setNotice(`${resource.singular} deleted.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the record.");
    }
  };

  const cell = (row: Row, field: ProgrammeField) => {
    if (field.kind === "application") {
      return String(row.applicationName ?? row.applicationId ?? "—") || "—";
    }
    if (field.kind === "college") {
      return String(row.collegeName ?? row.collegeId ?? "—") || "—";
    }
    if (field.kind === "date") return formatProgrammeDate(row[field.key]);
    if (field.kind === "checkbox") return row[field.key] ? "Yes" : "No";
    if (field.kind === "number") {
      return isMoneyKey(field.key)
        ? formatMoney(row[field.key])
        : String(row[field.key] ?? 0);
    }
    if (field.key === "status" || field.key === "stage" || field.key === "priority" || field.key === "paymentStatus") {
      const value = String(row[field.key] ?? "");
      return (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${programmeStatusTone(value)}`}
        >
          {value.replace(/_/g, " ")}
        </span>
      );
    }
    const value = String(row[field.key] ?? "");
    return value.length > 70 ? `${value.slice(0, 70)}…` : value || "—";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{resource.label}</CardTitle>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            {resource.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New {resource.singular.toLowerCase()}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${resource.label.toLowerCase()}`}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {items.length}
          </span>
        </div>

        {formOpen && (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {editingId ? `Edit ${resource.singular.toLowerCase()}` : `New ${resource.singular.toLowerCase()}`}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {resource.fields.filter((field) => !field.readOnly).map((field) => (
                <label
                  key={field.key}
                  className={`block ${field.wide || field.kind === "textarea" ? "sm:col-span-2" : ""}`}
                >
                  {field.kind !== "checkbox" && (
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {field.label}
                      {field.required ? " *" : ""}
                    </span>
                  )}
                  <FieldInput
                    field={field}
                    value={draft[field.key] ?? ""}
                    applications={applications}
                    colleges={colleges}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, [field.key]: value }))
                    }
                  />
                  {field.help && (
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      {field.help}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => void save()} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save changes" : `Create ${resource.singular.toLowerCase()}`}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading {resource.label.toLowerCase()}…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No {resource.label.toLowerCase()} yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  {columns.map((field) => (
                    <th key={field.key} className="px-3 py-2 font-semibold">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={String(row.id)} className="border-t border-border/70">
                    {columns.map((field) => (
                      <td key={field.key} className="max-w-[280px] px-3 py-2 align-top">
                        {cell(row, field)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => void remove(row)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
