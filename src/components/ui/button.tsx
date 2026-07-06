"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#FF6A00] text-white hover:bg-[#E55F00] focus-visible:ring-[#FF6A00]",
  secondary: "border border-line bg-white text-ink hover:bg-paper focus-visible:ring-[#1E3A8A]",
  ghost: "text-zinc-700 hover:bg-paper focus-visible:ring-[#1E3A8A]",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

export function Button({ className, variant = "primary", isLoading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Processando..." : children}
    </button>
  );
}
