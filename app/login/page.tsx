"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser, useAuth } from "@/lib/auth-context";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-violet-400/60";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function getNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") ? next : null;
}

export default function LoginPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const redirecting = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const goToDestination = useCallback(
    async (accessToken: string | undefined) => {
      const next = getNextPath();
      if (next) {
        router.push(next);
        return;
      }

      try {
        const res = await fetch("/api/me", {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const data = await res.json();
        router.push(data?.isAdmin ? "/admin" : "/team");
      } catch {
        router.push("/team");
      }
    },
    [router],
  );

  useEffect(() => {
    if (authLoading || !session || redirecting.current) return;
    redirecting.current = true;
    void goToDestination(session.access_token);
  }, [authLoading, session, goToDestination]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const { data: signInData, error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Invalid email or password"
          : signInError.message,
      );
      setLoading(false);
      return;
    }

    redirecting.current = true;
    await goToDestination(signInData.session?.access_token);
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError("");

    const next = getNextPath();
    const { error: oauthError } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login" + (next ? `?next=${encodeURIComponent(next)}` : ""),
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-8 block">
          <span className="font-display text-2xl font-semibold tracking-tight text-white">
            Kavi<span className="text-gradient">Solutions</span>
          </span>
        </Link>

        <div className="rounded-3xl glass p-8 shadow-lift">
          <h1 className="mb-2 font-display text-2xl font-bold text-white">Login</h1>
          <p className="mb-8 text-sm text-mist">
            Sign in to manage your team profile and the website.
          </p>

          <form onSubmit={handleCredentialsLogin} className="space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className={inputClass}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className={inputClass}
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-widest text-fog">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-xs text-fog">
            Team logins are created by an admin. Contact{" "}
            <a href="mailto:support@kavisolutions.in" className="text-mist hover:text-white">
              support@kavisolutions.in
            </a>{" "}
            if you need access.
          </p>
        </div>

        <Link href="/" className="mt-6 block text-xs text-mist hover:text-white">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
