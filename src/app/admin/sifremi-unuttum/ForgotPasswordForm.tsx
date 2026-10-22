"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, ArrowLeft, Loader2, MailCheck, Send } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  if (state?.sent) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-ink">E-postanızı kontrol edin</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Bu adres bir yöneticiye aitse, şifre belirleme bağlantısı birkaç dakika içinde gelecek. Bağlantı 1 saat
          geçerlidir. Gelen kutunuzda yoksa istenmeyen (spam) klasörüne de bakın.
        </p>
        <Link href="/admin/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
          <ArrowLeft className="size-4" /> Girişe dön
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <h1 className="text-xl font-extrabold text-ink">Şifremi unuttum</h1>
      <p className="mt-1 text-sm text-muted">
        Yönetici e-posta adresinizi yazın; yeni şifre belirlemeniz için bir bağlantı gönderelim.
      </p>

      {state?.error && (
        <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-brand/[0.07] px-4 py-3 text-sm font-semibold text-brand-dark ring-1 ring-brand/20">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">E-posta</span>
        <input name="email" type="email" required autoComplete="username" className={`${inputClass} mt-1.5 py-3`} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Bağlantı gönder
      </button>
      <p className="mt-5 text-center">
        <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> Girişe dön
        </Link>
      </p>
    </form>
  );
}
