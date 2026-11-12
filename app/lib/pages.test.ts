import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isPageEnabled, pageVisibility } from "./pages";

const json = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }) as Response;

describe("pageVisibility", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://api.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads the switches from the API", async () => {
    const fetchMock = vi.fn(async () =>
      json({ pages: { survey: true, financial: false, government: false, farms: false } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(pageVisibility()).resolves.toEqual({ survey: true, financial: false, government: false, farms: false });
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/pages", { cache: "no-store" });
  });

  /* A missing or malformed payload must hide the pages, never publish them. */
  it("defaults to hidden when the payload is unexpected", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({})));

    await expect(pageVisibility()).resolves.toEqual({ survey: false, financial: false, government: false, farms: false });
  });

  it("fails closed when the API errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(null, { ok: false, status: 500 })));

    await expect(pageVisibility()).resolves.toEqual({ survey: false, financial: false, government: false, farms: false });
  });

  it("fails closed when the API is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );

    await expect(pageVisibility()).resolves.toEqual({ survey: false, financial: false, government: false, farms: false });
  });

  it("fails closed when no backend URL is configured", async () => {
    vi.stubEnv("BACKEND_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(pageVisibility()).resolves.toEqual({ survey: false, financial: false, government: false, farms: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves a single page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ pages: { survey: false, financial: true, government: false, farms: false } })));

    await expect(isPageEnabled("financial")).resolves.toBe(true);
    await expect(isPageEnabled("survey")).resolves.toBe(false);
  });
});
