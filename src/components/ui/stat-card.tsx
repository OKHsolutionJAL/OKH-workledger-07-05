import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  accent?: "blue" | "orange" | "green" | "gray";
  className?: string;
};

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  blue: "bg-blue-50 text-[#1E3A8A]",
  orange: "bg-orange-50 text-[#FF6A00]",
  green: "bg-emerald-50 text-emerald-700",
  gray: "bg-zinc-100 text-zinc-600"
};

export function StatCard({ label, value, detail, icon, accent = "blue", className }: StatCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-line bg-white p-4 shadow-soft", className)}>
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6A00] via-[#1E3A8A] to-[#0B132B]" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-[#0B132B]">{value}</p>
        </div>
        {icon ? <div className={cn("shrink-0 rounded-full p-2.5", accentClasses[accent])}>{icon}</div> : null}
      </div>
      {detail ? <p className="mt-3 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}
