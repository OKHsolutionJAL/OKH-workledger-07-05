"use client";

import { Globe2 } from "lucide-react";
import { languages } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex min-w-0 items-center gap-0.5 rounded-md border border-line bg-white p-1 sm:gap-1" aria-label={t("language")}>
      <Globe2 className="mx-1 h-4 w-4 shrink-0 text-zinc-500 sm:ml-2 sm:mr-0" aria-hidden="true" />
      {languages.map((item) => (
        <button
          className={cn(
            "min-h-7 rounded px-1.5 py-1 text-[11px] font-semibold leading-none transition sm:px-2.5 sm:py-1.5 sm:text-xs",
            language === item.code ? "bg-jade-50 text-jade-700" : "text-zinc-600 hover:bg-paper"
          )}
          key={item.code}
          onClick={() => setLanguage(item.code)}
          title={item.label}
          type="button"
        >
          <span className="sm:hidden">{item.code.toUpperCase()}</span>
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
