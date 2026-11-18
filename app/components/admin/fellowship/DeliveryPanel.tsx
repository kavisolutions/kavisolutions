"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  FileUp,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonBody,
  type FellowshipAdminApplication,
  type FellowshipDeliveryReview,
  type FellowshipDocument,
} from "@/lib/fellowship-admin";

const REVIEW_TYPES = [
  ["weekly", "Weekly mentor review"],
  ["phase", "Phase assessment"],
  ["capstone", "Capstone"],
  ["exit", "Exit interview"],
] as const;

const DOC_TYPES = [
  ["id", "ID proof"],
  ["education", "Education"],
  ["consent", "Signed consent"],
  ["other", "Other"],
] as const;

type ReviewDraft = {
  type: (typeof REVIEW_TYPES)[number][0];
  phase: string;
  week: string;
  reviewerName: string;
  reviewerEmail: string;
  attendancePercent: string;
  deliverableScore: string;
  collaborationScore: string;
  fieldScore: string;
  notes: string;
  atRisk: boolean;
  riskNotes: string;
};

const EMPTY_REVIEW: ReviewDraft = {
  type: "weekly",
  phase: "",
  week: "",
  reviewerName: "",
  reviewerEmail: "",
  attendancePercent: "",
  deliverableScore: "",
  collaborationScore: "",
  fieldScore: "",
  notes: "",
  atRisk: false,
  riskNotes: "",
};

