"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
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
  Briefcase,
  Users,
  GraduationCap,
  Mail,
  Menu,
  X,
} from "lucide-react";
import NavAuth from "./NavAuth";
import ThemeToggle from "./ThemeToggle";

const serviceLinks = [
  { href: "/web", label: "Web Systems", icon: Globe },
  { href: "/mobile", label: "Mobile Platforms", icon: Smartphone },
  { href: "/ai-blockchain", label: "Applied AI & ZK", icon: Cpu },
  { href: "/marketing", label: "Growth Systems", icon: TrendingUp },
  { href: "/government", label: "GovTech", icon: Landmark },
  { href: "/survey", label: "Survey & Research", icon: BarChart3 },
  { href: "/financial", label: "Financial Services", icon: Layers },
  { href: "/farms", label: "Kavi Farms", icon: Sprout },
];

const mainLinks = [
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/fellowship", label: "Fellowship", icon: GraduationCap },
  { href: "/team", label: "Team", icon: Users },
  { href: "/verify", label: "Verify Certificate", icon: ShieldCheck },
  { href: "/#contact", label: "Let's Talk", icon: Mail },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-[rgba(148,163,184,0.14)] text-base text-[#F7F9FC] hover:bg-white/10 transition-colors"
      >
        <Menu className="h-5 w-5 text-[#F7F9FC]" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[999] bg-[#000000cc] backdrop-blur-sm lg:hidden pointer-events-auto"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 260 }}
                  className="fixed inset-y-0 right-0 z-[1000] flex h-screen w-80 sm:w-96 flex-col justify-between overflow-y-auto rounded-l-3xl border-l border-[rgba(148,163,184,0.16)] bg-[#0B1220] p-6 shadow-2xl lg:hidden pointer-events-auto"
                >
              <div>
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow">
                      <Image
                        src="/logo.svg"
                        alt="Kavi Solutions logo"
                        width={32}
                        height={32}
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="font-display font-semibold tracking-tight text-[#F7F9FC]">
                      Kavi<span className="text-[#91B4FF]">Solutions</span>
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      onClick={() => setOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm text-[#A5B3C7] hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Services Section */}
                <div className="mb-3 rounded-[16px] bg-[#121D2F]/80 border border-[rgba(148,163,184,0.12)] p-2">
                  <button
                    type="button"
                    onClick={() => setServicesExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#91B4FF]"
                  >
                    <span>Services &amp; Verticals</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        servicesExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {servicesExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-0.5 pt-1"
                      >
                        {serviceLinks.map((s) => {
                          const Icon = s.icon;
                          return (
                            <Link
                              key={s.href}
                              href={s.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#A5B3C7] hover:bg-white/5 hover:text-[#F7F9FC] transition-colors"
                            >
                              <Icon className="h-4 w-4 text-[#91B4FF]" />
                              <span>{s.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Destination Links */}
                <div className="space-y-1">
                  {mainLinks.map((l) => {
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors ${
                          l.href === "/#contact"
                            ? "bg-[#175CD3] text-white hover:bg-[#1849A9] mt-3 justify-center shadow-[0_0_20px_rgba(23,92,211,0.35)]"
                            : "text-[#A5B3C7] hover:bg-white/5 hover:text-[#F7F9FC]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{l.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Auth */}
              <div className="mt-6 border-t border-[rgba(148,163,184,0.12)] pt-4" onClick={() => setOpen(false)}>
                <NavAuth variant="menu" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
