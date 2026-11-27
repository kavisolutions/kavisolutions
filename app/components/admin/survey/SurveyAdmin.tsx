"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Inbox,
  Info,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { AdminShell } from "@/components/admin/shared/AdminShell";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/lib/auth-context";
import {
  EMPTY_SURVEY_CONTENT,
  isSurveyContent,
  withSurveyVerticalCount,
  type SurveyContent,
  type SurveyMetric,
  type SurveyVertical,
} from "@/lib/survey-content";
import {
  SURVEY_ENQUIRY_STATUSES,
  SURVEY_ENQUIRY_STATUS_LABELS,
  type SurveyEnquiry,
  type SurveyEnquiryStatus,
} from "@/lib/survey-enquiries";
import {
  SURVEYOR_STATUSES,
  SURVEYOR_STATUS_LABELS,
  type Surveyor,
  type SurveyorStatus,
} from "@/lib/surveyors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Content = SurveyContent & Record<string, unknown>;

type TabKey =
  | "brand"
  | "hero"
  | "services"
  | "network"
  | "approach"
  | "engagement"
  | "projects"
  | "work"
  | "sectors"
  | "faqs"
  | "leads"
  | "surveyors"
  | "enquiries";

const TABS: { key: TabKey; label: string; icon: LucideIcon; hint: string }[] = [
  { key: "brand", label: "Brand & contact", icon: Globe2, hint: "Footer identity and public contact" },
  { key: "hero", label: "Hero & metrics", icon: Sparkles, hint: "Headline, intro and four metric tiles" },
  { key: "services", label: "Services", icon: Layers3, hint: "Research vertical cards on the survey page" },
  { key: "network", label: "Field network", icon: Users, hint: "Surveyor network section" },
  { key: "approach", label: "Approach", icon: ClipboardList, hint: "Step-by-step delivery process" },
  { key: "engagement", label: "Engagement models", icon: BadgeCheck, hint: "The five ways clients can work with us" },
  { key: "projects", label: "Sample projects", icon: FileText, hint: "Example project cards" },
  { key: "work", label: "Previous work", icon: FileText, hint: "Past assignments and notes" },
  { key: "sectors", label: "Sectors", icon: BarChart3, hint: "Industries we work across" },
  { key: "faqs", label: "FAQs", icon: Inbox, hint: "Questions and answers on the page" },
  { key: "leads", label: "Internal leads", icon: Inbox, hint: "Confidential connections — never published" },
  { key: "surveyors", label: "Surveyors", icon: Users, hint: "Field surveyor registry" },
  { key: "enquiries", label: "Enquiries", icon: Inbox, hint: "Client messages from the form" },
];

const CONTENT_TABS: TabKey[] = [
  "brand",
  "hero",
  "services",
  "network",
  "approach",
  "engagement",
  "projects",
  "work",
  "sectors",
  "faqs",
];

const SERVICE_ICONS = ["🧭", "📊", "📋", "🔍", "📈", "🌍", "⚖️", "🎯", "💡", "🗳️", "🧪", "📚"];

const CARD_TILES = [
  "border-teal-500/20 from-teal-500/20 to-emerald-500/10 text-teal-500",
  "border-violet-500/20 from-violet-500/20 to-indigo-500/10 text-violet-500",
  "border-amber-500/20 from-amber-500/20 to-orange-500/10 text-amber-500",
  "border-emerald-500/20 from-emerald-500/20 to-green-500/10 text-emerald-500",
  "border-yellow-500/20 from-yellow-500/20 to-amber-500/10 text-yellow-500",
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const withCookies = (extra: RequestInit = {}): RequestInit => ({ credentials: "include", ...extra });
const textClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
  rows?: number;
  maxLength?: number;
};

