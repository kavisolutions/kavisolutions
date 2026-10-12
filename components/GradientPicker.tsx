"use client";

import { TEAM_GRADIENTS } from "@/lib/team";

export default function GradientPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (gradient: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      {TEAM_GRADIENTS.map((gradient) => (
        <button
          key={gradient}
          type="button"
          title={gradient}
          onClick={() => onChange(gradient)}
          className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} transition-transform hover:scale-110 ${
            value === gradient
              ? "ring-2 ring-white ring-offset-2 ring-offset-[#0b0b14]"
              : "opacity-60"
          }`}
        />
      ))}
    </div>
  );
}
