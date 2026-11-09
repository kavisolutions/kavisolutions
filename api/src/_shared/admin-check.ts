export type AdminCandidate = {
  email?: string | null;
  role?: string | null;
};

export const hasAdminRole = (role: string | null | undefined): boolean =>
  (role ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes("admin");

export const matchesAdminEmail = (
  email: string | null | undefined,
  allowlist: string[],
): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return allowlist.map((item) => item.trim().toLowerCase()).includes(normalized);
};

export const isAdminCandidate = (
  user: AdminCandidate | null | undefined,
  envEmails: string[],
  dbEmails: string[],
): boolean => {
  if (!user) return false;
  if (hasAdminRole(user.role)) return true;
  return matchesAdminEmail(user.email, envEmails) || matchesAdminEmail(user.email, dbEmails);
};
