"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  ExternalLink,
  Layers3,
  Loader2,
  Rocket,
  Send,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  count?: number | null;
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

type AdminShellProps = {
  title: string;
  subtitle?: string;
  headerIcon?: LucideIcon;
  pill?: string;
  bannerTitle: string;
  bannerDescription?: string;
  bannerIcon: LucideIcon;
  groups: AdminNavGroup[];
  activeKey?: string;
  onNavigate?: (key: string) => void;
  children: ReactNode;
  actions?: ReactNode;
  publishLabel?: string;
  onPublish?: () => void;
  publishDisabled?: boolean;
  publishBusy?: boolean;
  notificationCount?: number;
  onNotifications?: () => void;
  backHref?: string;
  liveHref?: string;
  notice?: string;
  error?: string;
};

export function AdminShell({
  title,
  subtitle,
  headerIcon: HeaderIcon = Layers3,
  pill = "Admin Console",
  bannerTitle,
  bannerDescription,
  bannerIcon: BannerIcon,
  groups,
  activeKey,
  onNavigate,
  children,
  actions,
  publishLabel = "Publish Changes",
  onPublish,
  publishDisabled = false,
  publishBusy = false,
  notificationCount = 0,
  onNotifications,
  backHref = "/admin",
  liveHref = "/survey",
  notice,
  error,
}: AdminShellProps) {
  const renderNavItem = (item: AdminNavItem) => {
    const active = activeKey === item.key;
    const className = cn(
      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all",
      active
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
    );
    const content = (
      <>
        <span className="flex min-w-0 items-center gap-3">
          <item.icon className={cn("h-4 w-4 shrink-0", active && "text-white")} />
          <span className="truncate">{item.label}</span>
        </span>
        {item.count !== undefined && item.count !== null && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
            )}
          >
            {item.count}
          </span>
        )}
      </>
    );

    if (item.href) {
      return (
        <Link key={item.key} href={item.href} aria-current={active ? "page" : undefined} className={className}>
          {content}
        </Link>
      );
    }

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => onNavigate?.(item.key)}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Layers3 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Admin Panel</p>
            <p className="truncate text-[11px] text-muted-foreground">{title}</p>
          </div>
          <Link
            href={backHref}
            title="Back to main admin"
            aria-label="Back to main admin"
            className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80 first:pt-0">
                {group.label}
              </p>
              {group.items.map(renderNavItem)}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href={liveHref}
            className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-3 py-3 transition-colors hover:border-blue-400/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Rocket className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[13px] font-semibold">Live Site</span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                View public page <ExternalLink className="h-3 w-3" />
              </span>
            </span>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <HeaderIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notice && <span className="hidden text-xs font-semibold text-emerald-600 sm:inline">{notice}</span>}
            {actions}
            {onNotifications && (
              <button
                type="button"
                onClick={onNotifications}
                title={`${notificationCount} new notifications`}
                aria-label={`${notificationCount} new notifications`}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            {onPublish && (
              <Button
                type="button"
                size="sm"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-indigo-500"
                disabled={publishDisabled || publishBusy}
                onClick={onPublish}
              >
                {publishBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {publishLabel}
              </Button>
            )}
          </div>
        </header>

        {error && (
          <div className="mx-5 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive lg:mx-8">
            {error}
          </div>
        )}

        <main className="px-5 py-6 lg:px-8">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {groups.flatMap((group) => group.items).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => (item.href ? undefined : onNavigate?.(item.key))}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  activeKey === item.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="relative mb-5 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="pointer-events-none absolute right-20 top-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 text-blue-100">
                  <BannerIcon className="h-6 w-6" />
                </span>
                <div>
                  <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold text-blue-200">
                    {pill}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">{bannerTitle}</h2>
                  {bannerDescription && <p className="mt-1 text-sm text-blue-100/70">{bannerDescription}</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">{children}</section>
        </main>
      </div>
    </div>
  );
}
