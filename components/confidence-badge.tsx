"use client";

import { ConfidenceLevel } from "@/lib/types";

const COLOR_MAP: Record<ConfidenceLevel, string> = {
  High: "bg-emerald-500/20 text-emerald-300 border-emerald-500/60",
  Medium: "bg-amber-500/20 text-amber-200 border-amber-500/60",
  Low: "bg-rose-500/20 text-rose-200 border-rose-500/60",
};

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${COLOR_MAP[level]}`}>
      {level} confidence
    </span>
  );
}
