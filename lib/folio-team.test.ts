import { describe, expect, it } from "vitest";
import {
  buildFolioApiUrl,
  isAdminEmail,
  isValidFolioToken,
  normalizeFolioTeam,
  normalizeTeamSlug,
  parseAdminEmails,
} from "./folio-team";

describe("parseAdminEmails", () => {
  it("parses comma-separated lists", () => {
    expect(parseAdminEmails(" A@B.com , c@d.com ")).toEqual(["a@b.com", "c@d.com"]);
  });

  it("returns an empty list when unset", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
    expect(parseAdminEmails("")).toEqual([]);
  });
});

describe("isAdminEmail", () => {
  const admins = ["kavitha@kavisolutions.in", "tejasimma36@gmail.com"];

  it("matches case-insensitively", () => {
    expect(isAdminEmail("Kavitha@KaviSolutions.in", admins)).toBe(true);
  });

  it("rejects non-admins and missing emails", () => {
    expect(isAdminEmail("someone@else.com", admins)).toBe(false);
    expect(isAdminEmail(null, admins)).toBe(false);
    expect(isAdminEmail("kavitha@kavisolutions.in", [])).toBe(false);
  });
});

describe("isValidFolioToken", () => {
  it("accepts folio_ tokens with 64 hex characters", () => {
    expect(isValidFolioToken(`folio_${"a".repeat(64)}`)).toBe(true);
    expect(isValidFolioToken(`folio_${"A1b2".repeat(16)}`)).toBe(true);
  });

  it("rejects malformed tokens", () => {
    expect(isValidFolioToken("")).toBe(false);
    expect(isValidFolioToken("folio_short")).toBe(false);
    expect(isValidFolioToken(`team_${"a".repeat(64)}`)).toBe(false);
    expect(isValidFolioToken(`folio_${"z".repeat(64)}`)).toBe(false);
  });
});

describe("normalizeTeamSlug", () => {
  it("trims and lowercases", () => {
    expect(normalizeTeamSlug("  AST ")).toBe("ast");
  });
});

describe("buildFolioApiUrl", () => {
  it("builds team and list URLs", () => {
    expect(buildFolioApiUrl("https://portfoli.store/", "ast")).toBe(
      "https://portfoli.store/api/team?slug=ast",
    );
    expect(buildFolioApiUrl("https://portfoli.store", "my team")).toBe(
      "https://portfoli.store/api/team?slug=my%20team",
    );
    expect(buildFolioApiUrl("https://portfoli.store/")).toBe("https://portfoli.store/api/team");
  });
});

describe("normalizeFolioTeam", () => {
  const validPayload = {
    id: "team-1",
    slug: "ast",
    name: "AST",
    tagline: "We build apps",
    description: null,
    logo: null,
    portfolioUrl: "https://portfoli.store/t/ast",
    memberCount: 2,
    projectsCount: 5,
    members: [
      {
        id: "u1",
        username: "teja",
        name: "Teja",
        photo: null,
        role: "owner",
        title: "CEO",
        jobRole: "Developer",
        type: "user",
        profileUrl: "https://portfoli.store/u/teja",
      },
      { id: "u2", username: "ghost", name: "", role: "member" },
    ],
  };

  it("normalizes a valid payload", () => {
    const team = normalizeFolioTeam(validPayload);

    expect(team).not.toBeNull();
    expect(team?.slug).toBe("ast");
    expect(team?.projectsCount).toBe(5);
    expect(team?.members).toHaveLength(2);
    expect(team?.members[0].role).toBe("owner");
    expect(team?.members[0].title).toBe("CEO");
    expect(team?.members[1].name).toBe("ghost");
    expect(team?.members[1].title).toBeNull();
    expect(team?.members[1].profileUrl).toBeNull();
    expect(team?.members[1].jobRole).toBeNull();
  });

  it("returns null when required fields are missing", () => {
    expect(normalizeFolioTeam(null)).toBeNull();
    expect(normalizeFolioTeam({ slug: "ast" })).toBeNull();
    expect(normalizeFolioTeam({ name: "AST" })).toBeNull();
  });

  it("falls back to sensible defaults", () => {
    const team = normalizeFolioTeam({ slug: "ast", name: "AST" });

    expect(team?.memberCount).toBe(0);
    expect(team?.projectsCount).toBe(0);
    expect(team?.members).toEqual([]);
    expect(team?.portfolioUrl).toBe("https://portfoli.store/t/ast");
  });

  it("filters malformed members", () => {
    const team = normalizeFolioTeam({
      slug: "ast",
      name: "AST",
      members: [null, "nope", { id: "u1", username: "ok", name: "Ok" }],
    });

    expect(team?.members).toHaveLength(1);
    expect(team?.members[0].username).toBe("ok");
  });
});
