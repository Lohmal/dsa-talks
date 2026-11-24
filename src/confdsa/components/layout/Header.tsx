"use client";

import Link from "@/confdsa/components/ui/Link";
import { usePathname } from "@/confdsa/components/ui/Link";
import { useCallback, useRef, useState } from "react";
import { CalendarIcon, ChevronDownIcon, MapPinIcon, MenuIcon } from "@/confdsa/components/ui/Icons";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import { isActive } from "./navActive";
import { navIcons } from "./navIcons";
import { visibleNavigation } from "@/confdsa/config/navigation";
import { useLanguage } from "@/confdsa/i18n/LanguageProvider";

export default function Header() {
  const { m, pages } = useLanguage();
  const items = visibleNavigation(pages);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Stable so the drawer's Escape/scroll-lock effect does not re-run on every render.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, [setMenuOpen]);

  return (
    <>
      {/* Logo bar */}
      <div className="border-b border-line bg-white">
        {/* Same width and padding as the menu bar below so both rows line up */}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span aria-hidden className="hidden h-9 w-px bg-line md:block" />
            <p className="hidden max-w-56 text-xs font-semibold leading-snug text-navy/80 md:block">
              {m.meta.conferenceName}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <ul className="hidden items-center gap-5 text-sm font-medium text-navy lg:flex">
              <li className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-brand" />
                {m.meta.dateRange}
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="size-4 text-brand" />
                {m.meta.city}
              </li>
            </ul>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="sticky top-0 z-50 bg-navy shadow-md shadow-navy/20">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center">
              {items.map((item) => {
                const Icon = navIcons[item.key];
                return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`relative flex h-14 items-center gap-1.5 whitespace-nowrap px-2.5 text-[13px] font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.75 after:bg-brand after:transition-transform hover:text-white ${
                      isActive(pathname, item)
                        ? "text-white after:scale-x-100"
                        : "text-white/75 after:scale-x-0 hover:after:scale-x-100"
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive(pathname, item) ? "text-brand" : "opacity-70"}`} />
                    {m.nav[item.key]}
                    {item.children && (
                      <ChevronDownIcon aria-hidden className="size-3.5" />
                    )}
                  </Link>
                  {item.children && (
                    <ul className="invisible absolute left-0 top-full min-w-56 translate-y-1 rounded-b-md border-t-[3px] border-brand bg-white py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {item.children.map((child) => {
                        const ChildIcon = navIcons[child.key];
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium hover:bg-surface hover:text-brand ${
                                pathname === child.href ? "text-brand" : "text-navy"
                              }`}
                            >
                              <ChildIcon className="size-4 shrink-0 text-brand/80" />
                              {m.nav[child.key]}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
                );
              })}
            </ul>
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className="flex h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-white hover:bg-white/10 xl:hidden"
          >
            <MenuIcon className="size-6" />
            {m.nav.menu}
          </button>

        </div>

      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} items={items} />
    </>
  );
}
