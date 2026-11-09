import { isLiveLinkType, validateLinks } from "@/_shared/projects";

describe("project link validation", () => {
  it("requires app link for app projects", () => {
    expect(validateLinks("app", "", "https://x")).toBe(
      "App link is required for App projects",
    );
  });

  it("requires web link for web projects", () => {
    expect(validateLinks("web", "https://x", "")).toBe(
      "Web link is required for Web projects",
    );
  });

  it("requires both links for both projects", () => {
    expect(validateLinks("both", "https://x", "")).toBe(
      "Web link is required when Both is selected",
    );
    expect(validateLinks("both", "", "https://x")).toBe(
      "App link is required when Both is selected",
    );
  });

  it("accepts valid link combinations", () => {
    expect(validateLinks("app", "https://x", "")).toBeNull();
    expect(validateLinks("web", "", "https://x")).toBeNull();
    expect(validateLinks("both", "https://x", "https://y")).toBeNull();
  });

  it("knows the allowed link types", () => {
    expect(isLiveLinkType("app")).toBe(true);
    expect(isLiveLinkType("web")).toBe(true);
    expect(isLiveLinkType("both")).toBe(true);
    expect(isLiveLinkType("tv")).toBe(false);
  });
});
