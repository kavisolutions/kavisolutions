import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateSurveyEnquiryDto } from "@/modules/survey/dto/survey-enquiry.dto";

const errorsFor = async (value: object) => {
  const dto = plainToInstance(CreateSurveyEnquiryDto, value);
  return validate(dto);
};

const validClient = {
  kind: "client",
  name: "Ashok Sandhyala",
  email: "ashok@example.com",
  phone: "+919999900000",
  organisation: "Kavi Solutions",
  service: "Market & brand research",
  message: "We need a brand perception study across three districts next quarter.",
};

const validSurveyor = {
  kind: "surveyor",
  name: "Ravi Kumar",
  email: "ravi@example.com",
  phone: "+918888800000",
  location: "Warangal",
  languages: "Telugu, Hindi",
  experience: "3 years of household surveys",
  message: "Available for field enumeration across Warangal and Karimnagar.",
};

describe("CreateSurveyEnquiryDto", () => {
  it("accepts a complete client enquiry", async () => {
    await expect(errorsFor(validClient)).resolves.toHaveLength(0);
  });

  it("accepts a complete surveyor registration", async () => {
    await expect(errorsFor(validSurveyor)).resolves.toHaveLength(0);
  });

  it("rejects an unknown kind", async () => {
    const errors = await errorsFor({ ...validClient, kind: "partner" });
    expect(errors.some((error) => error.property === "kind")).toBe(true);
  });

  it("requires a valid email address", async () => {
    const errors = await errorsFor({ ...validClient, email: "not-an-email" });
    expect(errors.some((error) => error.property === "email")).toBe(true);
  });

  it("rejects a one-word name", async () => {
    const errors = await errorsFor({ ...validClient, name: "A" });
    expect(errors.some((error) => error.property === "name")).toBe(true);
  });

  it("rejects an empty or too-short message", async () => {
    for (const message of ["", "too short"]) {
      const errors = await errorsFor({ ...validClient, message });
      expect(errors.some((error) => error.property === "message")).toBe(true);
    }
  });

  it("enforces length caps so a form cannot be used to send huge payloads", async () => {
    const errors = await errorsFor({ ...validClient, message: "x".repeat(2001) });
    expect(errors.some((error) => error.property === "message")).toBe(true);
  });
});
