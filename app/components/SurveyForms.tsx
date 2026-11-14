"use client";

import { useState } from "react";
import { SURVEY_SERVICE_OPTIONS } from "@/lib/survey-data";

type Kind = "client" | "surveyor";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-teal-400/60";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-mist";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/* The form takes one comma-separated field; the registry stores a list. */
const splitList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function SurveyForms() {
  const [kind, setKind] = useState<Kind>("client");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [client, setClient] = useState({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    service: SURVEY_SERVICE_OPTIONS[0],
    message: "",
  });

  const [surveyor, setSurveyor] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    languages: "",
    experience: "",
    message: "",
  });

  const sending = status.kind === "sending";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setStatus({ kind: "sending" });

    try {
      /* Surveyor registrations are stored in the network registry; client
         enquiries stay email-only. */
      const res =
        kind === "surveyor"
          ? await fetch("/api/surveyors/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: surveyor.name,
                email: surveyor.email,
                phone: surveyor.phone,
                location: surveyor.location,
                languages: splitList(surveyor.languages),
                /* The form asks for a short field-experience line plus an
                   "about you" note; the registry keeps one experience field. */
                experience: [surveyor.experience, surveyor.message]
                  .filter(Boolean)
                  .join(" — ")
                  .slice(0, 500),
              }),
            })
          : await fetch("/api/survey/enquiries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kind, ...client }),
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
      if (kind === "client") {
        setClient({
          name: "",
          email: "",
          phone: "",
          organisation: "",
          service: SURVEY_SERVICE_OPTIONS[0],
          message: "",
        });
      } else {
        setSurveyor({
          name: "",
          email: "",
          phone: "",
          location: "",
          languages: "",
          experience: "",
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
      {/* Mode switch */}
      <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200/80 dark:border-transparent">
        {(
          [
            { id: "client", label: "Client / project enquiry" },
            { id: "surveyor", label: "Join our survey network" },
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
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm"
                : "text-slate-600 dark:text-mist hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="survey-name">
              Full name *
            </label>
            <input
              id="survey-name"
              required
              value={kind === "client" ? client.name : surveyor.name}
              onChange={(e) =>
                kind === "client"
                  ? setClient({ ...client, name: e.target.value })
                  : setSurveyor({ ...surveyor, name: e.target.value })
              }
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="survey-email">
              Email *
            </label>
            <input
              id="survey-email"
              required
              type="email"
              value={kind === "client" ? client.email : surveyor.email}
              onChange={(e) =>
                kind === "client"
                  ? setClient({ ...client, email: e.target.value })
                  : setSurveyor({ ...surveyor, email: e.target.value })
              }
              className={inputClass}
              placeholder="you@organisation.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="survey-phone">
              Phone *
            </label>
            <input
              id="survey-phone"
              required
              type="tel"
              value={kind === "client" ? client.phone : surveyor.phone}
              onChange={(e) =>
                kind === "client"
                  ? setClient({ ...client, phone: e.target.value })
                  : setSurveyor({ ...surveyor, phone: e.target.value })
              }
              className={inputClass}
              placeholder="+91 …"
            />
          </div>

          {kind === "client" ? (
            <div>
              <label className={labelClass} htmlFor="survey-org">
                Organisation
              </label>
              <input
                id="survey-org"
                value={client.organisation}
                onChange={(e) => setClient({ ...client, organisation: e.target.value })}
                className={inputClass}
                placeholder="Company / institution"
              />
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="survey-location">
                Location you can cover
              </label>
              <input
                id="survey-location"
                value={surveyor.location}
                onChange={(e) => setSurveyor({ ...surveyor, location: e.target.value })}
                className={inputClass}
                placeholder="City / district / state"
              />
            </div>
          )}
        </div>

        {kind === "client" ? (
          <div>
            <label className={labelClass} htmlFor="survey-service">
              What do you need?
            </label>
            <select
              id="survey-service"
              value={client.service}
              onChange={(e) => setClient({ ...client, service: e.target.value })}
              className={`${inputClass} [&>option]:bg-ink-soft`}
            >
              {SURVEY_SERVICE_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="survey-languages">
                Languages
              </label>
              <input
                id="survey-languages"
                value={surveyor.languages}
                onChange={(e) => setSurveyor({ ...surveyor, languages: e.target.value })}
                className={inputClass}
                placeholder="Telugu, Hindi, English"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="survey-experience">
                Field experience
              </label>
              <input
                id="survey-experience"
                value={surveyor.experience}
                onChange={(e) => setSurveyor({ ...surveyor, experience: e.target.value })}
                className={inputClass}
                placeholder="e.g. 2 years, household surveys"
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="survey-message">
            {kind === "client" ? "Tell us about the project *" : "About you *"}
          </label>
          <textarea
            id="survey-message"
            required
            minLength={10}
            rows={4}
            value={kind === "client" ? client.message : surveyor.message}
            onChange={(e) =>
              kind === "client"
                ? setClient({ ...client, message: e.target.value })
                : setSurveyor({ ...surveyor, message: e.target.value })
            }
            className={`${inputClass} resize-none`}
            placeholder={
              kind === "client"
                ? "Scope, locations, timeline, and the decision the research should support."
                : "Where you have worked, the surveys you have run, and when you are available."
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
            Thank you — your enquiry has been sent. We reply within one working day.
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {sending
            ? "Sending…"
            : kind === "client"
              ? "Send project enquiry"
              : "Join the survey network"}
        </button>

        <p className="text-[11px] leading-relaxed text-fog">
          By submitting you agree that we may contact you about this enquiry. Personal data is
          used only for the agreed research purpose. We do not sell or share your details.
        </p>
      </form>
    </div>
  );
}
