import { describe, expect, it } from "vitest";
import {
  getInitials,
  isAdminEmail,
  isEmail,
  normalizeGradient,
  parseAdminEmails,
  sanitizeText,
  DEFAULT_TEAM_GRADIENT,
  TEAM_GRADIENTS,
} from "./team";

describe("team helpers", () => {
  it("parses admin email allowlists", () => {
    expect(parseAdminEmails(" A@b.com, c@d.com ,, ")).toEqual(["a@b.com", "c@d.com"]);
    expect(parseAdminEmails(undefined)).toEqual([]);
  });

  it("checks admin emails case-insensitively", () => {
    const admins = parseAdminEmails("kavitha@kavisolutions.in,tejasimma36@gmail.com");
    expect(isAdminEmail("Tejasimma36@Gmail.com", admins)).toBe(true);
    expect(isAdminEmail("someone@else.com", admins)).toBe(false);
    expect(isAdminEmail(null, admins)).toBe(false);
  });

  it("builds initials from names", () => {
    expect(getInitials("Simma Tejeswararao")).toBe("ST");
    expect(getInitials("  Kavitha  ")).toBe("K");
    expect(getInitials("")).toBe("");
  });

  it("sanitizes text with max length", () => {
    expect(sanitizeText("  hello  ", 10)).toBe("hello");
    expect(sanitizeText("hello world", 5)).toBe("hello");
    expect(sanitizeText(42, 10)).toBe("");
  });

  it("only accepts known gradients", () => {
    expect(normalizeGradient(TEAM_GRADIENTS[2])).toBe(TEAM_GRADIENTS[2]);
    expect(normalizeGradient("from-evil to-evil")).toBe(DEFAULT_TEAM_GRADIENT);
    expect(normalizeGradient(undefined)).toBe(DEFAULT_TEAM_GRADIENT);
  });

  it("validates emails", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
  });
});
