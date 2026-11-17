"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function FellowshipScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      data-fellowship-scroll-progress=""
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[65] h-[2px] origin-left bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#68FCBF] shadow-[0_0_12px_rgba(59,130,246,0.65)]"
    />
  );
}
