import { describe, expect, it } from "vitest";

import {
  FELLOWSHIP_DETAILS,
  FELLOWSHIP_NOT_PROMISED,
  FELLOWSHIP_PARENT_FAQ,
  FELLOWSHIP_SELECTION_STEPS,
} from "./fellowship-data";

describe("fellowship practical details", () => {
  it("covers the six trust and logistics areas", () => {
    expect(FELLOWSHIP_DETAILS.map((detail) => detail.id)).toEqual([
      "eligibility",
      "money",
      "location",
      "rhythm",
      "safety",
      "completion",
    ]);
    expect(FELLOWSHIP_DETAILS.every((detail) => detail.points.length > 0)).toBe(true);
  });

  it("has a four-step selection process", () => {
    expect(FELLOWSHIP_SELECTION_STEPS).toHaveLength(4);
    expect(FELLOWSHIP_SELECTION_STEPS[0].title).toBe("Register interest");
    expect(FELLOWSHIP_SELECTION_STEPS[3].title).toBe("Written offer");
  });

  it("keeps parent questions and exclusions explicit", () => {
    expect(FELLOWSHIP_PARENT_FAQ.length).toBeGreaterThanOrEqual(5);
    expect(FELLOWSHIP_NOT_PROMISED).toContain("A job or a salary.");
    expect(FELLOWSHIP_NOT_PROMISED.length).toBeGreaterThanOrEqual(4);
  });
});
