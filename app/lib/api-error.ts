/** Extract a human message from a NestJS error body.
 * Nest returns `{ message, error, statusCode }` where `message` is the real
 * text (string or validation array) and `error` is only the HTTP label
 * ("Bad Request", "Forbidden", …). */
export function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const record = body as { message?: unknown; error?: unknown };
  if (Array.isArray(record.message)) {
    const joined = record.message.filter((item) => typeof item === "string").join(", ");
    if (joined) return joined;
  }
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }
  return fallback;
}
