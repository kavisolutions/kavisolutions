"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-xl border border-white/10 bg-white/5 opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`group relative inline-flex h-9 items-center justify-center gap-2 rounded-xl px-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#91B4FF] ${
        isDark
          ? "border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.7)] text-[#A5B3C7] hover:bg-[#19202E] hover:text-[#F7F9FC]"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
      } ${className}`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45 text-[#91B4FF]" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 text-[#175CD3]" />
        )}
      </span>
      {showLabel && (
        <span className="font-mono text-xs font-medium tracking-wide">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
