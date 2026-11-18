import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateFellowshipAlumniDto } from "@/modules/fellowship-alumni/dto/fellowship-alumni.dto";
import { UpsertFellowshipOnboardingDto } from "@/modules/fellowship-onboarding/dto/fellowship-onboarding.dto";

describe("UpsertFellowshipOnboardingDto", () => {
  it("accepts booleans, contacts and notes", async () => {
    const dto = plainToInstance(UpsertFellowshipOnboardingDto, {
      idVerified: true,
      educationVerified: true,
      emergencyContact: "Parent · 9000000000",
      medicalNotes: "None declared",
      codeOfConduct: true,
      poshAck: true,
      mediaConsent: true,
      deviceNeeds: "Laptop",
      baselineDone: true,
      vipassanaAck: true,
      notes: "Induction complete.",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects non-boolean checklist values", async () => {
    const dto = plainToInstance(UpsertFellowshipOnboardingDto, {
      idVerified: "yes",
      poshAck: 1,
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "idVerified")).toBe(true);
    expect(errors.some((error) => error.property === "poshAck")).toBe(true);
  });
});

describe("CreateFellowshipAlumniDto", () => {
  it("accepts a destination and consent flags", async () => {
    const dto = plainToInstance(CreateFellowshipAlumniDto, {
      name: "Alumni Fellow",
      email: "alumni@example.com",
      cohort: "2027-A",
      track: "Technology",
      destinationType: "job",
      organisation: "Example",
      role: "Associate",
      outcome6m: "Joined a product team",
      outcome12m: "Leading a small project",
      mentorWilling: true,
      testimonialConsent: true,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("requires a name and valid email", async () => {
    const dto = plainToInstance(CreateFellowshipAlumniDto, {
      name: "A",
      email: "bad",
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "name")).toBe(true);
    expect(errors.some((error) => error.property === "email")).toBe(true);
  });
});
