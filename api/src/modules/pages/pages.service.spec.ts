import { BadRequestException } from "@nestjs/common";

import type { Database } from "@/db/drizzle/drizzle.client";
import {
  PAGE_SETTING_KEYS,
  PagesService,
  type PagesPayload,
} from "@/modules/pages/pages.service";

type Row = { key: string; value: string | null };

/* Minimal stand-in for the drizzle client. The service only ever reads by key
   list and upserts single rows, so an in-memory map is enough and keeps the
   tests free of a database. */
const build = (seed: Row[] = []) => {
  const store = new Map(seed.map((row) => [row.key, row.value]));

  const db = {
    select: () => ({
      from: () => ({
        where: async () =>
          [...store.entries()].map(([key, value]) => ({ key, value, updatedAt: new Date() })),
      }),
    }),
    insert: () => ({
      values: (row: Row) => ({
        onConflictDoUpdate: async () => {
          store.set(row.key, row.value);
        },
      }),
    }),
  };

  return { service: new PagesService(db as unknown as Database), store };
};

describe("PagesService", () => {
  it("treats missing settings as hidden", async () => {
    const { service } = build();

    await expect(service.get()).resolves.toEqual({
      pages: { survey: false, financial: false, government: false, farms: false },
    });
  });

  it("reads the stored switches", async () => {
    const { service } = build([
      { key: PAGE_SETTING_KEYS.survey, value: "true" },
      { key: PAGE_SETTING_KEYS.financial, value: "false" },
    ]);

    await expect(service.get()).resolves.toEqual({
      pages: { survey: true, financial: false, government: false, farms: false },
    });
  });

  /* A row written by an older version, or a truncated write, must not publish
     a page just because it is non-empty. */
  it("treats an unrecognised stored value as hidden", async () => {
    const { service } = build([{ key: PAGE_SETTING_KEYS.survey, value: "yes" }]);

    const { pages } = await service.get();
    expect(pages.survey).toBe(false);
  });

  it("publishes one page without touching the other", async () => {
    const { service, store } = build([
      { key: PAGE_SETTING_KEYS.survey, value: "false" },
      { key: PAGE_SETTING_KEYS.financial, value: "true" },
    ]);

    await expect(service.update({ survey: true })).resolves.toEqual({
      pages: { survey: true, financial: true, government: false, farms: false },
    });
    expect(store.get(PAGE_SETTING_KEYS.financial)).toBe("true");
  });

  it("unpublishes a page", async () => {
    const { service } = build([{ key: PAGE_SETTING_KEYS.survey, value: "true" }]);

    await expect(service.update({ survey: false })).resolves.toEqual({
      pages: { survey: false, financial: false, government: false, farms: false },
    });
  });

  it("rejects a non-boolean value", async () => {
    const { service, store } = build();

    await expect(service.update({ survey: "true" })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(store.size).toBe(0);
  });

  it("rejects an empty update", async () => {
    const { service } = build();

    await expect(service.update({})).rejects.toBeInstanceOf(BadRequestException);
  });

  /* Unknown keys must not be persisted: this endpoint is admin-only, but a
     typo should fail loudly instead of writing a row nothing reads. */
  it("rejects an update that names no known page", async () => {
    const { service, store } = build();

    await expect(
      service.update({ pricing: true } as unknown as PagesPayload),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(store.size).toBe(0);
  });
});
