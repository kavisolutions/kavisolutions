"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CERTIFICATE_ID_EXAMPLE,
  CERTIFICATE_TYPE_LABELS,
  formatCertificateDate,
  formatCertificatePeriod,
  normalizeCertificateIdInput,
  type PublicCertificate,
} from "@/lib/certificates";

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
      // A revocation must show up immediately for a fresh QR scan.
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

  /* Deep links (QR scans) resolve on mount. Results are applied from the
     promise callback so the effect never sets state synchronously. */
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
    <div className="min-h-screen bg-ink px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="font-display text-lg font-semibold tracking-tight">
            Kavi<span className="text-gradient">Solutions</span>
          </span>
        </Link>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-fog">
            Certificate verification
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Verify a Kavi Solutions <span className="text-gradient">certificate</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
            Every certificate we issue carries a unique ID and a QR code. Enter the ID
            printed on the document to confirm it was issued by Kavi Solutions and has not
            been revoked.
          </p>
        </header>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm uppercase tracking-wider text-white outline-none transition-colors placeholder:text-fog/60 focus:border-violet-400/60"
          />
          <button
            type="submit"
            disabled={state.kind === "loading"}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {state.kind === "loading" ? "Checking…" : "Verify"}
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
            <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4 ${
                  state.kind === "revoked"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                      state.kind === "revoked"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                    aria-hidden
                  >
                    {state.kind === "revoked" ? "!" : "✓"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {state.kind === "revoked" ? "Certificate revoked" : "Certificate verified"}
                    </p>
                    <p className="text-xs text-mist">
                      {state.kind === "revoked"
                        ? "This document is no longer valid. Contact us if you believe this is an error."
                        : "Issued by Kavi Solutions and currently valid."}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-mist">
                  {certificate.id}
                </span>
              </div>

              <div className="px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fog">
                  {SEAL_LABEL[certificate.type]}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
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
                  <p className="mt-6 border-t border-white/10 pt-4 text-sm leading-relaxed text-mist">
                    {certificate.summary}
                  </p>
                )}
              </div>
            </article>
          )}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-fog">
          Kavi Solutions certificates recognise participation in our programmes and
          engagements. They do not represent university accreditation, government
          recognition or a professional licence. Questions? Write to{" "}
          <a href="mailto:support@kavisolutions.in" className="text-mist hover:text-white">
            support@kavisolutions.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-fog">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
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