export default function DeliveryPanel({
  applications,
}: {
  applications: FellowshipAdminApplication[];
}) {
  const [selectedID, setSelectedID] = useState("");
  const [reviews, setReviews] = useState<FellowshipDeliveryReview[]>([]);
  const [documents, setDocuments] = useState<FellowshipDocument[]>([]);
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>(EMPTY_REVIEW);
  const [docType, setDocType] = useState("other");
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const candidates = useMemo(
    () =>
      applications.filter((application) =>
        ["accepted", "onboarded", "active", "completed"].includes(
          application.stage,
        ),
      ),
    [applications],
  );

  useEffect(() => {
    if (selectedID || candidates.length === 0) return;
    const timer = window.setTimeout(() => setSelectedID(candidates[0].id), 0);
    return () => window.clearTimeout(timer);
  }, [candidates, selectedID]);

  const load = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError("");
    try {
      const [reviewData, docData] = await Promise.all([
        adminRequest<{ reviews: FellowshipDeliveryReview[] }>(
          `/api/fellowship-delivery?applicationId=${applicationId}`,
        ),
        adminRequest<{ documents: FellowshipDocument[] }>(
          `/api/fellowship-onboarding/${applicationId}/documents`,
        ),
      ]);
      setReviews(reviewData.reviews ?? []);
      setDocuments(docData.documents ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load delivery data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedID) return;
    const timer = window.setTimeout(() => void load(selectedID), 0);
    return () => window.clearTimeout(timer);
  }, [load, selectedID]);

  const selected = applications.find((application) => application.id === selectedID);

  const createReview = async () => {
    if (!selectedID) {
      setError("Choose a fellow first.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        "/api/fellowship-delivery",
        jsonBody({
          applicationId: selectedID,
          type: reviewDraft.type,
          phase: reviewDraft.phase,
          week: reviewDraft.week ? Number(reviewDraft.week) : undefined,
          reviewerName: reviewDraft.reviewerName,
          reviewerEmail: reviewDraft.reviewerEmail || undefined,
          attendancePercent: reviewDraft.attendancePercent
            ? Number(reviewDraft.attendancePercent)
            : undefined,
          deliverableScore: reviewDraft.deliverableScore
            ? Number(reviewDraft.deliverableScore)
            : undefined,
          collaborationScore: reviewDraft.collaborationScore
            ? Number(reviewDraft.collaborationScore)
            : undefined,
          fieldScore: reviewDraft.fieldScore
            ? Number(reviewDraft.fieldScore)
            : undefined,
          notes: reviewDraft.notes,
          atRisk: reviewDraft.atRisk,
          riskNotes: reviewDraft.riskNotes,
        }),
      );
      setNotice("Delivery review saved.");
      setReviewDraft(EMPTY_REVIEW);
      await load(selectedID);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the review.");
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async (id: string) => {
    if (!window.confirm("Delete this delivery review?")) return;
    try {
      await adminRequest(`/api/fellowship-delivery/${id}`, { method: "DELETE" });
      setNotice("Review deleted.");
      await load(selectedID);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the review.");
    }
  };

  const uploadDocument = async () => {
    if (!selectedID || !file) {
      setError("Choose a file to upload.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", docType);
      form.append("name", docName || file.name);
      const response = await fetch(`/api/fellowship-onboarding/${selectedID}/documents`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message ?? "Could not upload the document.");
      }
      setNotice("Document uploaded.");
      setFile(null);
      setDocName("");
      await load(selectedID);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload the document.");
    } finally {
      setSaving(false);
    }
  };

  const updateDocument = async (id: string, status: string) => {
    try {
      await adminRequest(
        `/api/fellowship-onboarding/documents/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      setNotice(`Document marked ${status}.`);
      await load(selectedID);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the document.");
    }
  };

  const deleteDocument = async (id: string) => {
    if (!window.confirm("Delete this document and its stored file?")) return;
    try {
      await adminRequest(`/api/fellowship-onboarding/documents/${id}`, {
        method: "DELETE",
      });
      setNotice("Document deleted.");
      await load(selectedID);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the document.");
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
              Active fellowship delivery
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Weekly and phase reviews, attendance, capstone/exit sign-off, risk flags
              and private onboarding documents.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedID && void load(selectedID)}
            disabled={loading || !selectedID}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fellow
            </span>
            <select
              value={selectedID}
              onChange={(event) => {
                setSelectedID(event.target.value);
                setNotice("");
              }}
              className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
            >
              <option value="">Choose an accepted, active or completed fellow</option>
              {candidates.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name} · {application.reference} · {application.stage}
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              {selected.reference} · {selected.track} · {selected.cohort}
            </p>
          )}

          {selectedID && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Documents
                </p>
                <div className="mt-2 grid gap-2">
                  <select
                    value={docType}
                    onChange={(event) => setDocType(event.target.value)}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {DOC_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={docName}
                    onChange={(event) => setDocName(event.target.value)}
                    placeholder="Document name (optional)"
                  />
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-[11px] text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:text-primary-foreground"
                  />
                  <Button size="sm" onClick={() => void uploadDocument()} disabled={saving}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
                    Upload private document
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    PDF, JPG, PNG or WebP · max 10MB · stored privately and downloadable
                    only by admins.
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {documents.length === 0 && (
                    <p className="py-2 text-center text-[11px] text-muted-foreground">
                      No documents uploaded.
                    </p>
                  )}
                  {documents.map((document) => (
                    <div key={document.id} className="rounded-lg border border-border bg-background p-2.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-medium">{document.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {document.type} · {(document.size / 1024).toFixed(0)} KB ·{" "}
                            {document.status}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <a
                            href={`/api/fellowship-onboarding/documents/${document.id}/file`}
                            className="rounded-md px-2 py-1 text-[10px] text-primary hover:bg-primary/10"
                          >
                            Download
                          </a>
                          {document.status !== "verified" && (
                            <button
                              type="button"
                              onClick={() => void updateDocument(document.id, "verified")}
                              className="rounded-md px-2 py-1 text-[10px] text-emerald-600 hover:bg-emerald-500/10"
                            >
                              Verify
                            </button>
                          )}
                          {document.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => void updateDocument(document.id, "rejected")}
                              className="rounded-md px-2 py-1 text-[10px] text-amber-600 hover:bg-amber-500/10"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void deleteDocument(document.id)}
                            className="rounded-md px-2 py-1 text-[10px] text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  New delivery review
                </p>
                <div className="mt-2 grid gap-2">
                  <select
                    value={reviewDraft.type}
                    onChange={(event) =>
                      setReviewDraft({
                        ...reviewDraft,
                        type: event.target.value as ReviewDraft["type"],
                      })
                    }
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {REVIEW_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={reviewDraft.phase}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, phase: event.target.value })
                      }
                      placeholder="Phase (e.g. Craft)"
                    />
                    <Input
                      type="number"
                      value={reviewDraft.week}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, week: event.target.value })
                      }
                      placeholder="Week"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={reviewDraft.reviewerName}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, reviewerName: event.target.value })
                      }
                      placeholder="Reviewer name"
                    />
                    <Input
                      type="email"
                      value={reviewDraft.reviewerEmail}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, reviewerEmail: event.target.value })
                      }
                      placeholder="Reviewer email"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={reviewDraft.attendancePercent}
                      onChange={(event) =>
                        setReviewDraft({
                          ...reviewDraft,
                          attendancePercent: event.target.value,
                        })
                      }
                      placeholder="Attendance %"
                    />
                    <select
                      value={reviewDraft.deliverableScore}
                      onChange={(event) =>
                        setReviewDraft({
                          ...reviewDraft,
                          deliverableScore: event.target.value,
                        })
                      }
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                    >
                      <option value="">Deliverable score</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={reviewDraft.collaborationScore}
                      onChange={(event) =>
                        setReviewDraft({
                          ...reviewDraft,
                          collaborationScore: event.target.value,
                        })
                      }
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                    >
                      <option value="">Collaboration score</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <select
                      value={reviewDraft.fieldScore}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, fieldScore: event.target.value })
                      }
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                    >
                      <option value="">Field score</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={reviewDraft.notes}
                    onChange={(event) =>
                      setReviewDraft({ ...reviewDraft, notes: event.target.value })
                    }
                    rows={2}
                    placeholder="Deliverables, evidence and next steps"
                    className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                  />
                  <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={reviewDraft.atRisk}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, atRisk: event.target.checked })
                      }
                    />
                    Flag as at risk
                  </label>
                  {reviewDraft.atRisk && (
                    <textarea
                      value={reviewDraft.riskNotes}
                      onChange={(event) =>
                        setReviewDraft({ ...reviewDraft, riskNotes: event.target.value })
                      }
                      rows={2}
                      placeholder="Support plan and follow-up date"
                      className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                    />
                  )}
                  <Button size="sm" onClick={() => void createReview()} disabled={saving}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save review
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Review history
            {reviews.some((review) => review.atRisk) && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600">
                {reviews.filter((review) => review.atRisk).length} at risk
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reviews.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No delivery reviews recorded yet.
            </p>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border p-3 ${
                review.atRisk
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold">
                    {review.type} review
                    {review.phase ? ` · ${review.phase}` : ""}
                    {review.week ? ` · week ${review.week}` : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(review.createdAt).toLocaleString()}
                    {review.reviewerName ? ` · ${review.reviewerName}` : ""}
                    {review.attendancePercent !== null
                      ? ` · attendance ${review.attendancePercent}%`
                      : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void removeReview(review.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                {review.deliverableScore !== null && (
                  <span className="inline-flex items-center gap-1">
                    <FileCheck2 className="h-3 w-3" /> Deliverable {review.deliverableScore}/5
                  </span>
                )}
                {review.collaborationScore !== null && (
                  <span>Collaboration {review.collaborationScore}/5</span>
                )}
                {review.fieldScore !== null && <span>Field {review.fieldScore}/5</span>}
              </div>
              {review.notes && (
                <p className="mt-2 whitespace-pre-wrap text-[11px] text-muted-foreground">
                  {review.notes}
                </p>
              )}
              {review.atRisk && review.riskNotes && (
                <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] text-amber-700">
                  Risk plan: {review.riskNotes}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
