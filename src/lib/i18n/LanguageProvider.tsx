"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultLanguage,
  isLanguage,
  languageStorageKey,
  languageToHtmlLang,
  translations,
  type Language,
  type TranslationKey
} from "@/lib/i18n/translations";
import { LanguageContext } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function applyLanguage(language: Language) {
  document.documentElement.lang = languageToHtmlLang(language);
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Keep the in-memory language if localStorage is unavailable.
  }
}

function getLocalLanguage() {
  try {
    const stored = window.localStorage.getItem(languageStorageKey);
    return isLanguage(stored) ? stored : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    let isMounted = true;

    async function loadLanguage() {
      const localLanguage = getLocalLanguage();
      setLanguageState(localLanguage);
      applyLanguage(localLanguage);

      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        const { data } = await supabase.from("profiles").select("preferred_language").eq("id", user.id).maybeSingle();
        const profileLanguage = data && isLanguage(data.preferred_language) ? data.preferred_language : null;

        if (profileLanguage) {
          setLanguageState(profileLanguage);
          applyLanguage(profileLanguage);
        } else {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email ?? null,
              preferred_language: localLanguage,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
        }
      } catch {
        // Keep local language when Supabase is unavailable.
      }
    }

    loadLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    applyLanguage(nextLanguage);

    try {
      const supabase = getSupabaseBrowser();
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (!data.user) return;
          return supabase
            .from("profiles")
            .update({
              preferred_language: nextLanguage,
              updated_at: new Date().toISOString()
            })
            .eq("id", data.user.id);
        })
        .catch(() => {
          // Local storage already keeps the preference for signed-out users.
        });
    } catch {
      // Local storage already keeps the preference for signed-out users.
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language][key] ?? translations[defaultLanguage][key],
      errorText: (key: string | undefined) => {
        if (!key) return undefined;
        if (key in translations[language]) return translations[language][key as TranslationKey];
        if (key in translations[defaultLanguage]) return translations[defaultLanguage][key as TranslationKey];
        return key;
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
