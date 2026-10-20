"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

// Building blocks for the admin panel, in the site's navy/red style.

export type ActionState = { ok: boolean; message: string } | null;
export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="font-extrabold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? "p-5 sm:p-6" : ""}>{children}</div>
    </section>
  );
}

const tones = {
  navy: "bg-ink text-white",
  red: "bg-brand/10 text-brand-dark ring-1 ring-brand/20",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  gray: "bg-surface text-muted ring-1 ring-line",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

const buttonTones = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm shadow-brand/20",
  navy: "bg-ink text-white hover:bg-navy",
  outline: "bg-white text-ink ring-1 ring-line hover:ring-ink/30 hover:bg-surface",
  danger: "bg-white text-brand ring-1 ring-brand/30 hover:bg-brand hover:text-white",
  ghost: "text-muted hover:bg-surface hover:text-ink",
};

export function buttonClass(tone: keyof typeof buttonTones = "primary", size: "sm" | "md" = "md") {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm"
  } ${buttonTones[tone]}`;
}

export const inputClass =
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-ink";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  tone = "primary",
  size = "md",
  confirm,
  className = "",
  name,
  value,
}: {
  children: React.ReactNode;
  tone?: keyof typeof buttonTones;
  size?: "sm" | "md";
  confirm?: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      className={`${buttonClass(tone, size)} ${className}`}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

// A form bound to a server action that reports back "saved" or an error next to its buttons.
// (React resets the form's fields to their default values after each submission.)
export function ActionForm({
  action,
  children,
  className = "",
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const [dismissed, setDismissed] = useState<ActionState>(null);
  const visible = state && state !== dismissed ? state : null;

  useEffect(() => {
    if (!state) return;
    const timer = setTimeout(() => setDismissed(state), state.ok ? 3000 : 8000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <form action={formAction} className={className}>
      {children}
      {visible && (
        <p
          role="status"
          className={`mt-3 text-sm font-semibold ${visible.ok ? "text-emerald-700" : "text-brand"}`}
        >
          {visible.message}
        </p>
      )}
    </form>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">{children}</p>;
}
