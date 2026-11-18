"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Save, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonPatch,
  type FellowshipAdminApplication,
  type FellowshipOnboarding,
} from "@/lib/fellowship-admin";
import {
  FELLOWSHIP_OPEN_STAGES,
  FELLOWSHIP_STAGE_LABELS,
  isFellowshipStage,
} from "@/lib/fellowship-application";

type OnboardingDraft = Pick<
  FellowshipOnboarding,
  | "idVerified"
  | "educationVerified"
  | "emergencyContact"
  | "medicalNotes"
  | "codeOfConduct"
  | "poshAck"
  | "mediaConsent"
  | "deviceNeeds"
  | "baselineDone"
  | "vipassanaAck"
  | "accommodationNotes"
  | "travelNotes"
  | "foodNotes"
  | "arrivalAt"
  | "notes"
>;

const CHECKLIST = [
  ["idVerified", "ID verified"],
  ["educationVerified", "Education documents verified"],
  ["codeOfConduct", "Code of conduct acknowledged"],
  ["poshAck", "POSH and grievance channel acknowledged"],
  ["mediaConsent", "Photo and media consent recorded"],
  ["baselineDone", "Baseline skills and confidence survey done"],
  ["vipassanaAck", "Vipassana and residency logistics acknowledged"],
] as const;

const fromRecord = (record: FellowshipOnboarding): OnboardingDraft => ({
  idVerified: record.idVerified,
  educationVerified: record.educationVerified,
  emergencyContact: record.emergencyContact,
  medicalNotes: record.medicalNotes,
  codeOfConduct: record.codeOfConduct,
  poshAck: record.poshAck,
  mediaConsent: record.mediaConsent,
  deviceNeeds: record.deviceNeeds,
  baselineDone: record.baselineDone,
  vipassanaAck: record.vipassanaAck,
  accommodationNotes: record.accommodationNotes,
  travelNotes: record.travelNotes,
  foodNotes: record.foodNotes,
  arrivalAt: record.arrivalAt,
  notes: record.notes,
});

const progress = (draft: OnboardingDraft): number =>
  [
    draft.idVerified,
    draft.educationVerified,
    Boolean(draft.emergencyContact.trim()),
    draft.codeOfConduct,
    draft.poshAck,
    draft.mediaConsent,
    draft.baselineDone,
    draft.vipassanaAck,
  ].filter(Boolean).length;

