import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  label: string;
  error?: string;
  helper?: string;
};

export function Field({ label, error, helper, className, ...props }: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
      <span>{label}</span>
      <input
        className={cn(
          "min-h-11 rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition placeholder:text-zinc-400 focus:border-jade-600 focus:ring-2 focus:ring-jade-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {helper ? <span className="text-xs font-normal text-zinc-500">{helper}</span> : null}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  helper,
  className,
  ...props
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
      <span>{label}</span>
      <textarea
        className={cn(
          "min-h-28 rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition placeholder:text-zinc-400 focus:border-jade-600 focus:ring-2 focus:ring-jade-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {helper ? <span className="text-xs font-normal text-zinc-500">{helper}</span> : null}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  error,
  helper,
  className,
  children,
  ...props
}: BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
      <span>{label}</span>
      <select
        className={cn(
          "min-h-11 rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {helper ? <span className="text-xs font-normal text-zinc-500">{helper}</span> : null}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}
