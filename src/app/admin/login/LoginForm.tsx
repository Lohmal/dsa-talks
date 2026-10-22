"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, LogIn } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { login } from "./actions";

export default function LoginForm({ next, passwordChanged }: { next: string; passwordChanged: boolean }) {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction}>
      <h1 className="text-xl font-extrabold text-ink">Giriş yap</h1>
      <p className="mt-1 text-sm text-muted">Anket ve sertifika yönetimi için yönetici hesabınızla giriş yapın.</p>
      <input type="hidden" name="next" value={next} />

      {passwordChanged && !error && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
          <CheckCircle2 className="size-4 shrink-0" />
          Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-brand/[0.07] px-4 py-3 text-sm font-semibold text-brand-dark ring-1 ring-brand/20">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">E-posta</span>
        <input name="email" type="email" required autoComplete="username" className={`${inputClass} mt-1.5 py-3`} />
      </label>
      <label className="mt-4 block">
        <span className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Şifre</span>
          <Link href="/admin/sifremi-unuttum" className="text-xs font-bold text-brand hover:underline">
            Şifremi unuttum
          </Link>
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${inputClass} mt-1.5 py-3`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Giriş yap
      </button>
    </form>
  );
}
