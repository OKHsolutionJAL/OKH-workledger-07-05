export function LoadingState({ label = "..." }: { label?: string }) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded-lg border border-line bg-white p-6 text-sm text-zinc-500">
      {label}
    </div>
  );
}
