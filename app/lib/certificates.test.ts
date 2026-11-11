import { describe, expect, it } from "vitest";

import {
  buildCertificateId,
  certificateTypeFromId,
  formatCertificateDate,
  formatCertificatePeriod,
  normalizeCertificateIdInput,
  retypeCertificateId,
} from "./certificates";

describe("certificate date formatting", () => {
  it("renders ISO dates the way the certificate prints them", () => {
    expect(formatCertificateDate("2026-04-03")).toBe("3 April 2026");
    expect(formatCertificateDate("2025-12-20")).toBe("20 December 2025");
    expect(formatCertificateDate("2026-01-12")).toBe("12 January 2026");
  });

  it("passes through anything that is not an ISO date", () => {
    expect(formatCertificateDate("3 April 2026")).toBe("3 April 2026");
    expect(formatCertificateDate("")).toBe("");
    expect(formatCertificateDate(null)).toBe("");
  });

  it("joins a start and end date", () => {
    expect(formatCertificatePeriod("2026-01-12", "2026-04-03")).toBe(
      "12 January 2026 — 3 April 2026",
    );
    expect(formatCertificatePeriod("2026-01-12", null)).toBe("12 January 2026");
    expect(formatCertificatePeriod(null, null)).toBe("");
  });
});

describe("certificate ID input validation", () => {
  it("accepts well-formed IDs in any casing", () => {
    expect(normalizeCertificateIdInput("KV-FEL-2026-0001")).toEqual({
      valid: true,
      id: "KV-FEL-2026-0001",
    });
    expect(normalizeCertificateIdInput("  kv-int-2025-0042 ")).toEqual({
      valid: true,
      id: "KV-INT-2025-0042",
    });
  });

  it("rejects empty and malformed input with a readable reason", () => {
    expect(normalizeCertificateIdInput("").valid).toBe(false);
    expect(normalizeCertificateIdInput("hello").valid).toBe(false);
    expect(normalizeCertificateIdInput("KV-XYZ-2026-0001").valid).toBe(false);
    expect(normalizeCertificateIdInput("KV-FEL-26-1").valid).toBe(false);
  });

  it("rejects an implausible issue year", () => {
    const result = normalizeCertificateIdInput("KV-FEL-1899-0001");
    expect(result.valid).toBe(false);
  });
});

describe("certificate type helpers", () => {
  it("derives the type from an ID prefix", () => {
    expect(certificateTypeFromId("KV-FEL-2026-0001")).toBe("fellowship");
    expect(certificateTypeFromId("kv-int-2025-0042")).toBe("internship");
    expect(certificateTypeFromId("KV-EXP-2026-0002")).toBe("experience");
    expect(certificateTypeFromId("KV-XYZ-2026-0001")).toBeNull();
    expect(certificateTypeFromId("")).toBeNull();
  });

  it("retypes the prefix but keeps year and serial", () => {
    expect(retypeCertificateId("KV-FEL-2026-0001", "INT")).toBe("KV-INT-2026-0001");
    expect(retypeCertificateId("kv-fel-2026-0001", "VOL")).toBe("KV-VOL-2026-0001");
  });

  it("does not fight a partially typed ID", () => {
    expect(retypeCertificateId("", "FEL")).toBe("");
    expect(retypeCertificateId("KV-", "FEL")).toBe("KV-");
    expect(retypeCertificateId("KV-FEL", "INT")).toBe("KV-INT");
    expect(retypeCertificateId("nonsense", "INT")).toBe("nonsense");
  });

  it("builds a padded ID", () => {
    expect(buildCertificateId("fellowship", 2026, "1")).toBe("KV-FEL-2026-0001");
    expect(buildCertificateId("mentorship", 2025, "42")).toBe("KV-MEN-2025-0042");
  });
});
