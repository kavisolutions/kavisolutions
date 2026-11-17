/** Eleven months mapped to the five fellowship phases. */
export const FELLOWSHIP_MONTH_PHASE = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4] as const;

export const FELLOWSHIP_MONTH_COUNT = FELLOWSHIP_MONTH_PHASE.length;

export function phaseIndexForMonth(month: number): number {
  const index = Math.min(
    Math.max(Math.trunc(month) - 1, 0),
    FELLOWSHIP_MONTH_PHASE.length - 1,
  );

  return FELLOWSHIP_MONTH_PHASE[index];
}
