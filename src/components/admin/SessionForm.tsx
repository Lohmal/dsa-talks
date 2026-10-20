"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ActionForm, SubmitButton, type FormAction } from "./forms";
import { Field, buttonClass, inputClass } from "./ui";

type Talk = { speaker: string; titleTr: string; titleEn: string };

// Add / edit form for a time window: date and times once, then one or more talks
// (speaker + title). Each window gives one certificate per e-mail, covering all its talks.
// The speaker and title fields suggest names from the site's program (datalists on the page).
export default function SessionForm({
  action,
  session,
  submit,
}: {
  action: FormAction;
  session?: { id: string; date: string; start: string; end: string; talks: Talk[] };
  submit: string;
}) {
  const [rows, setRows] = useState(() =>
    (session?.talks.length ? session.talks : [{ speaker: "", titleTr: "", titleEn: "" }]).map((talk, i) => ({
      key: i,
      talk,
    })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  return (
    <ActionForm action={action} className="mt-4">
      {session && <input type="hidden" name="id" value={session.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tarih">
          <input name="date" type="date" required defaultValue={session?.date ?? "2026-11-04"} className={inputClass} />
        </Field>
        <Field label="Başlangıç">
          <input name="start" type="time" required defaultValue={session?.start ?? "10:15"} className={inputClass} />
        </Field>
        <Field label="Bitiş">
          <input name="end" type="time" required defaultValue={session?.end ?? "12:00"} className={inputClass} />
        </Field>
      </div>

      <ol className="mt-5 space-y-3">
        {rows.map(({ key, talk }, index) => (
          <li key={key} className="relative rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
                {rows.length > 1 ? `${index + 1}. konuşma` : "Konuşma"}
              </span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((current) => current.filter((row) => row.key !== key))}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-muted hover:bg-surface hover:text-brand"
                >
                  <X className="size-3.5" /> Kaldır
                </button>
              )}
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <Field label="Konuşmacı">
                <input name="speaker" list="speaker-names" required defaultValue={talk.speaker} className={inputClass} />
              </Field>
              <Field label="Konuşma başlığı (TR)">
                <input name="titleTr" list="titles-tr" defaultValue={talk.titleTr} className={inputClass} />
              </Field>
              <Field label="Konuşma başlığı (EN)" hint="Sertifikada bu başlık yazar.">
                <input name="titleEn" list="titles-en" defaultValue={talk.titleEn} className={inputClass} />
              </Field>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setRows((current) => [...current, { key: nextKey, talk: { speaker: "", titleTr: "", titleEn: "" } }]);
            setNextKey((k) => k + 1);
          }}
          className={buttonClass("outline")}
        >
          <Plus className="size-4" /> Konuşmacı ekle
        </button>
        <SubmitButton tone="navy">{submit}</SubmitButton>
      </div>
      <p className="mt-2 text-xs text-muted">
        Aynı saat aralığındaki konuşmaları tek oturumda toplayın: katılımcı bu oturum için bir kez anket doldurur ve tüm
        konuşmaları içeren tek sertifika alır.
      </p>
    </ActionForm>
  );
}
