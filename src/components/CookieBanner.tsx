"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { setConsent, useConsent } from "@/lib/consent";
import { useLanguage } from "@/i18n/LanguageProvider";

// Asked once per browser on the public pages (the admin panel only uses a necessary cookie).
// Accepting lets the Google Maps map load by itself; the choice can be changed from the footer.
export default function CookieBanner() {
  const { m } = useLanguage();
  const consent = useConsent();
  const pathname = usePathname();
  const show = consent === "unset" && !pathname.startsWith("/admin");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={m.cookies.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-3 bottom-3 z-80 mx-auto max-w-3xl rounded-2xl bg-ink p-5 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10 sm:inset-x-6 sm:bottom-6 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-white/10 text-brand-soft sm:grid">
              <Cookie className="size-5" />
            </span>
            <p className="flex-1 text-sm leading-relaxed text-white/85">
              {m.cookies.text}{" "}
              <Link href="/kvkk" className="font-semibold text-white underline underline-offset-2 hover:text-brand-soft">
                {m.kvkk.link}
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setConsent("rejected")}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10 sm:flex-none"
              >
                {m.cookies.reject}
              </button>
              <button
                type="button"
                onClick={() => setConsent("accepted")}
                className="flex-1 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark sm:flex-none"
              >
                {m.cookies.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
