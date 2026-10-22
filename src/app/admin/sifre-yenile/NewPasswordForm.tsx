"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { setNewPassword } from "./actions";

export default function NewPasswordForm({ token, email }: { token: string; email: string }) {
  const [error, formAction, pending] = useActionState(setNewPassword, null);

  return (
    <form action={formAction}>
      <h1 className="text-xl font-extrabold text-ink">Yeni şifre belirle</h1>
      <p className="mt-1 text-sm text-muted">
        <span className="font-semibold text-ink">{email}</span> hesabı için yeni bir şifre belirleyin.
      </p>
      <input type="hidden" name="token" value={token} />
      {/* Lets password managers save the new password under the right account. */}
      <input type="hidden" name="username" autoComplete="username" value={email} />

      {error && (
        <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-brand/[0.07] px-4 py-3 text-sm font-semibold text-brand-dark ring-1 ring-brand/20">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Yeni şifre</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={`${inputClass} mt-1.5 py-3`}
        />
        <span className="mt-1 block text-xs text-muted">En az 8 karakter.</span>
      </label>
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Yeni şifre (tekrar)</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={`${inputClass} mt-1.5 py-3`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Şifreyi kaydet
      </button>
    </form>
  );
}
