"use client";

import { Globe2 } from "lucide-react";
import { languages } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-md border border-line bg-white p-1" aria-label={t("language")}>
      <Globe2 className="ml-2 h-4 w-4 text-zinc-500" aria-hidden="true" />
      {languages.map((item) => (
        <button
          className={cn(
            "rounded px-2.5 py-1.5 text-xs font-semibold transition",
            language === item.code ? "bg-jade-50 text-jade-700" : "text-zinc-600 hover:bg-paper"
          )}
          key={item.code}
          onClick={() => setLanguage(item.code)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
