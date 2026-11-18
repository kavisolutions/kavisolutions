"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldOff,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminRequest,
  jsonBody,
  type FellowshipAdminApplication,
  type FellowshipReview,
} from "@/lib/fellowship-admin";

const RECOMMENDATIONS = [
  ["offer", "Recommend offer"],
  ["waitlist", "Recommend waitlist"],
  ["reject", "Recommend reject"],
] as const;

const SCORE_FIELDS = [
  ["motivationScore", "Motivation"],
  ["commitmentScore", "Commitment"],
  ["communicationScore", "Communication"],
  ["problemScore", "Problem solving"],
  ["fieldScore", "Field readiness"],
  ["fitScore", "Cohort fit"],
] as const;

type ScoreDraft = {
  motivationScore: number;
  commitmentScore: number;
  communicationScore: number;
  problemScore: number;
  fieldScore: number;
  fitScore: number;
  recommendation: "offer" | "waitlist" | "reject";
  notes: string;
};

const EMPTY_SCORE: ScoreDraft = {
  motivationScore: 3,
  commitmentScore: 3,
  communicationScore: 3,
  problemScore: 3,
  fieldScore: 3,
  fitScore: 3,
  recommendation: "offer",
  notes: "",
};

export default function ReviewsPanel({
  applications,
}: {
  applications: FellowshipAdminApplication[];
}) {
  const [reviews, setReviews] = useState<FellowshipReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedID, setSelectedID] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [score, setScore] = useState<ScoreDraft>(EMPTY_SCORE);
  const [scoreOpen, setScoreOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminRequest<{ reviews: FellowshipReview[] }>(
        "/api/fellowship-reviews",
      );
      setReviews(data.reviews ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selected = applications.find((application) => application.id === selectedID);
  const selectedReviews = useMemo(
    () => reviews.filter((review) => review.applicationId === selectedID),
    [reviews, selectedID],
  );

  const assign = async () => {
    if (!selectedID) {
      setError("Choose an application first.");
      return;
    }
    if (!reviewerName.trim() || !reviewerEmail.trim()) {
      setError("Reviewer name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        "/api/fellowship-reviews",
        jsonBody({
          applicationId: selectedID,
          reviewerName,
          reviewerEmail,
          expiresInDays,
        }),
      );
      setNotice("Reviewer assigned and invite sent.");
      setReviewerName("");
      setReviewerEmail("");
      setFormOpen(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not assign the review.");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (review: FellowshipReview) => {
    if (!window.confirm(`Revoke ${review.reviewerEmail}'s review link?`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/fellowship-reviews/${review.id}/revoke`, {
        method: "POST",
      });
      setNotice("Review link revoked.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not revoke the review.");
    }
  };

  const remove = async (review: FellowshipReview) => {
    if (!window.confirm(`Delete the review by ${review.reviewerEmail}?`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/fellowship-reviews/${review.id}`, { method: "DELETE" });
      setNotice("Review deleted.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the review.");
    }
  };

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/mentor/review/${token}`,
      );
      setNotice("Private review link copied.");
    } catch {
      setError("Could not copy. Open the link and copy from the address bar.");
    }
  };

  const submitScore = async () => {
    if (!selectedID) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/fellowship-reviews/application/${selectedID}/scorecard`,
        jsonBody(score),
      );
      setNotice("Admin review scorecard saved.");
      setScoreOpen(false);
      setScore(EMPTY_SCORE);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the review.");
    } finally {
      setSaving(false);
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
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Pre-interview review
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Assign two independent reviewers, collect scored evidence and keep the
              stage decision separate from interview scores.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setFormOpen((value) => !value)}>
              <Plus className="h-4 w-4" />
              Assign reviewer
            </Button>
          </div>
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
                setScoreOpen(false);
                setNotice("");
              }}
              className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
            >
              <option value="">Choose an application</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name} · {application.reference} · {application.track}
                </option>
              ))}
            </select>
          </label>

          {formOpen && (
            <div className="mt-3 grid gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reviewer name
                </span>
                <Input
                  value={reviewerName}
                  onChange={(event) => setReviewerName(event.target.value)}
                  placeholder="Reviewer name"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reviewer email
                </span>
                <Input
                  type="email"
                  value={reviewerEmail}
                  onChange={(event) => setReviewerEmail(event.target.value)}
                  placeholder="reviewer@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Link valid (days)
                </span>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={expiresInDays}
                  onChange={(event) => setExpiresInDays(Number(event.target.value))}
                />
              </label>
              <div className="sm:col-span-3">
                <Button onClick={() => void assign()} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Assign and send invite
                </Button>
              </div>
            </div>
          )}

          {selected && (
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{selected.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {selected.reference} · {selected.track} · {selected.cohort}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setScoreOpen((value) => !value)}>
                  Score as admin
                </Button>
              </div>

              {scoreOpen && (
                <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SCORE_FIELDS.map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">{label}</span>
                        <select
                          value={score[key]}
                          onChange={(event) =>
                            setScore({ ...score, [key]: Number(event.target.value) })
                          }
                          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <label className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">Recommendation</span>
                      <select
                        value={score.recommendation}
                        onChange={(event) =>
                          setScore({
                            ...score,
                            recommendation: event.target.value as ScoreDraft["recommendation"],
                          })
                        }
                        className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
                      >
                        {RECOMMENDATIONS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <textarea
                    value={score.notes}
                    onChange={(event) => setScore({ ...score, notes: event.target.value })}
                    rows={3}
                    placeholder="Written evidence and any red flags"
                    className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                  />
                  <Button className="mt-2" size="sm" onClick={() => void submitScore()} disabled={saving}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save admin review
                  </Button>
                </div>
              )}

              <div className="mt-3 space-y-2">
                {selectedReviews.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No reviewers assigned yet.
                  </p>
                )}
                {selectedReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium">
                          {review.reviewerName}{" "}
                          <span className="font-normal text-muted-foreground">
                            ({review.reviewerEmail})
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {review.submittedAt
                            ? `Submitted ${new Date(review.submittedAt).toLocaleString()} · Average ${review.average ?? "—"}/5 · ${review.recommendation}`
                            : review.revokedAt
                              ? "Link revoked"
                              : review.tokenExpiresAt
                                ? `Awaiting response · link expires ${new Date(review.tokenExpiresAt).toLocaleDateString()}`
                                : "Awaiting response"}
                        </p>
                        {review.notes && (
                          <p className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">
                            {review.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => void copyLink(review.token)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-primary hover:bg-primary/10"
                        >
                          <Copy className="h-3 w-3" />
                          Copy link
                        </button>
                        {!review.revokedAt && (
                          <button
                            type="button"
                            onClick={() => void revoke(review)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-amber-600 hover:bg-amber-500/10"
                          >
                            <ShieldOff className="h-3 w-3" />
                            Revoke
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void remove(review)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selected && (
            <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Choose an application to assign reviewers and see submitted scores.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
