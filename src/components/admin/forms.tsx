"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonClass, type buttonTones } from "./ui";

// Interactive form parts of the admin panel (server actions with pending and result states).

export type ActionState = { ok: boolean; message: string } | null;
export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

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
