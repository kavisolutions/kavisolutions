import {
  hasAdminRole,
  isAdminCandidate,
  matchesAdminEmail,
} from "@/_shared/admin-check";

describe("admin checks", () => {
  it("matches env admin emails case-insensitively", () => {
    expect(matchesAdminEmail("ADMIN@example.com", ["admin@example.com"])).toBe(true);
    expect(matchesAdminEmail("x@y.com", ["admin@example.com"])).toBe(false);
    expect(matchesAdminEmail(null, ["admin@example.com"])).toBe(false);
  });

  it("matches the better-auth admin role in a comma-separated list", () => {
    expect(hasAdminRole("admin")).toBe(true);
    expect(hasAdminRole("user, admin")).toBe(true);
    expect(hasAdminRole("user")).toBe(false);
    expect(hasAdminRole(null)).toBe(false);
  });

  it("combines role, env and db allowlists", () => {
    expect(isAdminCandidate({ email: "a@b.com", role: "admin" }, [], [])).toBe(true);
    expect(isAdminCandidate({ email: "a@b.com" }, ["a@b.com"], [])).toBe(true);
    expect(isAdminCandidate({ email: "a@b.com" }, [], ["A@B.com"])).toBe(true);
    expect(isAdminCandidate({ email: "a@b.com", role: "user" }, ["c@d.com"], [])).toBe(false);
    expect(isAdminCandidate(null, ["a@b.com"], [])).toBe(false);
  });
});
