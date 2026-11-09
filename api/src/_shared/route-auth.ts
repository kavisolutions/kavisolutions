export type RouteAuthMode = "public" | "optional" | "admin" | "authenticated";

export const resolveRouteAuthMode = (flags: {
  isPublic: boolean;
  isOptional: boolean;
  isAdminOnly: boolean;
}): RouteAuthMode => {
  if (flags.isAdminOnly) return "admin";
  if (flags.isPublic) return "public";
  if (flags.isOptional) return "optional";
  return "authenticated";
};

export const authDecision = (
  mode: RouteAuthMode,
  state: { hasUser: boolean; isAdmin: boolean },
): "allow" | "unauthorized" | "forbidden" => {
  if (mode === "public" || mode === "optional") return "allow";
  if (!state.hasUser) return "unauthorized";
  if (mode === "admin" && !state.isAdmin) return "forbidden";
  return "allow";
};