export default function OnboardingPanel({
  applications,
  onApplicationsChanged,
}: {
  applications: FellowshipAdminApplication[];
  onApplicationsChanged?: () => void;
}) {
  const [selectedID, setSelectedID] = useState("");
  const [record, setRecord] = useState<FellowshipOnboarding | null>(null);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const candidates = useMemo(() => {
    const order = ["offer", "accepted", "onboarded", "active", "completed"];
    return [...applications]
      .filter(
        (application) =>
          application.stage === "offer" ||
          FELLOWSHIP_OPEN_STAGES.includes(application.stage),
      )
      .sort((left, right) => {
        const leftIndex = order.indexOf(left.stage);
        const rightIndex = order.indexOf(right.stage);
        if (leftIndex !== rightIndex) {
          return (leftIndex === -1 ? order.length : leftIndex) -
            (rightIndex === -1 ? order.length : rightIndex);
        }
        return left.name.localeCompare(right.name);
      });
  }, [applications]);

  const load = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest<{ onboarding: FellowshipOnboarding }>(
        `/api/fellowship-onboarding/${applicationId}`,
      );
      setRecord(data.onboarding);
      setDraft(fromRecord(data.onboarding));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load the checklist.",
      );
      setRecord(null);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedID) return;
    const timer = window.setTimeout(() => void load(selectedID), 0);
    return () => window.clearTimeout(timer);
  }, [load, selectedID]);

  useEffect(() => {
    if (selectedID || candidates.length === 0) return;
    const timer = window.setTimeout(() => {
      const preferred =
        candidates.find((application) => application.stage === "accepted") ??
        candidates.find((application) => application.stage === "offer") ??
        candidates[0];
      setSelectedID(preferred.id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [candidates, selectedID]);

  const save = async () => {
    if (!selectedID || !draft || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await adminRequest<{ onboarding: FellowshipOnboarding }>(
        `/api/fellowship-onboarding/${selectedID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      setRecord(data.onboarding);
      setDraft(fromRecord(data.onboarding));
      setNotice("Onboarding checklist saved.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save the checklist.",
      );
    } finally {
      setSaving(false);
    }
  };

  const markOnboarded = async () => {
    if (!selectedID) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-applications/${selectedID}`,
        jsonPatch({ stage: "onboarded" }),
      );
      setNotice("Application moved to Onboarding complete.");
      if (record) {
        setRecord({ ...record, stage: "onboarded" });
      }
      onApplicationsChanged?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the stage.");
    } finally {
      setSaving(false);
    }
  };

  const liveProgress = draft ? progress(draft) : 0;
  const total = 8;

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCheck className="h-4 w-4 text-primary" />
            Onboarding checklist
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Collect documents, consents and logistics before the cohort starts.
            Completing the checklist does not change the stage automatically.
          </p>
        </CardHeader>
        <CardContent>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Application
            </span>
            <select
              value={selectedID}
              onChange={(event) => {
                setSelectedID(event.target.value);
                setNotice("");
              }}
              className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
            >
              <option value="">Choose an application</option>
              {candidates.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name} · {application.reference} ·{" "}
                  {isFellowshipStage(application.stage)
                    ? FELLOWSHIP_STAGE_LABELS[application.stage]
                    : application.stage}
                </option>
              ))}
            </select>
          </label>

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && draft && record && (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{record.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {record.reference} · {record.track} · {record.cohort}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium">
                    {liveProgress}/{total} complete
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(liveProgress / total) * 100}%` }}
                  />
                </div>
                {record.updatedAt && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Last saved {new Date(record.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {CHECKLIST.map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-[11px] ${
                      draft[key]
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [key]: event.target.checked })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Emergency contact
                  </span>
                  <Input
                    value={draft.emergencyContact}
                    onChange={(event) =>
                      setDraft({ ...draft, emergencyContact: event.target.value })
                    }
                    placeholder="Name, relation, phone"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Device / data needs
                  </span>
                  <Input
                    value={draft.deviceNeeds}
                    onChange={(event) =>
                      setDraft({ ...draft, deviceNeeds: event.target.value })
                    }
                    placeholder="Laptop, internet, accessibility…"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Medical and accessibility notes
                  </span>
                  <textarea
                    value={draft.medicalNotes}
                    onChange={(event) =>
                      setDraft({ ...draft, medicalNotes: event.target.value })
                    }
                    rows={2}
                    className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                    placeholder="Only what the fellow agrees to share with the programme team"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Accommodation
                  </span>
                  <Input
                    value={draft.accommodationNotes}
                    onChange={(event) =>
                      setDraft({ ...draft, accommodationNotes: event.target.value })
                    }
                    placeholder="Room, campus, local stay…"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Food needs
                  </span>
                  <Input
                    value={draft.foodNotes}
                    onChange={(event) =>
                      setDraft({ ...draft, foodNotes: event.target.value })
                    }
                    placeholder="Allergies, preferences, mess arrangement"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Travel and arrival
                  </span>
                  <textarea
                    value={draft.travelNotes}
                    onChange={(event) =>
                      setDraft({ ...draft, travelNotes: event.target.value })
                    }
                    rows={2}
                    className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                    placeholder="Travel booked, pickup, arrival window"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Arrival date and time
                  </span>
                  <Input
                    type="datetime-local"
                    value={
                      draft.arrivalAt
                        ? new Date(draft.arrivalAt).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        arrivalAt: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : null,
                      })
                    }
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal onboarding notes
                  </span>
                  <textarea
                    value={draft.notes}
                    onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                    placeholder="Follow-ups, missing documents, induction date…"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void save()} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save checklist
                </Button>
                {record.stage !== "onboarded" &&
                  !["active", "completed"].includes(record.stage) && (
                    <Button
                      variant="outline"
                      onClick={() => void markOnboarded()}
                      disabled={saving}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark onboarding complete
                    </Button>
                  )}
              </div>
            </div>
          )}

          {!loading && !draft && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Choose an accepted or offer-stage application to start onboarding.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
