import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateGovernmentEnquiryDto } from "@/modules/government/dto/government-enquiry.dto";

const errorsFor = async (value: object) => {
  const dto = plainToInstance(CreateGovernmentEnquiryDto, value);
  return validate(dto);
};

const valid = {
  name: "Ashok Sandhyala",
  email: "ashok@example.gov.in",
  phone: "+919999900000",
  organisation: "Department of Technical Education",
  role: "Government department",
  portal: "https://example.gov.in",
  service: "Examination or admission portal",
  message: "We need an assessment of the counselling and allotment journey.",
};

describe("CreateGovernmentEnquiryDto", () => {
  it("accepts a complete enquiry", async () => {
    await expect(errorsFor(valid)).resolves.toHaveLength(0);
  });

  it("requires an organisation", async () => {
    const errors = await errorsFor({ ...valid, organisation: undefined });
    expect(errors.some((e) => e.property === "organisation")).toBe(true);
  });

  it("requires a valid email", async () => {
    const errors = await errorsFor({ ...valid, email: "nope" });
    expect(errors.some((e) => e.property === "email")).toBe(true);
  });

  it("caps the message length", async () => {
    const errors = await errorsFor({ ...valid, message: "x".repeat(2001) });
    expect(errors.some((e) => e.property === "message")).toBe(true);
  });

  it("rejects a one-character name", async () => {
    const errors = await errorsFor({ ...valid, name: "A" });
    expect(errors.some((e) => e.property === "name")).toBe(true);
  });
});
