"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useAuth } from "@/lib/auth-context";

type Me = { isAdmin: boolean; member: { id: string } | null };

export default function NavAuth({ variant = "desktop" }: { variant?: "desktop" | "menu" }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      setMe(await res.json());
    } catch {
      setMe({ isAdmin: false, member: null });
    }
  }, []);

  const initialize = useCallback(
    async (hasSession: boolean) => {
      if (!hasSession) return;
      await load();
    },
    [load],
  );

  useEffect(() => {
    if (loading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after awaits
    void initialize(Boolean(session));
  }, [loading, session, initialize]);

  const handleSignOut = async () => {
    await authClient.signOut();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kavi_bearer_token");
    }
    router.push("/");
    router.refresh();
  };

  const itemClass =
    variant === "menu"
      ? "block rounded-xl px-4 py-3 text-base font-medium text-mist transition-colors hover:bg-white/5 hover:text-white"
      : "rounded-xl bg-white/5 px-3.5 py-2 text-sm font-semibold text-mist transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap shrink-0";

  if (loading) return null;

  if (!session) {
    return (
      <Link href="/login" className={itemClass}>
        Login
      </Link>
    );
  }

  return (
    <div className={variant === "menu" ? "flex flex-col gap-1" : "flex items-center gap-2 shrink-0"}>
      <Link href="/dashboard" className={itemClass}>
        Dashboard
      </Link>
      {me?.isAdmin === true && (
        <Link href="/admin" className={itemClass}>
          Admin Panel
        </Link>
      )}
      <button onClick={handleSignOut} className={itemClass}>
        Logout
      </button>
    </div>
  );
}
