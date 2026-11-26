"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BadgeCheck,
  ClipboardList,
  ExternalLink,
  FileText,
  Globe2,
  Inbox,
  Layers3,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";

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
};

function Field({ label, value, onChange, placeholder, multiline, hint, rows = 3 }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          className={`${textClass} min-h-20 resize-y`}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint && <span className="block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

type ListField<T> = { key: keyof T; label: string; multiline?: boolean };

function ObjectListEditor<T extends Record<string, unknown>>({
  items,
  fields,
  onChange,
  makeEmpty,
  addLabel = "Add item",
}: {
  items: T[];
  fields: ListField<T>[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  addLabel?: string;
}) {
  const update = (index: number, key: keyof T, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Nothing here yet. Add the first item below.
        </p>
      )}
      {items.map((item, index) => (
        <Card key={index} className="border-border/70">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {fields[0] ? String(item[fields[0].key] ?? "") || `Item ${index + 1}` : `Item ${index + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  aria-label="Move up"
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove item"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <Field
                  key={String(field.key)}
                  label={field.label}
                  value={String(item[field.key] ?? "")}
                  multiline={field.multiline}
                  onChange={(value) => update(index, field.key, value)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, makeEmpty()])}>
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
      hint={hint ?? "One entry per line"}
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

function VerticalsEditor({ items, onChange }: { items: SurveyVertical[]; onChange: (items: SurveyVertical[]) => void }) {
  const update = (index: number, patch: Partial<SurveyVertical>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((vertical, index) => (
        <Card key={`${vertical.slug ?? "vertical"}-${index}`} className="border-border/70">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {vertical.title || `Service ${index + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label="Move up" onClick={() => move(index, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove service" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" value={vertical.title} onChange={(value) => update(index, { title: value })} />
              <Field label="Tag" value={vertical.tag} onChange={(value) => update(index, { tag: value })} />
              <Field label="Icon (emoji)" value={vertical.icon ?? ""} onChange={(value) => update(index, { icon: value })} />
              <Field
                label="Summary"
                value={vertical.summary}
                multiline
                onChange={(value) => update(index, { summary: value })}
              />
            </div>
            <StringListEditor
              label="Services in this card"
              values={vertical.services}
              onChange={(values) => update(index, { services: values })}
              hint="One service per line — shown as bullets on the card"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={Boolean(vertical.hidden)}
                onChange={(event) => update(index, { hidden: event.target.checked })}
                className="h-4 w-4"
              />
              Hidden from the public survey page
            </label>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...items,
            { tag: "", title: "", summary: "", services: [], icon: "", hidden: false },
          ])
        }
      >
        <Plus className="h-4 w-4" /> Add service
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
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{enquiry.name}</p>
            <p className="text-xs text-muted-foreground">
              {enquiry.email} · {enquiry.organisation || "—"}
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">{new Date(enquiry.createdAt).toLocaleString()}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm">{enquiry.message}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Status</span>
            <select className={textClass} value={status} onChange={(event) => setStatus(event.target.value as SurveyEnquiryStatus)}>
              {SURVEY_ENQUIRY_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {SURVEY_ENQUIRY_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <Field label="Internal notes" value={notes} multiline onChange={setNotes} />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" disabled={busy} onClick={save}>
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
      <CardContent className="flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <p className="text-sm font-semibold">{surveyor.name}</p>
          <p className="text-xs text-muted-foreground">
            {surveyor.email} · {surveyor.role} · {surveyor.location || "no location"}
          </p>
        </div>
        <label className="space-y-1.5">
          <span className="block text-xs font-semibold text-muted-foreground">Status</span>
          <select className={textClass} value={status} onChange={(event) => setStatus(event.target.value as SurveyorStatus)}>
            {SURVEYOR_STATUSES.map((item) => (
              <option key={item} value={item}>
                {SURVEYOR_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" size="sm" disabled={busy || status === surveyor.status} onClick={save}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update
        </Button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  );
}

export default function SurveyAdmin() {
  const { session, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("brand");
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
                  { key: "value", label: "Value" },
                  { key: "label", label: "Label" },
                ]}
                makeEmpty={() => ({ value: "", label: "" })}
                addLabel="Add metric"
                onChange={(items) => mutate((d) => { d.hero.metrics = items; })}
              />
            </div>
          </div>
        );
      case "services":
        return (
          <VerticalsEditor
            items={content.verticals}
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
              { key: "step", label: "Step number" },
              { key: "title", label: "Title" },
              { key: "summary", label: "Summary", multiline: true },
            ]}
            makeEmpty={() => ({ step: "", title: "", summary: "" })}
            addLabel="Add step"
            onChange={(items) => mutate((d) => { d.approach = items; })}
          />
        );
      case "engagement":
        return (
          <ObjectListEditor<{ title: string; summary: string; bestFor: string }>
            items={content.engagement}
            fields={[
              { key: "title", label: "Title" },
              { key: "summary", label: "Summary", multiline: true },
              { key: "bestFor", label: "Best for", multiline: true },
            ]}
            makeEmpty={() => ({ title: "", summary: "", bestFor: "" })}
            addLabel="Add engagement model"
            onChange={(items) => mutate((d) => { d.engagement = items; })}
          />
        );
      case "projects":
        return (
          <ObjectListEditor<{ tag: string; title: string; desc: string }>
            items={content.sampleProjects}
            fields={[
              { key: "tag", label: "Tag" },
              { key: "title", label: "Title" },
              { key: "desc", label: "Description", multiline: true },
            ]}
            makeEmpty={() => ({ tag: "", title: "", desc: "" })}
            addLabel="Add sample project"
            onChange={(items) => mutate((d) => { d.sampleProjects = items; })}
          />
        );
      case "work":
        return (
          <ObjectListEditor<{ name: string; note: string }>
            items={content.previousWork}
            fields={[
              { key: "name", label: "Name" },
              { key: "note", label: "Note", multiline: true },
            ]}
            makeEmpty={() => ({ name: "", note: "" })}
            addLabel="Add previous work"
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
              { key: "q", label: "Question" },
              { key: "a", label: "Answer", multiline: true },
            ]}
            makeEmpty={() => ({ q: "", a: "" })}
            addLabel="Add FAQ"
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
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-bold">
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <span className="text-sm font-semibold">Survey</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Page content
          </p>
          {TABS.filter((item) => CONTENT_TABS.includes(item.key)).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                tab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
          <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Operations
          </p>
          {TABS.filter((item) => !CONTENT_TABS.includes(item.key)).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                tab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/survey"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          >
            View public page <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Survey &amp; Research</h1>
              {dirty && <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600">Unsaved</span>}
            </div>
            <p className="text-xs text-muted-foreground">{active.hint}</p>
          </div>
          <div className="flex items-center gap-2">
            {notice && <span className="hidden text-xs font-semibold text-emerald-600 sm:inline">{notice}</span>}
            {CONTENT_TABS.includes(tab) && (
              <Button type="button" size="sm" disabled={!dirty || saving} onClick={saveContent}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Publish changes
              </Button>
            )}
          </div>
        </header>

        {error && (
          <div className="mx-5 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive lg:mx-8">
            {error}
          </div>
        )}

        <main className="px-5 py-6 lg:px-8">
          {/* Mobile tab selector */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  tab === item.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{active.label}</CardTitle>
              <CardDescription>{active.hint}</CardDescription>
            </CardHeader>
            <CardContent>{renderTab()}</CardContent>
          </Card>

          {CONTENT_TABS.includes(tab) && (
            <p className="mt-4 text-xs text-muted-foreground">
              Changes go live on <Link href="/survey" className="underline">/survey</Link> only after you publish.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
