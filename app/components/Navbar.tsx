"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Globe,
  Smartphone,
  Cpu,
  TrendingUp,
  Landmark,
  BarChart3,
  Layers,
  Sprout,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import MobileMenu from "./MobileMenu";
import NavAuth from "./NavAuth";
import ThemeToggle from "./ThemeToggle";

const services = [
  {
    title: "Web Systems",
    desc: "Distributed Next.js, Go microservices & high-concurrency cloud architectures",
    href: "/web",
    icon: Globe,
    tag: "Next.js & Go",
    accent: "text-[#91B4FF]",
    iconBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "Mobile Platforms",
    desc: "Native iOS & Android, offline-first sync & conflict-free mesh data structures",
    href: "/mobile",
    icon: Smartphone,
    tag: "iOS & Android",
    accent: "text-[#38BDF8]",
    iconBg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    title: "Applied AI & Deep Tech",
    desc: "Deterministic agent runners, LLM safety guardrails & ZK state verification",
    href: "/ai-blockchain",
    icon: Cpu,
    tag: "LLM & ZK",
    accent: "text-[#C084FC]",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Growth Systems",
    desc: "Programmatic SEO, attribution pipelines & compounding customer loops",
    href: "/marketing",
    icon: TrendingUp,
    tag: "Attribution",
    accent: "text-[#34D399]",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

const verticals = [
  { label: "GovTech", href: "/government", icon: Landmark },
  { label: "Research", href: "/survey", icon: BarChart3 },
  { label: "Financial", href: "/financial", icon: Layers },
  { label: "Farms", href: "/farms", icon: Sprout },
  { label: "Verify", href: "/verify", icon: ShieldCheck },
];

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/fellowship", label: "Fellowship" },
  { href: "/team", label: "Team" },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 pointer-events-none">
      <div className="mx-auto mt-4 flex max-w-[1152px] h-16 items-center justify-between gap-3 rounded-[12px] bg-[rgba(18,29,47,0.84)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.14)] px-4 sm:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] pointer-events-auto relative">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow transition-transform duration-300 group-hover:scale-105 shrink-0">
            <Image
              src="/logo.svg"
              alt="Kavi Solutions logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#F7F9FC] whitespace-nowrap">
            Kavi<span className="text-[#91B4FF]">Solutions</span>
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex xl:gap-2 shrink-0">
          {/* Services Mega Dropdown */}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors whitespace-nowrap ${
                dropdownOpen
                  ? "bg-white/10 text-[#F7F9FC]"
                  : "text-[#A5B3C7] hover:bg-white/5 hover:text-[#F7F9FC]"
              }`}
            >
              <span>Services</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-[#91B4FF]" : "text-[#7889A0]"
                }`}
              />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-3 w-[560px]"
                >
                  <div className="overflow-hidden rounded-[20px] bg-[rgba(18,29,47,0.96)] backdrop-blur-[24px] border border-[rgba(148,163,184,0.18)] p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]">
                    {/* Top gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />

                    {/* 2x2 Core Disciplines */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {services.map((s) => {
                        const Icon = s.icon;
                        return (
                          <Link
                            key={s.title}
                            href={s.href}
                            onClick={() => setDropdownOpen(false)}
                            className="group flex flex-col justify-between rounded-[14px] bg-[#151B2A]/60 hover:bg-[#19202E] border border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.25)] p-3.5 transition-all"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${s.iconBg} ${s.accent} transition-transform group-hover:scale-105`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-mono text-[10px] text-[#7889A0] uppercase tracking-wider">
                                  {s.tag}
                                </span>
                              </div>
                              <h4 className="font-display text-[14px] font-semibold text-[#F7F9FC] group-hover:text-[#91B4FF] transition-colors mb-1">
                                {s.title}
                              </h4>
                              <p className="text-[12px] leading-relaxed text-[#A5B3C7] line-clamp-2">
                                {s.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Bottom Specialized Verticals Strip */}
                    <div className="border-t border-[rgba(148,163,184,0.12)] pt-3.5">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7889A0]">
                          Specialized Verticals &amp; Public Good
                        </span>
                        <Link
                          href="/#explore"
                          onClick={() => setDropdownOpen(false)}
                          className="font-mono text-[11px] text-[#91B4FF] hover:underline inline-flex items-center gap-1"
                        >
                          All domains <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {verticals.map((v) => {
                          const VIcon = v.icon;
                          return (
                            <Link
                              key={v.label}
                              href={v.href}
                              onClick={() => setDropdownOpen(false)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium text-[#A5B3C7] hover:text-[#F7F9FC] hover:bg-white/5 transition-colors border border-transparent hover:border-[rgba(148,163,184,0.14)]"
                            >
                              <VIcon className="h-3.5 w-3.5 text-[#91B4FF]" />
                              <span>{v.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Direct Nav Links */}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-[14px] font-medium text-[#A5B3C7] transition-colors hover:bg-white/5 hover:text-[#F7F9FC] whitespace-nowrap shrink-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
            <NavAuth />
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-[#FFFFFF] text-[14px] font-medium whitespace-nowrap shrink-0 transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] focus:outline-none focus:ring-2 focus:ring-[#91B4FF] focus:ring-offset-2 focus:ring-offset-[#0B1220]"
            >
              Let&apos;s Talk
            </Link>
          </div>

          {/* Mobile & Tablet Drawer Trigger */}
          <div className="lg:hidden shrink-0">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
