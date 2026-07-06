import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ChartCard({ title, description, children, className, isEmpty, emptyTitle, emptyDescription }: ChartCardProps) {
  return (
    <section className={cn("rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5", className)}>
      <div className="mb-4 min-w-0">
        <h3 className="truncate text-base font-semibold text-[#0B132B] sm:text-lg">{title}</h3>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {isEmpty ? (
        <EmptyState
          className="border-[#E5E7EB] bg-[#F8FAFC] p-6"
          title={emptyTitle ?? "Nenhum dado registrado"}
          description={emptyDescription ?? "Registre lancamentos para visualizar este grafico."}
        />
      ) : (
        children
      )}
    </section>
  );
}
