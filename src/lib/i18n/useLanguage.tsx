"use client";

import { createContext, useContext } from "react";
import type { Language, TranslationKey } from "@/lib/i18n/translations";

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  errorText: (key: string | undefined) => string | undefined;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de LanguageProvider.");
  }

  return context;
}
