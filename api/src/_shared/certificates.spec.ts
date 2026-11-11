import {
  isCertificateId,
  isCertificateType,
  isVerifiable,
  normalizeCertificateId,
  publicRecipientName,
} from "@/_shared/certificates";

describe("certificate helpers", () => {
  it("accepts well-formed certificate IDs only", () => {
    expect(isCertificateId("KV-FEL-2026-0001")).toBe(true);
    expect(isCertificateId("KV-INT-2025-0042")).toBe(true);
    expect(isCertificateId("  KV-VOL-2026-0007 ")).toBe(true);
    expect(isCertificateId("kv-fel-2026-0001")).toBe(false);
    expect(isCertificateId("KV-FEL-26-1")).toBe(false);
    expect(isCertificateId("KV-XYZ-2026-0001")).toBe(false);
    expect(isCertificateId(null)).toBe(false);
  });

  it("normalizes surrounding whitespace and casing", () => {
    expect(normalizeCertificateId("  kv-exp-2026-0002 ")).toBe("KV-EXP-2026-0002");
  });

  it("validates certificate types", () => {
    expect(isCertificateType("fellowship")).toBe(true);
    expect(isCertificateType("experience")).toBe(true);
    expect(isCertificateType("certificate")).toBe(false);
    expect(isCertificateType(7)).toBe(false);
  });

  it("treats a missing status as issued", () => {
    expect(isVerifiable(null)).toBe(true);
    expect(isVerifiable("issued")).toBe(true);
    expect(isVerifiable("revoked")).toBe(false);
  });

  it("withholds the recipient name once revoked", () => {
    expect(publicRecipientName("Ananya Priya", "issued")).toBe("Ananya Priya");
    expect(publicRecipientName("Ananya Priya", "revoked")).toBe("Withheld");
  });
});
