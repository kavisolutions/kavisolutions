"use client";

import { useState } from "react";
import { FINANCIAL_ENTITY_TYPES, FINANCIAL_SERVICE_OPTIONS } from "@/lib/financial-data";

type Kind = "individual" | "business";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-emerald-400/60";

const labelClass = "mb-1.5 block text-xs font-semibold text-mist";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const currentFinancialYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  // Indian financial year starts in April.
  const start = now.getMonth() >= 3 ? year : year - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
};

export default function FinancialForms() {
  const [kind, setKind] = useState<Kind>("individual");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [individual, setIndividual] = useState({
    name: "",
    email: "",
    phone: "",
    service: FINANCIAL_SERVICE_OPTIONS.individual[0],
    financialYear: currentFinancialYear(),
    message: "",
  });

  const [business, setBusiness] = useState({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    entityType: FINANCIAL_ENTITY_TYPES[0],
    service: FINANCIAL_SERVICE_OPTIONS.business[0],
    message: "",
  });

  const sending = status.kind === "sending";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setStatus({ kind: "sending" });

    const payload =
      kind === "individual"
        ? { kind, ...individual }
        : { kind, ...business };

    try {
      const res = await fetch("/api/financial/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
        setStatus({
          kind: "error",
          message:
            message ||
            "Could not send your enquiry. Please email kavisolutions1@gmail.com directly.",
        });
        return;
      }

      setStatus({ kind: "sent" });
      if (kind === "individual") {
        setIndividual({
          name: "",
          email: "",
          phone: "",
          service: FINANCIAL_SERVICE_OPTIONS.individual[0],
          financialYear: currentFinancialYear(),
          message: "",
        });
      } else {
        setBusiness({
          name: "",
          email: "",
          phone: "",
          organisation: "",
          entityType: FINANCIAL_ENTITY_TYPES[0],
          service: FINANCIAL_SERVICE_OPTIONS.business[0],
          message: "",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your connection and try again.",
      });
    }
  };

  return (
    <div className="rounded-3xl glass p-6 shadow-lift sm:p-8">
      <div className="mb-6 flex gap-2 rounded-xl bg-white/5 p-1">
        {(
          [
            { id: "individual", label: "Individual" },
            { id: "business", label: "Business" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={kind === option.id}
            onClick={() => {
              setKind(option.id);
              setStatus({ kind: "idle" });
            }}
            className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
              kind === option.id
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                : "text-mist hover:bg-white/5 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fin-name">
              Full name *
            </label>
            <input
              id="fin-name"
              required
              value={kind === "individual" ? individual.name : business.name}
              onChange={(e) =>
                kind === "individual"
                  ? setIndividual({ ...individual, name: e.target.value })
                  : setBusiness({ ...business, name: e.target.value })
              }
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="fin-email">
              Email *
            </label>
            <input
              id="fin-email"
              required
              type="email"
              value={kind === "individual" ? individual.email : business.email}
              onChange={(e) =>
                kind === "individual"
                  ? setIndividual({ ...individual, email: e.target.value })
                  : setBusiness({ ...business, email: e.target.value })
              }
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fin-phone">
              Phone *
            </label>
            <input
              id="fin-phone"
              required
              type="tel"
              value={kind === "individual" ? individual.phone : business.phone}
              onChange={(e) =>
                kind === "individual"
                  ? setIndividual({ ...individual, phone: e.target.value })
                  : setBusiness({ ...business, phone: e.target.value })
              }
              className={inputClass}
              placeholder="+91 …"
            />
          </div>

          {kind === "business" ? (
            <div>
              <label className={labelClass} htmlFor="fin-org">
                Organisation
              </label>
              <input
                id="fin-org"
                value={business.organisation}
                onChange={(e) => setBusiness({ ...business, organisation: e.target.value })}
                className={inputClass}
                placeholder="Company / firm name"
              />
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="fin-fy">
                Financial year
              </label>
              <input
                id="fin-fy"
                value={individual.financialYear}
                onChange={(e) =>
                  setIndividual({ ...individual, financialYear: e.target.value })
                }
                className={inputClass}
                placeholder="2026-27"
              />
            </div>
          )}
        </div>

        {kind === "business" && (
          <div>
            <label className={labelClass} htmlFor="fin-entity">
              Entity type
            </label>
            <select
              id="fin-entity"
              value={business.entityType}
              onChange={(e) => setBusiness({ ...business, entityType: e.target.value })}
              className={`${inputClass} [&>option]:bg-ink-soft`}
            >
              {FINANCIAL_ENTITY_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="fin-service">
            What do you need?
          </label>
          <select
            id="fin-service"
            value={kind === "individual" ? individual.service : business.service}
            onChange={(e) =>
              kind === "individual"
                ? setIndividual({ ...individual, service: e.target.value })
                : setBusiness({ ...business, service: e.target.value })
            }
            className={`${inputClass} [&>option]:bg-ink-soft`}
          >
            {(kind === "individual"
              ? FINANCIAL_SERVICE_OPTIONS.individual
              : FINANCIAL_SERVICE_OPTIONS.business
            ).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="fin-message">
            Tell us about your situation *
          </label>
          <textarea
            id="fin-message"
            required
            minLength={10}
            rows={4}
            value={kind === "individual" ? individual.message : business.message}
            onChange={(e) =>
              kind === "individual"
                ? setIndividual({ ...individual, message: e.target.value })
                : setBusiness({ ...business, message: e.target.value })
            }
            className={`${inputClass} resize-none`}
            placeholder={
              kind === "individual"
                ? "Income sources, what you need help with, and any deadlines you are working against."
                : "Entity type, turnover range, bookkeeping status, and what you need help with."
            }
          />
        </div>

        {status.kind === "error" && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            {status.message}
          </p>
        )}

        {status.kind === "sent" && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
            Thank you — your enquiry has been received. We respond within one working day.
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {sending ? "Sending…" : "Request a consultation"}
        </button>

        <p className="text-[11px] leading-relaxed text-fog">
          Please do not send financial documents through this form. We will share a secure
          checklist once scope is agreed. Your details are used only to respond to this enquiry
          and are never sold or shared.
        </p>
      </form>
    </div>
  );
}
