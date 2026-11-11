import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import {
  CreateCertificateDto,
  RevokeCertificateDto,
} from "@/modules/certificates/dto/certificate.dto";

type DtoClass = new () => object;

const errorsFor = async (cls: DtoClass, value: object) => {
  const dto = plainToInstance(cls, value) as object;
  return validate(dto);
};

const validCreate = {
  id: "KV-FEL-2026-0001",
  type: "fellowship",
  recipientName: "Aarav Krishna Reddy",
  issuedOn: "2026-04-10",
};

describe("certificate DTO", () => {
  it("accepts a complete create payload", async () => {
    await expect(errorsFor(CreateCertificateDto, validCreate)).resolves.toHaveLength(0);
  });

  it("normalises the id so admin payloads may use any casing", async () => {
    const dto = plainToInstance(CreateCertificateDto, {
      ...validCreate,
      id: "  kv-fel-2026-0001 ",
    });

    expect(dto.id).toBe("KV-FEL-2026-0001");
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("normalises the id on revoke too", async () => {
    const dto = plainToInstance(RevokeCertificateDto, { id: "kv-exp-2026-0002" });
    expect(dto.id).toBe("KV-EXP-2026-0002");
  });

  it("rejects an unknown type", async () => {
    const errors = await errorsFor(CreateCertificateDto, { ...validCreate, type: "certificate" });
    expect(errors.some((error) => error.property === "type")).toBe(true);
  });

  it("rejects calendar dates that do not exist", async () => {
    for (const issuedOn of ["2026-02-31", "2026-04-31", "2026-13-01"]) {
      const errors = await errorsFor(CreateCertificateDto, { ...validCreate, issuedOn });
      expect(errors.some((error) => error.property === "issuedOn")).toBe(true);
    }
  });

  it("rejects a malformed start or end date", async () => {
    const errors = await errorsFor(CreateCertificateDto, {
      ...validCreate,
      startDate: "2026-1-1",
    });
    expect(errors.some((error) => error.property === "startDate")).toBe(true);
  });
});
