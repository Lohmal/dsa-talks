"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CalendarDays, Globe, Info, Mail, MapPin, Mic, X, type LucideIcon } from "lucide-react";
import { LanguageSwitcher, Wordmark } from "./ui";
import { site } from "@/config/site";
import { useLanguage } from "@/i18n/LanguageProvider";

export type SectionId = "about" | "speakers" | "program" | "venue";

const icons: Record<SectionId, LucideIcon> = {
  about: Info,
  speakers: Mic,
  program: CalendarDays,
  venue: MapPin,
};

const EASE = [0.22, 1, 0.36, 1] as const;
const noop = () => () => {};

// Side drawer for small screens, as on the CONFDSA site. Rendered into <body> so it covers
// the sticky header, locks page scrolling while open and closes on backdrop click, Escape or a link.
export default function MobileMenu({
  open,
  onClose,
  sections,
  current,
}: {
  open: boolean;
  onClose: () => void;
  sections: readonly SectionId[];
  current: string | null;
}) {
  // false during server render and hydration, true afterwards (portals need document).
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && <Drawer key="drawer" onClose={onClose} sections={sections} current={current} />}
      </AnimatePresence>
    </MotionConfig>,
    document.body,
  );
}

function Drawer({
  onClose,
  sections,
  current,
}: {
  onClose: () => void;
  sections: readonly SectionId[];
  current: string | null;
}) {
  const { m } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-60 bg-ink-deep/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={m.nav.menu}
        className="fixed inset-y-0 right-0 z-70 flex w-[min(360px,88vw)] flex-col bg-ink text-white shadow-2xl shadow-black/40"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: EASE }}
        // Any link inside the drawer closes it. Section links scroll once the page is unlocked again.
        onClickCapture={(event) => {
          const link = (event.target as HTMLElement).closest("a");
          if (!link) return;
          const hash = link.getAttribute("href");
          onClose();
          if (hash?.startsWith("#")) {
            event.preventDefault();
            window.history.replaceState(null, "", hash);
            setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
          }
        }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-brand" />
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Wordmark light className="text-2xl" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={m.nav.closeMenu}
            className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <ul className="space-y-1">
            {sections.map((id, index) => {
              const Icon = icons[id];
              const active = current === id;
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + index * 0.035, duration: 0.3, ease: EASE }}
                >
                  <a
                    href={`#${id}`}
                    aria-current={active ? "true" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 font-semibold transition-colors ${
                      active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
                        active ? "bg-brand text-white" : "bg-white/[0.07] text-white/75 group-hover:text-white"
                      }`}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    {m.nav[id]}
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-4 border-t border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">{m.nav.language}</span>
            <LanguageSwitcher light />
          </div>
          <div className="flex flex-col items-center gap-2 text-sm text-white/70">
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="size-4" />
              {site.email}
            </a>
            <a href={site.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
              <Globe className="size-4" />
              {site.websiteUrl.replace("https://", "")}
            </a>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
