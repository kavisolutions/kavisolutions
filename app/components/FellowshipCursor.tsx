"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, summary, input, textarea, select, [role='button']";

export default function FellowshipCursor() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);

  const auraX = useSpring(x, { stiffness: 55, damping: 18, mass: 0.7 });
  const auraY = useSpring(y, { stiffness: 55, damping: 18, mass: 0.7 });
  const ringX = useSpring(x, { stiffness: 190, damping: 24, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 190, damping: 24, mass: 0.35 });
  const dotX = useSpring(x, { stiffness: 900, damping: 42, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 900, damping: 42, mass: 0.2 });

  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setInteractive(
        event.target instanceof Element &&
          Boolean(event.target.closest(INTERACTIVE_SELECTOR)),
      );
    };

    const hide = () => setVisible(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, [x, y]);

  return (
    <div
      aria-hidden="true"
      data-fellowship-cursor=""
      className="pointer-events-none fixed inset-0 z-[70] hidden overflow-hidden [@media(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:block"
    >
      <motion.div
        style={{ x: auraX, y: auraY, opacity: visible ? 1 : 0 }}
        className="absolute left-0 top-0 -ml-40 -mt-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.16),rgba(6,182,212,0.06)_46%,transparent_70%)] blur-[6px] transition-opacity duration-500"
      />
      <motion.div
        data-fellowship-cursor-ring=""
        animate={{ scale: interactive ? 1.8 : 1, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ x: ringX, y: ringY }}
        className="absolute left-0 top-0 -ml-[18px] -mt-[18px] h-9 w-9 rounded-full border border-[#91B4FF]/60 shadow-[0_0_18px_-4px_rgba(59,130,246,0.8)]"
      >
        <span className="absolute inset-[9px] rounded-full border border-[#91B4FF]/25" />
      </motion.div>
      <motion.div
        animate={{ scale: interactive ? 0.45 : 1, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        style={{ x: dotX, y: dotY }}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#D6E4FF] shadow-[0_0_10px_#3B82F6]"
      />
    </div>
  );
}
