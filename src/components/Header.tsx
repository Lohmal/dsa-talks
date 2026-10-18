"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import MobileMenu, { type SectionId } from "./MobileMenu";
import { Container, LanguageSwitcher, Wordmark } from "./ui";
import { useLanguage } from "@/i18n/LanguageProvider";

const sections: readonly SectionId[] = ["about", "speakers", "program", "venue"];

// White bar with the poster's red top line. Highlights the section currently in view.
export default function Header() {
  const { m } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-t-4 border-brand bg-white/95 backdrop-blur transition-shadow ${
        scrolled ? "shadow-[0_8px_30px_-18px_rgba(11,21,51,0.45)]" : ""
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-18">
        <a href="#top" className="text-2xl sm:text-[1.7rem]">
          <Wordmark />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {sections.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={current === id ? "true" : undefined}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                current === id ? "text-brand" : "text-ink/75 hover:text-ink"
              }`}
            >
              {m.nav[id]}
              {current === id && (
                <motion.span
                  layoutId="nav-dot"
                  aria-hidden
                  className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand"
                />
              )}
            </a>
          ))}
          <span aria-hidden className="mx-3 h-6 w-px bg-line" />
          <LanguageSwitcher />
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={m.nav.menu}
          className="inline-flex items-center gap-2 rounded-full bg-ink py-2 pl-3 pr-4 text-sm font-semibold text-white md:hidden"
        >
          <Menu className="size-5" />
          {m.nav.menu}
        </button>
      </Container>

      <MobileMenu open={open} onClose={closeMenu} sections={sections} current={current} />
    </header>
  );
}
