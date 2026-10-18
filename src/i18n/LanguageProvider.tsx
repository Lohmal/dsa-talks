"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import en from "./messages/en.json";
import tr from "./messages/tr.json";

export type Locale = "en" | "tr";
export type Messages = typeof en;

export const locales: Locale[] = ["en", "tr"];
export const defaultLocale: Locale = "en";

// tr.json must have the same shape as en.json; TypeScript fails the build if a key is missing.
const dictionaries: Record<Locale, Messages> = { en, tr };

const STORAGE_KEY = "dsa-talks-lang";
const listeners = new Set<() => void>();

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "tr";
}

// Saved choice first, then the browser language, otherwise English.
function readLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Storage can be blocked (private mode); fall through to browser language.
  }
  const preferred = window.navigator.languages ?? [window.navigator.language];
  return preferred.some((lang) => lang?.toLowerCase().startsWith("tr")) ? "tr" : defaultLocale;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // The static HTML is rendered in English; the client switches after hydration.
  const locale = useSyncExternalStore(subscribe, readLocale, () => defaultLocale);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore; the choice just won't persist.
    }
    listeners.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext value={{ locale, setLocale, m: dictionaries[locale] }}>
      {children}
    </LanguageContext>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return context;
}
