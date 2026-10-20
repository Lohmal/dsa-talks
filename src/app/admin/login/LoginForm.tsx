"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { login } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-8 rounded-3xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
      <h1 className="text-xl font-extrabold text-ink">Giriş yap</h1>
      <p className="mt-1 text-sm text-muted">Anket ve sertifika yönetimi için yönetici hesabınızla giriş yapın.</p>
      <input type="hidden" name="next" value={next} />

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
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Şifre</span>
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
