"use client";

import { Printer } from "lucide-react";

export default function FellowshipGuidePrint() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#175CD3] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1849A9] print:hidden"
    >
      <Printer className="h-4 w-4" />
      Print / save as PDF
    </button>
  );
}
