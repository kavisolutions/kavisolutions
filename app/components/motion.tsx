"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Box, Sparkles } from "lucide-react";

interface ThreeDContextType {
  is3DMode: boolean;
  toggle3DMode: () => void;
}

const ThreeDContext = createContext<ThreeDContextType>({
  is3DMode: true,
  toggle3DMode: () => {},
});

export function ThreeDProvider({ children }: { children: ReactNode }) {
  const [is3DMode, setIs3DMode] = useState<boolean>(true);

  useEffect(() => {
    try {
      // 3D mode is on by default across the application
      const stored = localStorage.getItem("kavi_3d_mode");
      if (stored === "false") {
        localStorage.removeItem("kavi_3d_mode");
      }
      setIs3DMode(true);
    } catch {
      // localStorage fallback
    }
  }, []);

  const toggle3DMode = () => {
    setIs3DMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kavi_3d_mode", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <ThreeDContext.Provider value={{ is3DMode, toggle3DMode }}>
      {children}
    </ThreeDContext.Provider>
  );
}

export function useThreeDMode() {
  return useContext(ThreeDContext);
}

export function ThreeDToggle({ className = "" }: { className?: string }) {
  const { is3DMode, toggle3DMode } = useThreeDMode();

  return (
    <button
      type="button"
      onClick={toggle3DMode}
      aria-label="Toggle 3D perspective mode"
      title={is3DMode ? "3D Mode enabled (interactive tilt & depth)" : "3D Mode disabled"}
      className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ${
        is3DMode
          ? "border border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.35)]"
          : "border border-white/10 bg-white/5 text-fog hover:text-white"
      } ${className}`}
    >
      <Box
        className={`h-3.5 w-3.5 transition-transform duration-300 ${
          is3DMode ? "rotate-12 text-[#91B4FF] scale-110" : "text-fog"
        }`}
      />
      <span className="font-mono text-[11px] tracking-wide">
        3D {is3DMode ? "ON" : "OFF"}
      </span>
      {is3DMode && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
      )}
    </button>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  stagger = 0.12,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 36 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({
  children,
  className,
  intensity = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}) {
  const { is3DMode } = useThreeDMode();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-60px" });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !is3DMode) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className ?? ""}`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={
        is3DMode
          ? {
              transformStyle: "preserve-3d",
              perspective: 1000,
              rotateX,
              rotateY,
            }
          : undefined
      }
      whileHover={
        is3DMode
          ? {
              scale: 1.018,
              transition: { duration: 0.25 },
            }
          : {
              y: -6,
              transition: { duration: 0.25 },
            }
      }
    >
      {children}
      {is3DMode && glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(145, 180, 255, 0.12) 0%, transparent 65%)`,
          }}
        />
      )}
    </motion.div>
  );
}

export function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
    />
  );
}
