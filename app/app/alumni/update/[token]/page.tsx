"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupportEmail } from "@/lib/support-email";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, Save } from "lucide-react";

type Alumni = {
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
  publicStory: string;
  storyPublished: boolean;
};

const DESTINATIONS = [
  ["", "Not recorded"],
  ["job", "Employment"],
  ["freelance", "Freelance / consulting"],
  ["venture", "Founded a venture"],
  ["further_study", "Further study"],
  ["fellowship", "Another fellowship"],
  ["other", "Other"],
] as const;

export default function AlumniUpdatePage() {
  const supportEmail = useSupportEmail();
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [draft, setDraft] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-alumni/token/${token}`);
      const payload = (await response.json().catch(() => null)) as
        | { alumni?: Alumni; message?: string }
        | null;
      if (!response.ok || !payload?.alumni) {
        throw new Error(payload?.message ?? "This alumni link is invalid.");
      }
      setDraft(payload.alumni);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the record.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !draft || saving) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/fellowship-alumni/token/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationType: draft.destinationType,
          organisation: draft.organisation,
          role: draft.role,
          outcome6m: draft.outcome6m,
          outcome12m: draft.outcome12m,
          mentorWilling: draft.mentorWilling,
          testimonialConsent: draft.testimonialConsent,
          publicStory: draft.publicStory,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { alumni?: Alumni; message?: string }
        | null;
      if (!response.ok || !payload?.alumni) {
        throw new Error(payload?.message ?? "Could not save the update.");
      }
      setDraft({ ...draft, ...payload.alumni });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] text-[#F7F9FC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#91B4FF]" />
      </main>
    );
  }

  if (error && !draft) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] px-5 py-12 text-[#F7F9FC]">
        <div className="w-full max-w-md rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-7 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · ALUMNI
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Update link unavailable
          </h1>
          <p className="mt-3 text-sm text-[#A5B3C7]">{error}</p>
        </div>
      </main>
    );
  }

  if (!draft) return null;

  return (
    <main className="min-h-screen bg-[#06060F] px-5 py-10 text-[#F7F9FC]">
      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={save}
          className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 sm:p-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · ALUMNI UPDATE
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {draft.name}
          </h1>
          <p className="mt-1 text-sm text-[#A5B3C7]">
            {draft.track || "Fellowship"} · {draft.cohort || "Cohort not recorded"}
          </p>
          <p className="mt-1 text-xs text-[#7889A0]">{draft.email}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Current destination
              </span>
              <select
                value={draft.destinationType}
                onChange={(event) =>
                  setDraft({ ...draft, destinationType: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 text-xs text-[#F7F9FC]"
              >
                {DESTINATIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Organisation
              </span>
              <input
                value={draft.organisation}
                onChange={(event) =>
                  setDraft({ ...draft, organisation: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 text-xs text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Role / work
              </span>
              <input
                value={draft.role}
                onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 text-xs text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Six-month update
              </span>
              <textarea
                value={draft.outcome6m}
                onChange={(event) =>
                  setDraft({ ...draft, outcome6m: event.target.value })
                }
                rows={2}
                className="mt-1 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 py-2 text-xs text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Twelve-month update
              </span>
              <textarea
                value={draft.outcome12m}
                onChange={(event) =>
                  setDraft({ ...draft, outcome12m: event.target.value })
                }
                rows={2}
                className="mt-1 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 py-2 text-xs text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[rgba(148,163,184,0.24)] px-3 py-2 text-[11px]">
              <input
                type="checkbox"
                checked={draft.mentorWilling}
                onChange={(event) =>
                  setDraft({ ...draft, mentorWilling: event.target.checked })
                }
              />
              I am willing to mentor or speak
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[rgba(148,163,184,0.24)] px-3 py-2 text-[11px]">
              <input
                type="checkbox"
                checked={draft.testimonialConsent}
                onChange={(event) =>
                  setDraft({ ...draft, testimonialConsent: event.target.checked })
                }
              />
              I consent to a public story
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                Public story (optional)
              </span>
              <textarea
                value={draft.publicStory}
                onChange={(event) =>
                  setDraft({ ...draft, publicStory: event.target.value })
                }
                rows={4}
                className="mt-1 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.24)] bg-[#0B1220] px-3 py-2 text-xs text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                placeholder="What changed for you? The team reviews stories before publishing."
              />
              <span className="mt-1 block text-[10px] text-[#7889A0]">
                {draft.storyPublished
                  ? "An admin has published a version of your story."
                  : "Nothing is published until the programme team reviews it."}
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
          {saved && (
            <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
              Update saved. Thank you.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-6 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save my update
          </button>

          <p className="mt-6 text-[10px] text-[#7889A0]">
            This link is private. Do not forward it. Email {supportEmail} if
            you need help.
          </p>
        </form>
      </div>
    </main>
  );
}
