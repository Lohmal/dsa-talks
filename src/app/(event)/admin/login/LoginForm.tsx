"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, LogIn, RotateCw, ShieldCheck } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { login, type LoginState } from "./actions";

const submitClass =
  "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70";

function Notice({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  return tone === "ok" ? (
    <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
      <CheckCircle2 className="size-4 shrink-0" />
      {children}
    </p>
  ) : (
    <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-brand/[0.07] px-4 py-3 text-sm font-semibold text-brand-dark ring-1 ring-brand/20">
      <AlertCircle className="size-4 shrink-0" />
      {children}
    </p>
  );
}

const initial: LoginState = { step: "password" };

export default function LoginForm({ next, passwordChanged }: { next: string; passwordChanged: boolean }) {
  const [state, formAction, pending] = useActionState(login, initial);

  if (state.step === "code") {
    return (
      <form action={formAction}>
        <h1 className="text-xl font-extrabold text-ink">Doğrulama kodu</h1>
        <p className="mt-1 text-sm text-muted">
          <span className="font-semibold text-ink">{state.email}</span> adresine 6 haneli bir kod gönderdik. Kod 10
          dakika geçerlidir; gelen kutunuzda yoksa istenmeyen (spam) klasörüne de bakın.
        </p>
        <input type="hidden" name="next" value={next} />

        {state.resent && !state.error && <Notice tone="ok">Yeni kod gönderildi.</Notice>}
        {state.error && <Notice tone="error">{state.error}</Notice>}

        <label className="mt-6 block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Kod</span>
          <input
            name="code"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="______"
            className={`${inputClass} mt-1.5 py-3 text-center font-mono text-2xl tracking-[0.5em]`}
          />
        </label>

        {/* First submit button: Enter in the code field verifies. */}
        <button type="submit" name="intent" value="code" disabled={pending} className={submitClass}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Doğrula ve giriş yap
        </button>
        <div className="mt-5 flex items-center justify-between">
          <button
            type="submit"
            name="intent"
            value="back"
            formNoValidate
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" /> Geri dön
          </button>
          <button
            type="submit"
            name="intent"
            value="resend"
            formNoValidate
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
          >
            <RotateCw className="size-4" /> Kodu tekrar gönder
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={formAction}>
      <h1 className="text-xl font-extrabold text-ink">Giriş yap</h1>
      <p className="mt-1 text-sm text-muted">Anket ve sertifika yönetimi için yönetici hesabınızla giriş yapın.</p>
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="intent" value="password" />

      {passwordChanged && !state.error && (
        <Notice tone="ok">Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.</Notice>
      )}
      {state.error && <Notice tone="error">{state.error}</Notice>}

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

      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Giriş yap
      </button>
    </form>
  );
}
