import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardSection({ title, description, children, className }: DashboardSectionProps) {
  return (
    <section className={cn("grid gap-4", className)}>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-[#0B132B]">{title}</h3>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
