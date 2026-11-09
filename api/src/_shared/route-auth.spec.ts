import { authDecision, resolveRouteAuthMode } from "@/_shared/route-auth";

describe("route auth resolution", () => {
  it("admin-only wins over public", () => {
    expect(resolveRouteAuthMode({ isPublic: true, isOptional: false, isAdminOnly: true })).toBe(
      "admin",
    );
  });

  it("resolves public and optional modes", () => {
    expect(resolveRouteAuthMode({ isPublic: true, isOptional: false, isAdminOnly: false })).toBe(
      "public",
    );
    expect(resolveRouteAuthMode({ isPublic: false, isOptional: true, isAdminOnly: false })).toBe(
      "optional",
    );
    expect(resolveRouteAuthMode({ isPublic: false, isOptional: false, isAdminOnly: false })).toBe(
      "authenticated",
    );
  });

  it("allows anonymous access to public and optional routes", () => {
    expect(authDecision("public", { hasUser: false, isAdmin: false })).toBe("allow");
    expect(authDecision("optional", { hasUser: false, isAdmin: false })).toBe("allow");
  });

  it("rejects anonymous access to protected routes", () => {
    expect(authDecision("authenticated", { hasUser: false, isAdmin: false })).toBe("unauthorized");
    expect(authDecision("admin", { hasUser: false, isAdmin: false })).toBe("unauthorized");
  });

  it("blocks non-admins from admin routes", () => {
    expect(authDecision("admin", { hasUser: true, isAdmin: false })).toBe("forbidden");
    expect(authDecision("admin", { hasUser: true, isAdmin: true })).toBe("allow");
    expect(authDecision("authenticated", { hasUser: true, isAdmin: false })).toBe("allow");
  });
});
