"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Auth calls go to the same origin (`/api/auth/*`) and are proxied to the
 * NestJS backend by the `BACKEND_URL` rewrite in next.config.ts, so the session
 * cookie stays first-party.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
  },
});

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: string | null;
};

export type AuthSession = {
  user: AuthUser;
} | null;

type AuthContextType = {
  session: AuthSession;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();

  const session: AuthSession = data?.user
    ? { user: data.user as unknown as AuthUser }
    : null;

  return (
    <AuthContext.Provider value={{ session, loading: isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
