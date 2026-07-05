import { FileText } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
      <FileText className="mx-auto h-9 w-9 text-zinc-400" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">{description}</p>
    </div>
  );
}
