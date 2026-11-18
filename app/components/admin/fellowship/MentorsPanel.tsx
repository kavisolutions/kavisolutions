"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, Save, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonBody,
  jsonPatch,
  type FellowshipMentor,
} from "@/lib/fellowship-admin";

type MentorDraft = {
  name: string;
  email: string;
  phone: string;
  title: string;
  expertise: string;
  notes: string;
};

const EMPTY_DRAFT: MentorDraft = {
  name: "",
  email: "",
  phone: "",
  title: "",
  expertise: "",
  notes: "",
};

export default function MentorsPanel() {
  const [mentors, setMentors] = useState<FellowshipMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingID, setEditingID] = useState<string | null>(null);
  const [draft, setDraft] = useState<MentorDraft>(EMPTY_DRAFT);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest<{ mentors: FellowshipMentor[] }>(
        "/api/fellowship-mentors",
      );
      setMentors(data.mentors ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load mentors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditingID(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(true);
    setNotice("");
  };

  const openEdit = (mentor: FellowshipMentor) => {
    setEditingID(mentor.id);
    setDraft({
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      title: mentor.title,
      expertise: mentor.expertise,
      notes: mentor.notes,
    });
    setFormOpen(true);
    setNotice("");
  };

  const save = async () => {
    if (saving) return;
    if (!draft.name.trim() || !draft.email.trim()) {
      setError("Mentor name and email are required.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingID) {
        await adminRequest(`/api/fellowship-mentors/${editingID}`, jsonPatch(draft));
        setNotice("Mentor updated.");
      } else {
        await adminRequest("/api/fellowship-mentors", jsonBody(draft));
        setNotice("Mentor added.");
      }
      setFormOpen(false);
      setEditingID(null);
      setDraft(EMPTY_DRAFT);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the mentor.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (mentor: FellowshipMentor) => {
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-mentors/${mentor.id}`,
        jsonPatch({ status: mentor.status === "active" ? "inactive" : "active" }),
      );
      setNotice(
        mentor.status === "active"
          ? `${mentor.name} marked inactive.`
          : `${mentor.name} marked active.`,
      );
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the mentor.");
    }
  };

  const remove = async (mentor: FellowshipMentor) => {
    if (
      !window.confirm(
        `Delete ${mentor.name}? Existing interview scorecards stay, but the mentor is removed from future panels.`,
      )
    ) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/fellowship-mentors/${mentor.id}`, { method: "DELETE" });
      setNotice(`${mentor.name} removed.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the mentor.");
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
              <UserRound className="h-4 w-4 text-primary" />
              Mentors and interviewers
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Active mentors can be assigned to interview panels. Admin emails can also
              join a panel from the interviews tab.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add mentor
            </Button>
          </div>
        </CardHeader>

        {formOpen && (
          <CardContent className="border-t border-border">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </span>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="Interviewer name"
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
                  placeholder="mentor@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </span>
                <Input
                  value={draft.phone}
                  onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Role / title
                </span>
                <Input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="e.g. Product mentor"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Expertise
                </span>
                <Input
                  value={draft.expertise}
                  onChange={(event) => setDraft({ ...draft, expertise: event.target.value })}
                  placeholder="Product, design, fieldwork, research…"
                />
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
                  placeholder="Availability, tracks, panel preferences…"
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingID ? "Save mentor" : "Add mentor"}
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
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Loading mentors…" : `${mentors.length} mentor${mentors.length === 1 ? "" : "s"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!loading && mentors.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No mentors yet. Add the first interviewer to start scheduling panels.
            </p>
          )}
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{mentor.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {mentor.title || "Mentor"} · {mentor.email}
                    {mentor.phone ? ` · ${mentor.phone}` : ""}
                  </p>
                  {mentor.expertise && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {mentor.expertise}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-medium ${
                    mentor.status === "active"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {mentor.status}
                </span>
              </div>
              {mentor.notes && (
                <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                  {mentor.notes}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(mentor)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => void toggleStatus(mentor)}>
                  {mentor.status === "active" ? "Mark inactive" : "Mark active"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void remove(mentor)}
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
