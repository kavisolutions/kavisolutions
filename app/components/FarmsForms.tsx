"use client";

import { useState } from "react";

import {
  FARM_PRODUCTS,
  FARM_SERVICE_OPTIONS,
  FARM_TRAVEL_MONTHS,
} from "@/lib/farms-data";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-lime-400/60";

const labelClass = "mb-1.5 block text-xs font-semibold text-mist";

type Kind = "product" | "tourism";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

type FarmForm = {
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  travelMonth: string;
  groupSize: string;
  service: string;
  message: string;
};

export default function FarmsForms() {
  const [kind, setKind] = useState<Kind>("product");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [form, setForm] = useState<FarmForm>({
    name: "",
    email: "",
    phone: "",
    product: FARM_PRODUCTS[0].name,
    quantity: "",
    travelMonth: FARM_TRAVEL_MONTHS[0],
    groupSize: "2",
    service: FARM_SERVICE_OPTIONS[0],
    message: "",
  });

  const sending = status.kind === "sending";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setStatus({ kind: "sending" });

    const payload =
      kind === "product"
        ? {
            kind,
            name: form.name,
            email: form.email,
            phone: form.phone,
            product: form.product,
            quantity: form.quantity,
            message: form.message,
          }
        : {
            kind,
            name: form.name,
            email: form.email,
            phone: form.phone,
            service: form.service,
            travelMonth: form.travelMonth,
            groupSize: form.groupSize,
            message: form.message,
          };

    try {
      const res = await fetch("/api/farms/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
        setStatus({
          kind: "error",
          message: message || "Could not send your enquiry. Please email us directly.",
        });
        return;
      }

      setStatus({ kind: "sent" });
      setForm({
        name: "",
        email: "",
        phone: "",
        product: FARM_PRODUCTS[0].name,
        quantity: "",
        travelMonth: FARM_TRAVEL_MONTHS[0],
        groupSize: "2",
        service: FARM_SERVICE_OPTIONS[0],
        message: "",
      });
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
            { id: "product", label: "Farm products" },
            { id: "tourism", label: "Village visit" },
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
                ? "bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-sm"
                : "text-mist hover:bg-white/5 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {status.kind === "sent" && (
        <p className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
          Thank you — your enquiry has been sent. We will confirm availability by email or phone.
        </p>
      )}
      {status.kind === "error" && (
        <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {status.message}
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="farm-name">
              Full name *
            </label>
            <input
              id="farm-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="farm-email">
              Email *
            </label>
            <input
              id="farm-email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="farm-phone">
            Phone *
          </label>
          <input
            id="farm-phone"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="+91 …"
          />
        </div>

        {kind === "product" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="farm-product">
                Product
              </label>
              <select
                id="farm-product"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className={inputClass}
              >
                {FARM_PRODUCTS.map((product) => (
                  <option key={product.slug} value={product.name} className="bg-ink-soft">
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="farm-quantity">
                Quantity
              </label>
              <input
                id="farm-quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={inputClass}
                placeholder="e.g. 10 kg / 2 boxes"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="farm-month">
                  Preferred month
                </label>
                <select
                  id="farm-month"
                  value={form.travelMonth}
                  onChange={(e) => setForm({ ...form, travelMonth: e.target.value })}
                  className={inputClass}
                >
                  {FARM_TRAVEL_MONTHS.map((month) => (
                    <option key={month} value={month} className="bg-ink-soft">
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="farm-group">
                  Group size
                </label>
                <input
                  id="farm-group"
                  type="number"
                  min={1}
                  max={40}
                  value={form.groupSize}
                  onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="farm-service">
                Experience
              </label>
              <select
                id="farm-service"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className={inputClass}
              >
                {FARM_SERVICE_OPTIONS.map((service) => (
                  <option key={service} value={service} className="bg-ink-soft">
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className={labelClass} htmlFor="farm-message">
            Message *
          </label>
          <textarea
            id="farm-message"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={inputClass}
            placeholder="Tell us what you need, your dates or any dietary/access requirements."
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-[11px] leading-relaxed text-fog">
          By submitting you agree that we may contact you about this enquiry. Product availability
          and package contribution are confirmed before booking.
        </p>
      </form>
    </div>
  );
}
