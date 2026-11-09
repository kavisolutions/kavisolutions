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
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
      {TEAM_GRADIENTS.map((gradient) => (
        <button
          key={gradient}
          type="button"
          title={gradient}
          onClick={() => onChange(gradient)}
          className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} shadow-xs transition-transform hover:scale-110 ${
            value === gradient
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
              : "opacity-60 hover:opacity-100"
          }`}
        />
      ))}
    </div>
  );
}
