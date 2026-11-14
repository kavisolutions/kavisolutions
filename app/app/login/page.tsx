"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TiltCard } from "@/components/motion";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#19202E]/60 px-4 py-3 text-sm text-[#F7F9FC] outline-none transition-colors placeholder:text-[#7889A0] focus:border-[#91B4FF] focus:ring-1 focus:ring-[#91B4FF]";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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

  const goToDestination = useCallback(async () => {
    const next = getNextPath();
    if (next) {
      router.push(next);
      return;
    }

    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = await res.json();
      router.push(data?.isAdmin ? "/admin" : "/team");
    } catch {
      router.push("/team");
    }
  }, [router]);

  useEffect(() => {
    if (authLoading || !session || redirecting.current) return;
    redirecting.current = true;
    void goToDestination();
  }, [authLoading, session, goToDestination]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(
        /invalid/i.test(signInError.message ?? "")
          ? "Invalid email or password"
          : signInError.message ?? "Could not sign in",
      );
      setLoading(false);
      return;
    }

    redirecting.current = true;
    await goToDestination();
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError("");

    const next = getNextPath();
    const { error: oauthError } = await authClient.signIn.social({
      provider: "google",
      callbackURL:
        window.location.origin + "/login" + (next ? `?next=${encodeURIComponent(next)}` : ""),
    });

    if (oauthError) {
      setError(oauthError.message ?? "Google sign-in is not available");
      setGoogleLoading(false);
    }
  };

  if (authLoading || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-mono text-sm text-[#7889A0]">
        Connecting to session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 pt-36 pb-20">
        <div className="w-full max-w-[448px] text-center">
          <TiltCard
            intensity={6}
            className="rounded-[32px] bg-[rgba(18,29,47,0.88)] backdrop-blur-[20px] border border-[rgba(148,163,184,0.16)] p-8 sm:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden text-left"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />

            <div className="mb-6">
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider uppercase">
                  Console Portal
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#F7F9FC] mb-2">
                Login
              </h1>
              <p className="text-sm text-[#A5B3C7] leading-relaxed">
                Sign in to manage your team profile and the website.
              </p>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-[#7889A0]">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@kavisolutions.in"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                  <Mail className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-[#7889A0]" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-[#7889A0]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className={inputClass}
                  />
                  <Lock className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-[#7889A0]" />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] disabled:opacity-60"
              >
                <span>{loading ? "Authenticating..." : "Sign in"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[rgba(148,163,184,0.14)]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#7889A0]">or</span>
              <span className="h-px flex-1 bg-[rgba(148,163,184,0.14)]" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-[12px] bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-md transition-all hover:bg-gray-100 disabled:opacity-60"
            >
              <GoogleIcon />
              <span>{googleLoading ? "Redirecting..." : "Continue with Google"}</span>
            </button>

            <div className="mt-8 pt-4 border-t border-[rgba(148,163,184,0.12)] flex items-start gap-2.5 text-xs text-[#7889A0] leading-relaxed">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#91B4FF] mt-0.5" />
              <p>
                Team logins are provisioned by an administrator. Contact{" "}
                <a href="mailto:support@kavisolutions.in" className="text-[#91B4FF] hover:underline">
                  support@kavisolutions.in
                </a>{" "}
                if you need access.
              </p>
            </div>
          </TiltCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
