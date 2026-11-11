import { BadRequestException, NotFoundException } from "@nestjs/common";

import { SurveyorsService } from "@/modules/surveyors/surveyors.service";
import type { Database } from "@/db/drizzle/drizzle.client";

const baseRow = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Ravi Kumar",
  email: "ravi@example.com",
  phone: "+918888800000",
  location: "Warangal",
  languages: ["Telugu", "Hindi"],
  skills: [],
  experience: "3 years",
  notes: "internal only",
  status: "applied",
  verifiedAt: null as Date | null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

type Mode = { existing?: unknown[]; after?: unknown[] };

/* Chainable stub. `select` resolves `existing` (lookup), writes resolve `after`. */
const buildDb = ({ existing = [], after = [] }: Mode = {}) => {
  const calls = { inserted: [] as unknown[], updated: [] as unknown[], deleted: 0 };

  const db = {
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => existing }),
        orderBy: async () => after,
      }),
    }),
    insert: () => ({
      values: (values: unknown) => {
        calls.inserted.push(values);
        return { returning: async () => after };
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        calls.updated.push(values);
        return { where: () => ({ returning: async () => after }) };
      },
    }),
    delete: () => ({
      where: () => ({
        returning: async () => {
          calls.deleted += 1;
          return after;
        },
      }),
    }),
  };

  return { db: db as unknown as Database, calls };
};

const register = {
  name: "Ravi Kumar",
  email: "Ravi@Example.com",
  phone: "+918888800000",
  location: "Warangal",
  languages: ["Telugu", "Telugu", " Hindi "],
  experience: "3 years",
};

describe("SurveyorsService.register", () => {
  it("lowercases the email so one person cannot create two profiles", async () => {
    const { db, calls } = buildDb({ existing: [], after: [{ ...baseRow }] });
    const service = new SurveyorsService(db);

    await service.register(register);

    expect(calls.inserted[0]).toMatchObject({ email: "ravi@example.com", status: "applied" });
  });

  it("deduplicates and trims the language list", async () => {
    const { db, calls } = buildDb({ existing: [], after: [{ ...baseRow }] });
    const service = new SurveyorsService(db);

    await service.register(register);

    expect(calls.inserted[0]).toMatchObject({ languages: ["Telugu", "Hindi"] });
  });

  /* Re-registering must not reset a verified surveyor back to "applied". */
  it("updates an existing profile without touching status", async () => {
    const existing = [{ ...baseRow, status: "verified", notes: "kept" }];
    const { db, calls } = buildDb({ existing, after: [{ ...baseRow, status: "verified" }] });
    const service = new SurveyorsService(db);

    await service.register({ ...register, location: "Karimnagar" });

    expect(calls.inserted).toHaveLength(0);
    expect(calls.updated[0]).toMatchObject({ location: "Karimnagar" });
    expect(calls.updated[0]).not.toHaveProperty("status");
    expect(calls.updated[0]).not.toHaveProperty("notes");
  });

  it("rejects a blank name", async () => {
    const { db } = buildDb();
    const service = new SurveyorsService(db);

    await expect(service.register({ ...register, name: "   " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("never exposes internal notes in the public response", async () => {
    const { db } = buildDb({ existing: [], after: [{ ...baseRow }] });
    const service = new SurveyorsService(db);

    const { surveyor } = await service.register(register);

    expect(surveyor).not.toHaveProperty("notes");
    expect(surveyor).not.toHaveProperty("verifiedAt");
  });
});

describe("SurveyorsService.update", () => {
  it("stamps verifiedAt when a profile is verified", async () => {
    const { db, calls } = buildDb({
      existing: [{ ...baseRow, verifiedAt: null }],
      after: [{ ...baseRow, status: "verified", verifiedAt: new Date() }],
    });
    const service = new SurveyorsService(db);

    await service.update(baseRow.id, { status: "verified" });

    expect(calls.updated[0]).toMatchObject({ status: "verified" });
    expect((calls.updated[0] as { verifiedAt: Date }).verifiedAt).toBeInstanceOf(Date);
  });

  it("keeps the original verification date when moving verified -> active", async () => {
    const verifiedAt = new Date("2026-02-02T00:00:00.000Z");
    const { db, calls } = buildDb({
      existing: [{ ...baseRow, status: "verified", verifiedAt }],
      after: [{ ...baseRow, status: "active", verifiedAt }],
    });
    const service = new SurveyorsService(db);

    await service.update(baseRow.id, { status: "active" });

    expect((calls.updated[0] as { verifiedAt: Date }).verifiedAt).toBe(verifiedAt);
  });

  it("clears verifiedAt when a profile is rejected", async () => {
    const { db, calls } = buildDb({
      existing: [{ ...baseRow, status: "verified", verifiedAt: new Date() }],
      after: [{ ...baseRow, status: "rejected", verifiedAt: null }],
    });
    const service = new SurveyorsService(db);

    await service.update(baseRow.id, { status: "rejected" });

    expect(calls.updated[0]).toMatchObject({ status: "rejected", verifiedAt: null });
  });

  it("404s for an unknown surveyor", async () => {
    const { db } = buildDb({ existing: [] });
    const service = new SurveyorsService(db);

    await expect(service.update("missing", { status: "verified" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe("SurveyorsService.remove", () => {
  it("404s when the surveyor does not exist", async () => {
    const { db } = buildDb({ after: [] });
    const service = new SurveyorsService(db);

    await expect(service.remove("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deletes an existing surveyor", async () => {
    const { db } = buildDb({ after: [{ id: baseRow.id }] });
    const service = new SurveyorsService(db);

    await expect(service.remove(baseRow.id)).resolves.toEqual({ ok: true });
  });
});
