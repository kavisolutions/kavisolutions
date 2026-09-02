"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/web", label: "Web" },
  { href: "/mobile", label: "Mobile" },
  { href: "/product", label: "Product" },
  { href: "/marketing", label: "Marketing" },
  { href: "/fellowship", label: "Fellowship" },
  { href: "/#team", label: "Team" },
  { href: "/#contact", label: "Contact" },
  { href: "/team", label: "Team Admin" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-1.5 p-2 md:hidden"
        aria-label="Open menu"
      >
        <span className="h-0.5 w-6 rounded bg-white" />
        <span className="h-0.5 w-6 rounded bg-white" />
        <span className="h-0.5 w-6 rounded bg-white" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col gap-2 rounded-l-3xl bg-ink-soft/95 p-6 backdrop-blur-xl md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow">
                    <Image
                      src="/logo.svg"
                      alt="Kavi Solutions logo"
                      width={32}
                      height={32}
                      className="h-full w-full"
                    />
                  </span>
                  <span className="font-display font-semibold tracking-tight">
                    Kavi<span className="text-gradient">Solutions</span>
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-mist transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}