"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type Application = {
  reference: string;
  name: string;
  track: string;
  cohort: string;
  stage: string;
  offerExpiresAt: string | null;
  waitlistPosition: number | null;
  updatedAt: string;
};

export default function CandidateOfferPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"accepted" | "declined" | "">("");
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-applications/offer/${token}`);
      const payload = (await response.json().catch(() => null)) as
        | { application?: Application; message?: string }
        | null;
      if (!response.ok || !payload?.application) {
        throw new Error(payload?.message ?? "This offer link is invalid.");
      }
      setApplication(payload.application);
      if (payload.application.stage === "accepted") setDone("accepted");
      if (payload.application.stage === "withdrawn") setDone("declined");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the offer.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const respond = async (decision: "accept" | "decline") => {
    if (!token || saving) return;
    if (
      decision === "decline" &&
      !window.confirm("Decline this offer? The team will close your application.")
    ) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/fellowship-applications/offer/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { application?: Application; message?: string }
        | null;
      if (!response.ok || !payload?.application) {
        throw new Error(payload?.message ?? "Could not record your response.");
      }
      setApplication(payload.application);
      setDone(decision === "accept" ? "accepted" : "declined");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record your response.");
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

  if (error && !application) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06060F] px-5 py-12 text-[#F7F9FC]">
        <div className="w-full max-w-md rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-7 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · OFFER
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Offer unavailable</h1>
          <p className="mt-3 text-sm text-[#A5B3C7]">{error}</p>
        </div>
      </main>
    );
  }

  if (!application) return null;
  const expired =
    application.offerExpiresAt &&
    new Date(application.offerExpiresAt).getTime() < now;

  return (
    <main className="min-h-screen bg-[#06060F] px-5 py-10 text-[#F7F9FC]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] p-6 sm:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#91B4FF]">
            KAVI FELLOWSHIP · OFFER RESPONSE
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Hello {application.name}
          </h1>
          <p className="mt-1 text-sm text-[#A5B3C7]">
            {application.track} track · {application.cohort} cohort ·{" "}
            <span className="font-mono">{application.reference}</span>
          </p>

          {done === "accepted" ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Offer accepted
              </p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">
                Thank you. The programme team has been notified and will send the
                onboarding checklist and induction details.
              </p>
            </div>
          ) : done === "declined" ? (
            <div className="mt-5 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(6,6,15,0.5)] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#F7F9FC]">
                <XCircle className="h-4 w-4" />
                Offer declined
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#A5B3C7]">
                Your response is recorded. Thank you for letting the team know. You can
                email kavisolutions1@gmail.com if you want feedback.
              </p>
            </div>
          ) : application.stage !== "offer" ? (
            <div className="mt-5 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(6,6,15,0.5)] p-5 text-sm text-[#A5B3C7]">
              This application is not currently awaiting an offer response. Check the{" "}
              <a href="/fellowship/status" className="text-[#22D3EE] hover:underline">
                status page
              </a>{" "}
              for the latest stage.
            </div>
          ) : expired ? (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
              The response window for this offer has closed. Email
              kavisolutions1@gmail.com to ask about the next step.
            </div>
          ) : (
            <>
              {application.offerExpiresAt && (
                <p className="mt-4 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-4 text-xs leading-relaxed text-[#DDD6FE]">
                  Please respond by{" "}
                  <strong>
                    {new Date(application.offerExpiresAt).toLocaleString("en-IN", {
                      dateStyle: "full",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    IST
                  </strong>
                  .
                </p>
              )}
              <p className="mt-4 text-sm leading-relaxed text-[#A5B3C7]">
                Review the written cohort terms sent by the programme team before
                accepting. Accepting records your decision; it does not collect any
                payment.
              </p>
              {error && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void respond("accept")}
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-6 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Accept offer
                </button>
                <button
                  type="button"
                  onClick={() => void respond("decline")}
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[rgba(148,163,184,0.24)] px-6 text-sm font-medium text-[#A5B3C7] disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </>
          )}

          <p className="mt-6 text-[10px] text-[#7889A0]">
            This link is private. Do not forward it. Email kavisolutions1@gmail.com if
            you need help.
          </p>
        </div>
      </div>
    </main>
  );
}