function Field({ label, value, onChange, placeholder, multiline, hint, rows = 3, maxLength }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        {label}
      </span>
      <span className="relative block">
        {multiline ? (
          <Textarea
            className={`${textClass} min-h-20 resize-y pb-6`}
            value={value}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <Input
            value={value}
            maxLength={maxLength}
            className={maxLength ? "pr-14" : undefined}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {maxLength !== undefined && (
          <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] tabular-nums text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      {hint && <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

type ListField<T> = { key: keyof T; label: string; multiline?: boolean; maxLength?: number };

function ObjectListEditor<T extends Record<string, unknown>>({
  items,
  fields,
  onChange,
  makeEmpty,
  addLabel = "Add item",
  singular = "Item",
  onEditingChange,
}: {
  items: T[];
  fields: ListField<T>[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  addLabel?: string;
  singular?: string;
  onEditingChange?: (label: string | null) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);

  const notify = (index: number | null) => onEditingChange?.(index === null ? null : `Edit ${singular}`);
  const update = (index: number, key: keyof T, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const stopEditing = () => {
    setEditing(null);
    notify(null);
  };

  const remove = (index: number) => {
    const title = fields[1] ? String(items[index]?.[fields[1].key] ?? "") : "";
    if (!window.confirm(`Remove “${title || `${singular} ${index + 1}`}”?`)) return;
    stopEditing();
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    stopEditing();
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    setEditing(items.length);
    notify(items.length);
    onChange([...items, makeEmpty()]);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Nothing here yet. Add the first {singular.toLowerCase()} below.
        </p>
      )}
      {items.map((item, index) => {
        const badge = fields[0] ? String(item[fields[0].key] ?? "") || singular : `${singular} ${index + 1}`;
        const title = fields[1] ? String(item[fields[1].key] ?? "") || `${singular} ${index + 1}` : badge;
        const summary = fields
          .slice(1)
          .map((field) => String(item[field.key] ?? ""))
          .filter(Boolean)
          .join(" · ");

        return (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br text-lg font-bold ${
                  CARD_TILES[index % CARD_TILES.length]
                }`}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-400">
                    {badge}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Position {index + 1} of {items.length}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-base font-semibold">{title}</h3>
                {summary && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1 self-start">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full border border-border"
                  disabled={index === 0}
                  aria-label="Move up"
                  title="Move up"
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full border border-border"
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  title="Move down"
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                {editing !== index && (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-blue-500/90 text-white hover:bg-blue-500"
                      aria-label={`Edit ${singular}`}
                      title="Edit"
                      onClick={() => {
                        setEditing(index);
                        notify(index);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label={`Delete ${singular}`}
                      title="Delete"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {editing === index && (
              <div className="space-y-4 border-t border-border bg-muted/20 px-5 py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {fields.map((field) => (
                    <Field
                      key={String(field.key)}
                      label={field.label}
                      value={String(item[field.key] ?? "")}
                      multiline={field.multiline}
                      maxLength={field.maxLength}
                      onChange={(value) => update(index, field.key, value)}
                    />
                  ))}
                </div>
                <Button type="button" size="sm" onClick={stopEditing}>
                  <Check className="h-4 w-4" /> Done
                </Button>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" className="w-full border-dashed py-5" onClick={add}>
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}

function StringListEditor({
  label,
  values,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(values.join("\n"));
  // Re-sync when a different content revision is loaded or reset.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(values.join("\n"));
  }, [values]);

  return (
    <Field
      label={label}
      value={text}
      multiline
      rows={6}
      hint={`${hint ?? "One entry per line"} · ${values.length} ${values.length === 1 ? "item" : "items"}`}
      placeholder={placeholder}
      onChange={(next) => {
        setText(next);
        onChange(
          next
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

function VerticalsEditor({
  items,
  onChange,
  onEditingChange,
}: {
  items: SurveyVertical[];
  onChange: (items: SurveyVertical[]) => void;
  onEditingChange?: (label: string | null) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);

  const notify = (index: number | null) => onEditingChange?.(index === null ? null : "Edit Service");
  const update = (index: number, patch: Partial<SurveyVertical>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const stopEditing = () => {
    setEditing(null);
    notify(null);
  };

  const remove = (index: number) => {
    const title = items[index]?.title || `Service ${index + 1}`;
    if (!window.confirm(`Remove “${title}” from the survey services?`)) return;
    stopEditing();
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    stopEditing();
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    setEditing(items.length);
    notify(items.length);
    onChange([...items, { tag: "", title: "", summary: "", services: [], icon: "", hidden: false }]);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Cards appear on the public survey page in this order. Use the arrows to reorder, the pencil to
        edit, and the bin to remove.
      </p>

      {items.map((vertical, index) => (
        <div
          key={`${vertical.slug ?? "vertical"}-${index}`}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br text-2xl ${
                CARD_TILES[index % CARD_TILES.length]
              }`}
            >
              {vertical.icon || "🧭"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-400">
                  {vertical.tag || "Service"}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    vertical.hidden
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {vertical.hidden ? "Hidden" : "Live"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Position {index + 1} of {items.length}
                </span>
              </div>
              <h3 className="mt-1 truncate text-base font-semibold">{vertical.title || "Untitled service"}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {vertical.summary || "No summary yet — click edit to add one."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {vertical.services.slice(0, 4).map((service, serviceIndex) => (
                  <span
                    key={`${service}-${serviceIndex}`}
                    className="rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    {service}
                  </span>
                ))}
                {vertical.services.length > 4 && (
                  <span className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">
                    +{vertical.services.length - 4} more
                  </span>
                )}
                {vertical.services.length === 0 && (
                  <span className="text-[11px] text-muted-foreground">No service points yet</span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 self-start">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-border"
                disabled={index === 0}
                aria-label={`Move ${vertical.title || "service"} up`}
                title="Move up"
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-border"
                disabled={index === items.length - 1}
                aria-label={`Move ${vertical.title || "service"} down`}
                title="Move down"
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              {editing !== index && (
                <>
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-blue-500/90 text-white hover:bg-blue-500"
                    aria-label={`Edit ${vertical.title || "service"}`}
                    title="Edit"
                    onClick={() => {
                      setEditing(index);
                      notify(index);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label={`Delete ${vertical.title || "service"}`}
                    title="Delete"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {editing === index && (
            <div className="space-y-4 border-t border-border bg-muted/20 px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Title"
                  value={vertical.title}
                  maxLength={100}
                  onChange={(value) => update(index, { title: value })}
                />
                <Field
                  label="Tag"
                  value={vertical.tag}
                  maxLength={50}
                  onChange={(value) => update(index, { tag: value })}
                />
                <label className="block space-y-1.5">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    Icon (emoji)
                  </span>
                  <Select
                    value={vertical.icon && SERVICE_ICONS.includes(vertical.icon) ? vertical.icon : undefined}
                    onValueChange={(value) => update(index, { icon: value })}
                  >
                    <SelectTrigger className="max-w-56">
                      <SelectValue placeholder="Select Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <Field
                  label="Summary"
                  value={vertical.summary}
                  multiline
                  maxLength={300}
                  onChange={(value) => update(index, { summary: value })}
                />
              </div>
              <StringListEditor
                label="Service points"
                values={vertical.services}
                onChange={(values) => update(index, { services: values })}
                hint="One service per line — shown as bullets on the public card"
              />
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Visible on the public page</p>
                    <p className="text-[11px] text-muted-foreground">
                      Hidden cards stay here but are removed from the page and enquiry form.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!vertical.hidden}
                  onCheckedChange={(checked) => update(index, { hidden: !checked })}
                  aria-label="Visible on the public page"
                />
              </div>
              <Button type="button" size="sm" onClick={stopEditing}>
                <Check className="h-4 w-4" /> Done
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" className="w-full border-dashed py-5" onClick={add}>
        <Plus className="h-4 w-4" /> Add service card
      </Button>
    </div>
  );
}

function EnquiryRow({ enquiry, onSaved }: { enquiry: SurveyEnquiry; onSaved: () => void }) {
  const [status, setStatus] = useState<SurveyEnquiryStatus>(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/survey/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        setError(apiErrorMessage(await res.json().catch(() => null), "Could not save enquiry"));
        return;
      }
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/70">
      <CardHeader className="flex-row items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/15 text-blue-400">
          <Users className="h-5 w-5" />
        </span>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-bold text-white">
          1
        </span>
        <CardTitle className="text-base">Client enquiries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> From
            </span>
            <div className="flex min-h-24 gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{enquiry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {enquiry.email} · {enquiry.organisation || "—"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{enquiry.message}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Received At
            </span>
            <div className="flex min-h-24 items-center rounded-xl border border-border bg-muted/20 px-4 text-sm">
              {new Date(enquiry.createdAt).toLocaleString("en-IN")}
            </div>
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Status
            </span>
            <Select value={status} onValueChange={(value) => setStatus(value as SurveyEnquiryStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {SURVEY_ENQUIRY_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {SURVEY_ENQUIRY_STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Field
            label="Internal notes"
            value={notes}
            multiline
            maxLength={500}
            placeholder="Add any notes about this enquiry..."
            onChange={setNotes}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-indigo-500"
            disabled={busy}
            onClick={save}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save enquiry
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function SurveyorRow({ surveyor, onChanged }: { surveyor: Surveyor; onChanged: () => void }) {
  const [status, setStatus] = useState<SurveyorStatus>(surveyor.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/surveyors/${surveyor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError(apiErrorMessage(await res.json().catch(() => null), "Could not update status"));
        return;
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/70">
      <CardHeader className="flex-row items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/15 text-blue-400">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-base">{surveyor.name}</CardTitle>
          <CardDescription className="truncate text-xs">
            {surveyor.email} · {surveyor.role} · {surveyor.location || "no location"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Status
          </span>
          <Select value={status} onValueChange={(value) => setStatus(value as SurveyorStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {SURVEYOR_STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {SURVEYOR_STATUS_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Coverage
          </span>
          <div className="flex min-h-10 items-center rounded-xl border border-border bg-muted/20 px-4 text-sm text-muted-foreground">
            {surveyor.coverage.length ? surveyor.coverage.join(" · ") : "No coverage areas yet"}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button
            type="button"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-indigo-500"
            disabled={busy || status === surveyor.status}
            onClick={save}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update status
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SurveyAdmin() {
  const { session, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("brand");
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [savedContent, setSavedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [enquiries, setEnquiries] = useState<SurveyEnquiry[]>([]);
  const [leadsText, setLeadsText] = useState("");
  const [savingLeads, setSavingLeads] = useState(false);

  const mutate = useCallback((fn: (draft: Content) => void) => {
    setContent((previous) => {
      if (!previous) return previous;
      const next = clone(previous);
      fn(next);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    const [meRes, contentRes, surveyorsRes, enquiriesRes, settingsRes] = await Promise.all([
      fetch("/api/me", withCookies()),
      fetch("/api/survey/content", withCookies()),
      fetch("/api/surveyors", withCookies()),
      fetch("/api/survey/enquiries", withCookies()),
      fetch("/api/settings", withCookies()),
    ]);

    const me = await meRes.json().catch(() => null);
    if (!me?.isAdmin) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const [contentData, surveyorsData, enquiriesData, settingsData] = await Promise.all([
      contentRes.json().catch(() => null),
      surveyorsRes.json().catch(() => null),
      enquiriesRes.json().catch(() => null),
      settingsRes.json().catch(() => null),
    ]);

    const next: Content = isSurveyContent(contentData?.content)
      ? (contentData.content as Content)
      : (clone(EMPTY_SURVEY_CONTENT) as Content);
    setContent(next);
    setSavedContent(JSON.stringify(next));
    setSurveyors(surveyorsData?.surveyors ?? []);
    setEnquiries(enquiriesData?.enquiries ?? []);
    setLeadsText(settingsData?.settings?.surveyOpportunities ?? "");
    setIsAdmin(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    void load().catch(() => {
      setIsAdmin(false);
      setLoading(false);
    });
  }, [authLoading, session, load]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested && TABS.some((item) => item.key === requested)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore tab from URL after hydration
      setTab(requested as TabKey);
    }
  }, []);

  const selectTab = (key: string) => {
    if (!TABS.some((item) => item.key === key)) return;
    const tabKey = key as TabKey;
    setTab(tabKey);
    setEditingLabel(null);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabKey);
    window.history.replaceState(null, "", url.toString());
  };

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const saveContent = async () => {
    if (!content || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/survey/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        setError(apiErrorMessage(await res.json().catch(() => null), "Could not publish survey content"));
        return;
      }
      const data = await res.json().catch(() => null);
      const next = (data?.content ?? content) as Content;
      setContent(next);
      setSavedContent(JSON.stringify(next));
      setNotice("Published. /survey reads the new content on its next request.");
    } finally {
      setSaving(false);
    }
  };

  const saveLeads = async () => {
    setSavingLeads(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ surveyOpportunities: leadsText }),
      });
      if (!res.ok) {
        setError(apiErrorMessage(await res.json().catch(() => null), "Could not save internal leads"));
        return;
      }
      setNotice("Internal leads saved — they stay out of the public page.");
    } finally {
      setSavingLeads(false);
    }
  };

  if (loading || isAdmin === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
            <CardDescription>Sign in with an administrator account to edit survey content.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Link href="/login?next=/admin/survey" className="text-sm font-semibold text-primary underline">
              Sign in
            </Link>
            <Link href="/" className="text-sm font-semibold text-muted-foreground underline">
              Back to site
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const active = TABS.find((item) => item.key === tab) ?? TABS[0];
  const dirty = Boolean(content && JSON.stringify(content) !== savedContent);
  const newEnquiryCount = enquiries.filter((item) => item.status === "new").length;

  const renderTab = (): ReactNode => {
    if (!content) return null;
    switch (tab) {
      case "brand":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name" value={content.brand.name} onChange={(value) => mutate((d) => { d.brand.name = value; })} />
            <Field label="Vertical" value={content.brand.vertical} onChange={(value) => mutate((d) => { d.brand.vertical = value; })} />
            <Field label="Contact name" value={content.brand.contactName} onChange={(value) => mutate((d) => { d.brand.contactName = value; })} />
            <Field label="Contact email" value={content.brand.contactEmail} onChange={(value) => mutate((d) => { d.brand.contactEmail = value; })} />
            <Field label="Location" value={content.brand.location} onChange={(value) => mutate((d) => { d.brand.location = value; })} />
          </div>
        );
      case "hero":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => mutate((d) => { d.hero.eyebrow = value; })} />
              <Field label="Highlight phrase" value={content.hero.highlight} onChange={(value) => mutate((d) => { d.hero.highlight = value; })} />
              <Field label="Headline" value={content.hero.title} multiline onChange={(value) => mutate((d) => { d.hero.title = value; })} />
              <Field label="Description" value={content.hero.description} multiline onChange={(value) => mutate((d) => { d.hero.description = value; })} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Metric tiles</h3>
              <ObjectListEditor<SurveyMetric>
                items={content.hero.metrics}
                fields={[
                  { key: "value", label: "Value", maxLength: 20 },
                  { key: "label", label: "Label", maxLength: 80 },
                ]}
                makeEmpty={() => ({ value: "", label: "" })}
                addLabel="Add metric"
                singular="Metric"
                onEditingChange={setEditingLabel}
                onChange={(items) => mutate((d) => { d.hero.metrics = items; })}
              />
            </div>
          </div>
        );
      case "services":
        return (
          <VerticalsEditor
            items={content.verticals}
            onEditingChange={setEditingLabel}
            onChange={(items) => mutate((d) => {
              d.verticals = items;
              const updated = withSurveyVerticalCount(d as SurveyContent);
              d.hero.metrics = updated.hero.metrics;
            })}
          />
        );
      case "network":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow" value={content.network.eyebrow} onChange={(value) => mutate((d) => { d.network.eyebrow = value; })} />
              <Field label="Title" value={content.network.title} onChange={(value) => mutate((d) => { d.network.title = value; })} />
              <Field label="Description" value={content.network.description} multiline onChange={(value) => mutate((d) => { d.network.description = value; })} />
              <Field label="Objective" value={content.network.objective} multiline onChange={(value) => mutate((d) => { d.network.objective = value; })} />
            </div>
            <StringListEditor
              label="What we are building"
              values={content.network.requirements}
              onChange={(values) => mutate((d) => { d.network.requirements = values; })}
            />
          </div>
        );
      case "approach":
        return (
          <ObjectListEditor<{ step: string; title: string; summary: string }>
            items={content.approach}
            fields={[
              { key: "step", label: "Step number", maxLength: 10 },
              { key: "title", label: "Title", maxLength: 100 },
              { key: "summary", label: "Summary", multiline: true, maxLength: 300 },
            ]}
            makeEmpty={() => ({ step: "", title: "", summary: "" })}
            addLabel="Add step"
            singular="Step"
            onEditingChange={setEditingLabel}
            onChange={(items) => mutate((d) => { d.approach = items; })}
          />
        );
      case "engagement":
        return (
          <ObjectListEditor<{ title: string; summary: string; bestFor: string }>
            items={content.engagement}
            fields={[
              { key: "title", label: "Title", maxLength: 100 },
              { key: "summary", label: "Summary", multiline: true, maxLength: 300 },
              { key: "bestFor", label: "Best for", multiline: true, maxLength: 200 },
            ]}
            makeEmpty={() => ({ title: "", summary: "", bestFor: "" })}
            addLabel="Add engagement model"
            singular="Engagement model"
            onEditingChange={setEditingLabel}
            onChange={(items) => mutate((d) => { d.engagement = items; })}
          />
        );
      case "projects":
        return (
          <ObjectListEditor<{ tag: string; title: string; desc: string }>
            items={content.sampleProjects}
            fields={[
              { key: "tag", label: "Tag", maxLength: 50 },
              { key: "title", label: "Title", maxLength: 100 },
              { key: "desc", label: "Description", multiline: true, maxLength: 300 },
            ]}
            makeEmpty={() => ({ tag: "", title: "", desc: "" })}
            addLabel="Add sample project"
            singular="Sample project"
            onEditingChange={setEditingLabel}
            onChange={(items) => mutate((d) => { d.sampleProjects = items; })}
          />
        );
      case "work":
        return (
          <ObjectListEditor<{ name: string; note: string }>
            items={content.previousWork}
            fields={[
              { key: "name", label: "Name", maxLength: 100 },
              { key: "note", label: "Note", multiline: true, maxLength: 300 },
            ]}
            makeEmpty={() => ({ name: "", note: "" })}
            addLabel="Add previous work"
            singular="Previous work"
            onEditingChange={setEditingLabel}
            onChange={(items) => mutate((d) => { d.previousWork = items; })}
          />
        );
      case "sectors":
        return (
          <StringListEditor
            label="Sectors"
            values={content.sectors}
            onChange={(values) => mutate((d) => { d.sectors = values; })}
            hint="One sector per line"
          />
        );
      case "faqs":
        return (
          <ObjectListEditor<{ q: string; a: string }>
            items={content.faqs}
            fields={[
              { key: "q", label: "Question", maxLength: 200 },
              { key: "a", label: "Answer", multiline: true, maxLength: 600 },
            ]}
            makeEmpty={() => ({ q: "", a: "" })}
            addLabel="Add FAQ"
            singular="FAQ"
            onEditingChange={setEditingLabel}
            onChange={(items) => mutate((d) => { d.faqs = items; })}
          />
        );
      case "leads":
        return (
          <div className="space-y-4">
            <Field
              label="Internal leads (private)"
              value={leadsText}
              multiline
              rows={10}
              placeholder="Name | short note"
              hint="One lead per line, using a pipe between the name and note. These are admin-only and never appear on the public page."
              onChange={setLeadsText}
            />
            <Button type="button" size="sm" disabled={savingLeads} onClick={saveLeads}>
              {savingLeads ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save internal leads
            </Button>
          </div>
        );
      case "surveyors":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{surveyors.length} surveyor profiles</p>
              <Link href="/admin?section=surveyors" className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline">
                Full editor <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            {surveyors.length === 0 && <p className="text-sm text-muted-foreground">No surveyors registered yet.</p>}
            {surveyors.map((surveyor) => (
              <SurveyorRow key={surveyor.id} surveyor={surveyor} onChanged={() => void load()} />
            ))}
          </div>
        );
      case "enquiries":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{enquiries.length} client enquiries</p>
            {enquiries.length === 0 && <p className="text-sm text-muted-foreground">No enquiries yet.</p>}
            {enquiries.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} onSaved={() => void load()} />
            ))}
          </div>
        );
    }
  };

  return (
    <AdminShell
      title="Survey & Research"
      subtitle={active.hint}
      headerIcon={active.icon}
      pill={editingLabel ? "Edit Mode" : "Content Management"}
      bannerTitle={editingLabel ? `${editingLabel} Details` : active.label}
      bannerDescription={
        editingLabel
          ? "Update the information below to keep your content accurate and up to date."
          : active.hint
      }
      bannerIcon={editingLabel ? Info : active.icon}
      groups={[
        {
          label: "Page content",
          items: TABS.filter((item) => CONTENT_TABS.includes(item.key)).map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
          })),
        },
        {
          label: "Operations",
          items: TABS.filter((item) => !CONTENT_TABS.includes(item.key)).map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            count: item.key === "enquiries" ? newEnquiryCount : undefined,
          })),
        },
      ]}
      activeKey={tab}
      onNavigate={selectTab}
      liveHref="/survey"
      notice={notice}
      error={error}
      notificationCount={newEnquiryCount}
      onNotifications={() => selectTab("enquiries")}
      publishLabel="Push Changes"
      onPublish={CONTENT_TABS.includes(tab) ? saveContent : undefined}
      publishDisabled={!dirty}
      publishBusy={saving}
      actions={
        dirty ? (
          <span className="hidden rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 sm:inline">
            Unsaved
          </span>
        ) : undefined
      }
    >
          {/* Mobile tab selector */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => selectTab(item.key)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  tab === item.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            {renderTab()}
          </section>

          {CONTENT_TABS.includes(tab) && (
            <p className="mt-4 text-xs text-muted-foreground">
              Changes go live on <Link href="/survey" className="underline">/survey</Link> only after you publish.
            </p>
          )}
    </AdminShell>
  );
}
