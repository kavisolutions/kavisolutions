import {
  DEFAULT_TEAM_GRADIENT,
  getInitials,
  isAdminEmail,
  isEmail,
  normalizeGradient,
  parseAdminEmails,
  sanitizeText,
  slugify,
} from "@/_shared/text";

describe("text helpers", () => {
  it("slugifies role names", () => {
    expect(slugify("  Core Team! ")).toBe("core-team");
    expect(slugify("")).toBe("");
  });

  it("builds initials from names", () => {
    expect(getInitials("kavitha rao")).toBe("KR");
    expect(getInitials("Prince")).toBe("P");
    expect(getInitials("  ")).toBe("");
  });

  it("trims and clamps text", () => {
    expect(sanitizeText("  hello  ", 10)).toBe("hello");
    expect(sanitizeText("abcdef", 3)).toBe("abc");
    expect(sanitizeText(42, 10)).toBe("");
  });

  it("validates gradients against the allowlist", () => {
    expect(normalizeGradient("from-sky-500 to-cyan-500")).toBe("from-sky-500 to-cyan-500");
    expect(normalizeGradient("nonsense")).toBe(DEFAULT_TEAM_GRADIENT);
  });

  it("parses and matches admin emails case-insensitively", () => {
    expect(parseAdminEmails(" A@B.com , c@d.com ")).toEqual(["a@b.com", "c@d.com"]);
    expect(isAdminEmail("A@B.com", ["a@b.com"])).toBe(true);
    expect(isAdminEmail(null, ["a@b.com"])).toBe(false);
  });

  it("validates email format", () => {
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
  });
});
