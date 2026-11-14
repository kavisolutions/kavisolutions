"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import {
  CERTIFICATE_ID_EXAMPLE,
  CERTIFICATE_TYPE_LABELS,
  formatCertificateDate,
  formatCertificatePeriod,
  normalizeCertificateIdInput,
  type PublicCertificate,
} from "@/lib/certificates";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TiltCard } from "@/components/motion";

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; certificate: PublicCertificate }
  | { kind: "revoked"; certificate: PublicCertificate }
  | { kind: "missing"; id: string }
  | { kind: "invalid"; reason: string }
  | { kind: "error"; reason: string };

const SEAL_LABEL: Record<PublicCertificate["type"], string> = {
  fellowship: "Fellowship · Kavi Fellows Programme",
  volunteer: "Voluntary Service · Community",
  internship: "Internship · Kavi Solutions",
  mentorship: "Appreciation · Mentorship",
  experience: "Professional Engagement",
};

async function requestCertificate(id: string): Promise<LookupState> {
  try {
    const res = await fetch(`/api/certificates/${encodeURIComponent(id)}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (res.status === 404) return { kind: "missing", id };
    if (!res.ok) {
      return {
        kind: "error",
        reason: "Verification is temporarily unavailable. Please try again shortly.",
      };
    }

    const data: { certificate?: PublicCertificate } = await res.json();
    if (!data.certificate) return { kind: "missing", id };

    return {
      kind: data.certificate.status === "revoked" ? "revoked" : "found",
      certificate: data.certificate,
    };
  } catch {
    return {
      kind: "error",
      reason: "Could not reach the verification service. Check your connection and retry.",
    };
  }
}

function initialStateFor(id: string): LookupState {
  if (!id) return { kind: "idle" };
  const parsed = normalizeCertificateIdInput(id);
  if (!parsed.valid) return { kind: "invalid", reason: parsed.reason };
  return { kind: "loading" };
}

export default function VerifyClient({ initialId }: { initialId: string }) {
  const [input, setInput] = useState(initialId);
  const [state, setState] = useState<LookupState>(() => initialStateFor(initialId));

  useEffect(() => {
    if (!initialId) return;

    const parsed = normalizeCertificateIdInput(initialId);
    if (!parsed.valid) return;

    let cancelled = false;
    void requestCertificate(parsed.id).then((result) => {
      if (!cancelled) setState(result);
    });

    return () => {
      cancelled = true;
    };
  }, [initialId]);

  const lookup = useCallback(async (raw: string) => {
    const parsed = normalizeCertificateIdInput(raw);
    if (!parsed.valid) {
      setState({ kind: "invalid", reason: parsed.reason });
      return;
    }

    setState({ kind: "loading" });
    setState(await requestCertificate(parsed.id));
  }, []);

  const certificate = useMemo(() => {
    if (state.kind === "found" || state.kind === "revoked") return state.certificate;
    return null;
  }, [state]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void lookup(input);
  };

  return (
    <div className="min-h-screen bg-ink text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />

      <main className="px-6 pt-36 pb-20 flex-grow">
        <div className="mx-auto max-w-3xl">
          <header className="text-center sm:text-left mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                PUBLIC REGISTRY
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC]">
              Verify a Kavi Solutions <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">certificate</span>
            </h1>
            <p className="mt-3 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-[#A5B3C7]">
              Every certificate we issue carries a unique ID and a QR code. Enter the ID
              printed on the document to confirm it was issued by Kavi Solutions and has not
              been revoked.
            </p>
          </header>

          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="certificate-id">
              Certificate ID
            </label>
            <input
              id="certificate-id"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={CERTIFICATE_ID_EXAMPLE}
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-[12px] bg-[#06060F] border border-[rgba(148,163,184,0.20)] px-4 font-mono text-sm uppercase tracking-wider text-white outline-none transition-colors placeholder:text-[#7889A0]/60 focus:border-[#91B4FF]"
            />
            <button
              type="submit"
              disabled={state.kind === "loading"}
              className="h-12 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] px-7 text-sm font-medium text-white shadow-[0_0_20px_rgba(23,92,211,0.35)] transition-all disabled:opacity-50 shrink-0"
            >
              {state.kind === "loading" ? "Checking…" : "Verify ID"}
            </button>
          </form>

          <div className="mt-8" aria-live="polite">
            {state.kind === "invalid" && <Notice tone="warn" title="Check the ID" body={state.reason} />}

            {state.kind === "missing" && (
              <Notice
                tone="warn"
                title="No certificate found"
                body={`We have no record of ${state.id}. Confirm the ID printed on the document — IDs are case-insensitive but the digits must match exactly.`}
              />
            )}

            {state.kind === "error" && (
              <Notice tone="error" title="Something went wrong" body={state.reason} />
            )}

            {certificate && (
              <TiltCard
                intensity={6}
                className="mt-6 overflow-hidden rounded-[24px] bg-[rgba(18,29,47,0.88)] backdrop-blur-[20px] border border-[rgba(148,163,184,0.18)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4 ${
                    state.kind === "revoked"
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-emerald-500/30 bg-[#34D399]/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                        state.kind === "revoked"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-[#34D399]/20 text-[#34D399]"
                      }`}
                      aria-hidden
                    >
                      {state.kind === "revoked" ? (
                        <ShieldAlert className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#F7F9FC]">
                        {state.kind === "revoked" ? "Certificate revoked" : "Certificate verified"}
                      </p>
                      <p className="text-xs text-[#A5B3C7]">
                        {state.kind === "revoked"
                          ? "This document is no longer valid. Contact us if you believe this is an error."
                          : "Issued by Kavi Solutions and currently authentic."}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#91B4FF]">
                    {certificate.id}
                  </span>
                </div>

                <div className="px-6 sm:px-8 py-6">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7889A0]">
                    {SEAL_LABEL[certificate.type]}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F7F9FC]">
                    {certificate.title}
                  </h2>

                  <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Field label="Awarded to" value={certificate.recipient} />
                    {certificate.programme && <Field label="Programme" value={certificate.programme} />}
                    {certificate.role && <Field label="Role" value={certificate.role} />}
                    {(certificate.startDate || certificate.endDate) && (
                      <Field
                        label="Period"
                        value={formatCertificatePeriod(certificate.startDate, certificate.endDate)}
                      />
                    )}
                    <Field label="Issued on" value={formatCertificateDate(certificate.issuedOn)} />
                    <Field label="Certificate type" value={CERTIFICATE_TYPE_LABELS[certificate.type]} />
                  </dl>

                  {certificate.summary && (
                    <p className="mt-6 border-t border-[rgba(148,163,184,0.12)] pt-4 text-xs sm:text-sm leading-relaxed text-[#A5B3C7]">
                      {certificate.summary}
                    </p>
                  )}
                </div>
              </TiltCard>
            )}
          </div>

          <p className="mt-12 text-xs leading-relaxed text-[#7889A0]">
            Kavi Solutions certificates recognise participation in our programmes and
            engagements. They do not represent university accreditation, government
            recognition or a professional licence. Questions? Write to{" "}
            <a href="mailto:kavisolutions1@gmail.com" className="text-[#91B4FF] hover:underline">
              kavisolutions1@gmail.com
            </a>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#7889A0]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#F7F9FC]">{value}</dd>
    </div>
  );
}

function Notice({
  tone,
  title,
  body,
}: {
  tone: "warn" | "error";
  title: string;
  body: string;
}) {
  const palette =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-amber-400/30 bg-amber-400/10 text-amber-100";

  return (
    <div className={`rounded-xl border px-5 py-4 ${palette}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed opacity-90">{body}</p>
    </div>
  );
}
