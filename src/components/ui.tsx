"use client";

import { motion, useReducedMotion } from "motion/react";
import { locales, useLanguage } from "@/i18n/LanguageProvider";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

// "DSATalks" set in the poster's colors; stands in for a logo until there is one.
export function Wordmark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`font-black tracking-[-0.04em] ${className}`}>
      <span className={light ? "text-white" : "text-brand"}>DSA</span>
      <span className={light ? "text-brand" : "text-ink"}>Talks</span>
    </span>
  );
}

// Small letter-spaced label with a rule in front, like "— EVENT INVITATION" on the poster.
export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-4 text-xs font-bold uppercase tracking-[0.38em] sm:text-sm ${
        light ? "text-white" : "text-brand"
      }`}
    >
      <span aria-hidden className={`h-0.5 w-10 ${light ? "bg-white" : "bg-brand"}`} />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  light = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`mt-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {text && <p className={`mt-4 text-lg ${light ? "text-white/70" : "text-muted"}`}>{text}</p>}
    </div>
  );
}

export function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const { locale, setLocale, m } = useLanguage();

  return (
    <div
      role="group"
      aria-label={m.nav.language}
      className={`inline-flex rounded-full p-0.5 text-xs font-bold ${
        light ? "bg-white/10 ring-1 ring-white/15" : "bg-surface ring-1 ring-line"
      }`}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-3 py-1.5 uppercase transition-colors ${
            locale === code
              ? light
                ? "bg-white text-ink"
                : "bg-ink text-white"
              : light
                ? "text-white/70 hover:text-white"
                : "text-muted hover:text-ink"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

// Fades content up into view once while scrolling; static when the user prefers reduced motion.
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
