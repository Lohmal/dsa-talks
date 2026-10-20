"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, ListChecks, LogOut, MessageSquareText, QrCode, Settings2, Users } from "lucide-react";
import { logout } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/responses", label: "Yanıtlar", icon: MessageSquareText },
  { href: "/admin/settings", label: "Anket Ayarları", icon: Settings2 },
  { href: "/admin/questions", label: "Sorular", icon: ListChecks },
  { href: "/admin/users", label: "Yöneticiler", icon: Users },
  { href: "/admin/qr", label: "QR Kod", icon: QrCode },
];

// Navy sidebar on desktop; a top bar with a scrolling tab row on small screens.
export default function AdminNav({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="relative bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand" />

      <div className="flex items-center justify-between gap-4 px-6 py-5 lg:block lg:py-7">
        <Link href="/admin" className="block">
          <span className="text-2xl font-black tracking-[-0.04em]">
            DSA<span className="text-brand">Talks</span>
          </span>
          <span className="mt-0.5 block text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/50">
            Yönetim Paneli
          </span>
        </Link>
        <form action={logout} className="lg:hidden">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
          >
            <LogOut className="size-4" />
            Çıkış
          </button>
        </form>
      </div>

      <nav aria-label="Yönetim" className="overflow-x-auto px-3 pb-3 lg:flex-1 lg:overflow-visible lg:pb-0">
        <ul className="flex gap-1 lg:flex-col">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span
                    className={`grid size-8 place-items-center rounded-lg ${
                      active ? "bg-brand text-white" : "bg-white/[0.07] text-white/70"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden space-y-3 border-t border-white/10 px-6 py-5 lg:block">
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
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/20"
          >
            <LogOut className="size-4" />
            Çıkış yap
          </button>
        </form>
      </div>
    </aside>
  );
}
