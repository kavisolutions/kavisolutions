import { describe, expect, it } from "vitest";

import { FELLOWSHIP_PHASES } from "./fellowship-data";
import {
  FELLOWSHIP_MONTH_COUNT,
  FELLOWSHIP_MONTH_PHASE,
  phaseIndexForMonth,
} from "./fellowship-journey";

describe("fellowship journey mapping", () => {
  it("covers all eleven months", () => {
    expect(FELLOWSHIP_MONTH_COUNT).toBe(11);
    expect(FELLOWSHIP_MONTH_PHASE).toHaveLength(11);
  });

  it("maps months to existing phases in order", () => {
    expect(FELLOWSHIP_MONTH_PHASE[0]).toBe(0);
    expect(FELLOWSHIP_MONTH_PHASE[10]).toBe(FELLOWSHIP_PHASES.length - 1);

    for (const phase of FELLOWSHIP_MONTH_PHASE) {
      expect(FELLOWSHIP_PHASES[phase]).toBeDefined();
    }

    for (let index = 1; index < FELLOWSHIP_MONTH_PHASE.length; index += 1) {
      expect(FELLOWSHIP_MONTH_PHASE[index]).toBeGreaterThanOrEqual(
        FELLOWSHIP_MONTH_PHASE[index - 1],
      );
    }
  });

  it("clamps out-of-range months", () => {
    expect(phaseIndexForMonth(0)).toBe(0);
    expect(phaseIndexForMonth(1)).toBe(0);
    expect(phaseIndexForMonth(11)).toBe(4);
    expect(phaseIndexForMonth(99)).toBe(4);
  });
});
