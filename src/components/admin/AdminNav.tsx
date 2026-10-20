"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ExternalLink,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  MessageSquareText,
  QrCode,
  Settings2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/responses", label: "Yanıtlar", icon: MessageSquareText },
  { href: "/admin/settings", label: "Anket Ayarları", icon: Settings2 },
  { href: "/admin/questions", label: "Sorular", icon: ListChecks },
  { href: "/admin/users", label: "Yöneticiler", icon: Users },
  { href: "/admin/qr", label: "QR Kod", icon: QrCode },
];

const EASE = [0.22, 1, 0.36, 1] as const;

type User = { name: string; email: string };

// Navy sidebar, fixed on large screens. On phones and tablets a top bar with a menu button
// opens the same sidebar as a drawer from the left.
export default function AdminNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    menuButton.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-ink px-4 py-3 text-white shadow-lg shadow-ink/20 sm:px-6 lg:hidden">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand" />
        <Brand />
        <button
          ref={menuButton}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
        >
          <Menu className="size-5" />
          Menü
        </button>
      </header>

      <aside className="relative hidden bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
        <SidebarContent user={user} />
      </aside>

      <AnimatePresence>
        {open && <Drawer key="drawer" user={user} onClose={close} />}
      </AnimatePresence>
    </>
  );
}

function Drawer({ user, onClose }: { user: User; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
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
  }, [onClose]);

  return (
    <div className="lg:hidden">
      <motion.div
        aria-hidden
        className="fixed inset-0 z-50 bg-ink-deep/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.aside
        id="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Yönetim menüsü"
        className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,85vw)] flex-col bg-ink text-white shadow-2xl shadow-black/40"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Menüyü kapat"
          className="absolute right-4 top-6 z-10 grid size-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
        <SidebarContent user={user} onNavigate={onClose} />
      </motion.aside>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="relative block">
      <span className="text-2xl font-black tracking-[-0.04em]">
        DSA<span className="text-brand">Talks</span>
      </span>
      <span className="mt-0.5 block text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/50">
        Yönetim Paneli
      </span>
    </Link>
  );
}

function SidebarContent({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand" />

      <div className="px-6 py-7">
        <Brand />
      </div>

      <nav aria-label="Yönetim" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <NavIcon icon={Icon} active={active} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-white/10 px-6 py-5">
        <Link
          href="/anket"
          target="_blank"
          className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
        >
          <ExternalLink className="size-4" />
          Anket sayfasını aç
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-white/55">{user.email}</p>
        </div>
        <form action={logout}>
          <LogoutButton />
        </form>
      </div>
    </>
  );
}

// The icon turns into a spinner while the clicked page is loading.
function NavIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-lg ${
        active || pending ? "bg-brand text-white" : "bg-white/[0.07] text-white/70"
      }`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
    </span>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/20 disabled:opacity-70"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Çıkış yap
    </button>
  );
}
