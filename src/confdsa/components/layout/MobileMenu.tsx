"use client";

import Link from "@/confdsa/components/ui/Link";
import { usePathname } from "@/confdsa/components/ui/Link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ChevronDownIcon, CloseIcon, GridIcon, MailIcon, type IconComponent } from "@/confdsa/components/ui/Icons";
import LanguageSwitcher from "./LanguageSwitcher";
import { navIcons } from "./navIcons";
import { isActive } from "./navActive";
import type { NavItem, NavKey } from "@/confdsa/config/navigation";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

const EASE = [0.22, 1, 0.36, 1] as const;
const noop = () => () => {};

// Side drawer for small screens. Rendered into <body> so it covers the sticky header,
// locks page scrolling while open and closes on backdrop click, Escape or navigation.
export default function MobileMenu({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
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
      <AnimatePresence>{open && <Drawer key="drawer" onClose={onClose} items={items} />}</AnimatePresence>
    </MotionConfig>,
    document.body,
  );
}

function Drawer({ onClose, items }: { onClose: () => void; items: NavItem[] }) {
  const { m, site } = useLanguage();
  const pathname = usePathname();
  // Start with the group that contains the current page expanded.
  const [openGroup, setOpenGroup] = useState<NavKey | null>(
    () => items.find((item) => item.children && isActive(pathname, item))?.key ?? null,
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-60 bg-navy-deep/60 backdrop-blur-sm"
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
        className="fixed inset-y-0 right-0 z-70 flex w-[min(360px,88vw)] flex-col bg-navy text-white shadow-2xl shadow-black/40"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: EASE }}
        // Any link inside the drawer closes it.
        onClickCapture={(event) => {
          if ((event.target as HTMLElement).closest("a")) onClose();
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">{m.nav.menu}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={m.nav.closeMenu}
            className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[#7fd4ff]"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <ul className="space-y-1">
            {items.map((item, index) => {
              const Icon = navIcons[item.key];
              const active = isActive(pathname, item);
              const rowClass = `group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left font-semibold transition-colors ${
                active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/[0.06] hover:text-white"
              }`;
              const icon = (
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
                    active ? "bg-brand text-white" : "bg-white/[0.07] text-white/75 group-hover:text-white"
                  }`}
                >
                  <Icon className="size-4.5" />
                </span>
              );

              return (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + index * 0.035, duration: 0.3, ease: EASE }}
                >
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={openGroup === item.key}
                        onClick={() => setOpenGroup(openGroup === item.key ? null : item.key)}
                        className={rowClass}
                      >
                        {icon}
                        <span className="flex-1">{m.nav[item.key]}</span>
                        <ChevronDownIcon
                          className={`size-4 text-white/60 transition-transform duration-300 ${openGroup === item.key ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {openGroup === item.key && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: EASE }}
                            className="ml-[1.6rem] overflow-hidden border-l border-white/10"
                          >
                            {/* Groups whose own page is not one of their children get an "Overview" link. */}
                            {!item.children.some((child) => child.href === item.href) && (
                              <SubLink href={item.href} icon={GridIcon} label={m.nav.overview} active={pathname === item.href} />
                            )}
                            {item.children.map((child) => (
                              <SubLink
                                key={child.href}
                                href={child.href}
                                icon={navIcons[child.key]}
                                label={m.nav[child.key]}
                                active={pathname === child.href}
                              />
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={item.href} className={rowClass}>
                      {icon}
                      <span>{m.nav[item.key]}</span>
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-4 border-t border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">{m.common.language}</span>
            <LanguageSwitcher />
          </div>
          <a
            href={`mailto:${site.email}`}
            className="flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <MailIcon className="size-4" />
            {site.email}
          </a>
        </div>
      </motion.aside>
    </>
  );
}

function SubLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: IconComponent;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative my-0.5 ml-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          active ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
        }`}
      >
        {active && <span aria-hidden className="absolute -left-3.25 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />}
        <Icon className="size-4 shrink-0 opacity-80" />
        {label}
      </Link>
    </li>
  );
}
