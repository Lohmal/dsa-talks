"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { localize } from "@/lib/bilingual";
import type en from "./messages/en.json";
import type { EventContent } from "@/content/event";

export type Locale = "en" | "tr";
export type Messages = typeof en;

export const locales: Locale[] = ["en", "tr"];
export const defaultLocale: Locale = "en";

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

type LanguageContextValue = Omit<EventContent, "messages"> & {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
  base: string; // the event's page, e.g. "/etkinlikler/dsatalks" or "/etkinlikler/dsatalks/2026"
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// The content (texts, speakers, committees, details) of the shown event year.
export function LanguageProvider({
  content,
  base,
  children,
}: {
  content: EventContent;
  base: string;
  children: React.ReactNode;
}) {
  // The server HTML is rendered in English; the client switches after hydration.
  const locale = useSyncExternalStore(subscribe, readLocale, () => defaultLocale);
  const { messages, ...data } = content;
  const dictionaries = useMemo(
    () => ({ en: localize<Messages>(messages, "en"), tr: localize<Messages>(messages, "tr") }),
    [messages],
  );

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
    <LanguageContext value={{ ...data, locale, setLocale, m: dictionaries[locale], base }}>{children}</LanguageContext>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return context;
}
