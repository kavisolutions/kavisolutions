"use client";

import { useEffect, useState } from "react";

/* Public pages read the admin-managed support address from the backend.
   The static fallback keeps every surface useful if the API is down. */

export const DEFAULT_SUPPORT_EMAIL = "support@kavisolutions.in";

let cachedEmail: string | null = null;
let pending: Promise<string> | null = null;

export const loadSupportEmail = (): Promise<string> => {
  if (cachedEmail) return Promise.resolve(cachedEmail);
  if (!pending) {
    pending = fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { supportEmail?: unknown } | null) => {
        const value = data?.supportEmail;
        const email =
          typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
            ? value.trim()
            : DEFAULT_SUPPORT_EMAIL;
        cachedEmail = email;
        return email;
      })
      .catch(() => DEFAULT_SUPPORT_EMAIL)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

/* Shared by all public surfaces. The promise is cached, so mounting ten
   components still makes one request. */
export function useSupportEmail(): string {
  const [email, setEmail] = useState<string>(cachedEmail ?? DEFAULT_SUPPORT_EMAIL);

  useEffect(() => {
    let active = true;
    void loadSupportEmail().then((value) => {
      if (active) setEmail(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return email;
}
