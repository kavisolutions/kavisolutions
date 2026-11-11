import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateFinancialEnquiryDto } from "@/modules/financial/dto/financial-enquiry.dto";

const errorsFor = async (value: object) => {
  const dto = plainToInstance(CreateFinancialEnquiryDto, value);
  return validate(dto);
};

const valid = {
  kind: "individual",
  name: "Ashok Sandhyala",
  email: "ashok@example.com",
  phone: "+919999900000",
  service: "ITR filing",
  message: "Need help with this year's return and next year's planning.",
};

describe("CreateFinancialEnquiryDto", () => {
  it("accepts an individual enquiry", async () => {
    await expect(errorsFor(valid)).resolves.toHaveLength(0);
  });

  it("accepts a business enquiry", async () => {
    await expect(
      errorsFor({
        ...valid,
        kind: "business",
        organisation: "Kavi Labs",
        entityType: "Private Limited",
        financialYear: undefined,
      }),
    ).resolves.toHaveLength(0);
  });

  it("rejects an unknown kind", async () => {
    const errors = await errorsFor({ ...valid, kind: "startup" });
    expect(errors.some((e) => e.property === "kind")).toBe(true);
  });

  it("requires a valid email", async () => {
    const errors = await errorsFor({ ...valid, email: "nope" });
    expect(errors.some((e) => e.property === "email")).toBe(true);
  });

  /* The form is a lead channel, not a document intake, so the payload is kept
     short on purpose. */
  it("caps the message length", async () => {
    const errors = await errorsFor({ ...valid, message: "x".repeat(2001) });
    expect(errors.some((e) => e.property === "message")).toBe(true);
  });

  it("requires a message of at least ten characters", async () => {
    const errors = await errorsFor({ ...valid, message: "too short" });
    expect(errors.some((e) => e.property === "message")).toBe(true);
  });

  it("rejects a one-character name", async () => {
    const errors = await errorsFor({ ...valid, name: "A" });
    expect(errors.some((e) => e.property === "name")).toBe(true);
  });
});
