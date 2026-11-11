/* Date helpers for the media plan.

   The scheduler runs in the configured timezone (Asia/Kolkata by default), so
   "today" must be computed there and not from the server's local clock. All
   stored dates are plain YYYY-MM-DD strings — no time component, no offsets,
   which keeps date comparisons in SQL simple. */

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayInTimeZone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

/* Filenames are the only metadata Drive gives us for free, so accept the
   common year-first and day-first spellings. Ambiguous DD/MM vs MM/DD is
   resolved as day-first, which matches the folder naming used here. */
export function parseDateFromName(name: string): string | null {
  const yearFirst = /(20\d{2})[-_. ]?(0[1-9]|1[0-2])[-_. ]?(0[1-9]|[12]\d|3[01])/.exec(name);
  if (yearFirst) {
    const value = `${yearFirst[1]}-${yearFirst[2]}-${yearFirst[3]}`;
    if (isValidDate(value)) return value;
  }

  const dayFirst = /(0[1-9]|[12]\d|3[01])[-_. ](0[1-9]|1[0-2])[-_. ](20\d{2})/.exec(name);
  if (dayFirst) {
    const value = `${dayFirst[3]}-${dayFirst[2]}-${dayFirst[1]}`;
    if (isValidDate(value)) return value;
  }

  return null;
}

export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
