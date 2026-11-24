"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarRange,
  ExternalLink,
  Globe,
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
import { logout, selectEdition } from "@/app/(event)/admin/actions";
import Select from "./Select";

// The first group works on the event year chosen at the top; the second on the whole site.
const groups = [
  {
    title: "Seçili yıl",
    items: [
      { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
      { href: "/admin/responses", label: "Yanıtlar", icon: MessageSquareText },
      { href: "/admin/settings", label: "Anket Ayarları", icon: Settings2 },
      { href: "/admin/questions", label: "Sorular", icon: ListChecks },
      { href: "/admin/qr", label: "QR Kod", icon: QrCode },
    ],
  },
  {
    title: "Genel",
    items: [
      { href: "/admin/events", label: "Etkinlikler ve Yıllar", icon: CalendarRange },
      { href: "/admin/users", label: "Yöneticiler", icon: Users },
    ],
  },
];

export type EditionChoice = { id: string; label: string };
export type CurrentEdition = EditionChoice & { siteHref: string; surveyHref: string };

const EASE = [0.22, 1, 0.36, 1] as const;

type User = { name: string; email: string };
type Props = { user: User; editions: EditionChoice[]; current: CurrentEdition };

// Navy sidebar, fixed on large screens. On phones and tablets a top bar with a menu button
// opens the same sidebar as a drawer from the left.
export default function AdminNav(props: Props) {
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
        <SidebarContent {...props} />
      </aside>

      <AnimatePresence>
        {open && <Drawer key="drawer" {...props} onClose={close} />}
      </AnimatePresence>
    </>
  );
}

function Drawer({ onClose, ...props }: Props & { onClose: () => void }) {
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
        <SidebarContent {...props} onNavigate={onClose} />
      </motion.aside>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="relative block">
      <span className="text-2xl font-black tracking-[-0.04em]">
        CONF<span className="text-brand">DSA</span>
      </span>
      <span className="mt-0.5 block text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/50">
        Yönetim Paneli
      </span>
    </Link>
  );
}

function SidebarContent({ user, editions, current, onNavigate }: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand" />

      <div className="space-y-5 px-6 py-7">
        <Brand />
        <EditionPicker editions={editions} current={current} />
      </div>

      <nav aria-label="Yönetim" className="flex-1 space-y-6 overflow-y-auto px-3">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/40">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
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
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-white/10 px-6 py-5">
        <Link
          href={current.siteHref}
          target="_blank"
          className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
        >
          <Globe className="size-4" />
          Sayfayı aç
        </Link>
        <Link
          href={current.surveyHref}
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

// Which event year the "Seçili yıl" pages work on; the choice is kept in a cookie.
function EditionPicker({ editions, current }: { editions: EditionChoice[]; current: CurrentEdition }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/40">Etkinlik ve yıl</p>
      <Select
        label="Etkinlik ve yıl"
        value={current.id}
        options={editions.map(({ id, label }) => ({ value: id, label }))}
        loading={pending}
        disabled={pending}
        onChange={(id) =>
          startTransition(async () => {
            await selectEdition(id);
            router.refresh();
          })
        }
      />
    </div>
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
