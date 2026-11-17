import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import type { Database } from "@/db/drizzle/drizzle.client";
import {
  CreateFellowshipApplicationDto,
  FellowshipApplicationStatusDto,
} from "@/modules/fellowship-applications/dto/fellowship-application.dto";
import { FellowshipApplicationsService } from "@/modules/fellowship-applications/fellowship-applications.service";

const validApplication = {
  name: "Test Fellow",
  email: "test@example.com",
  phone: "+919999900000",
  city: "Guntur",
  candidateStatus: "Final-year student",
  track: "Technology",
  motivation: "I want to build real products and serve my community.",
  fullTime: true,
  vipassana: true,
  fieldWork: true,
  termsAccepted: true,
};

const errorsFor = async (value: object) => {
  const dto = plainToInstance(CreateFellowshipApplicationDto, value);
  return validate(dto);
};

describe("CreateFellowshipApplicationDto", () => {
  it("accepts a complete application", async () => {
    await expect(errorsFor(validApplication)).resolves.toHaveLength(0);
  });

  it("requires a valid email and a substantive motivation", async () => {
    const emailErrors = await errorsFor({ ...validApplication, email: "bad" });
    expect(emailErrors.some((error) => error.property === "email")).toBe(true);

    const motivationErrors = await errorsFor({ ...validApplication, motivation: "short" });
    expect(motivationErrors.some((error) => error.property === "motivation")).toBe(true);
  });

  it("requires every commitment to be a boolean", async () => {
    for (const field of ["fullTime", "vipassana", "fieldWork", "termsAccepted"]) {
      const errors = await errorsFor({ ...validApplication, [field]: "yes" });
      expect(errors.some((error) => error.property === field)).toBe(true);
    }
  });
});

describe("FellowshipApplicationStatusDto", () => {
  it("accepts a generated reference and email", async () => {
    const dto = plainToInstance(FellowshipApplicationStatusDto, {
      reference: "KF-2026-AB12CD34",
      email: "test@example.com",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects a malformed reference", async () => {
    const dto = plainToInstance(FellowshipApplicationStatusDto, {
      reference: "12345",
      email: "test@example.com",
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "reference")).toBe(true);
  });
});

describe("FellowshipApplicationsService.submit", () => {
  it("rejects an application without all commitments before touching the database", async () => {
    const service = new FellowshipApplicationsService({} as Database);

    await expect(
      service.submit({
        ...validApplication,
        vipassana: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
