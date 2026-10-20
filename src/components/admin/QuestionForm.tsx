"use client";

import { useState } from "react";
import { ActionForm, SubmitButton, type FormAction } from "./forms";
import { Field, inputClass } from "./ui";
import Select from "./Select";

type QuestionType = "RATING" | "TEXT" | "CHOICE";

export type EditableQuestion = {
  id: string;
  type: QuestionType;
  textTr: string;
  textEn: string;
  required: boolean;
  options: { tr: string; en: string }[];
  allowOther: boolean;
};

const TYPES = [
  { value: "RATING", label: "5’li puan", hint: "Kesinlikle katılıyorum … Kesinlikle katılmıyorum" },
  { value: "CHOICE", label: "Çoklu seçim", hint: "Birden fazla seçenek işaretlenebilir, isteğe bağlı “Diğer” alanı" },
  { value: "TEXT", label: "Yazılı cevap", hint: "Serbest metin" },
];

// Add / edit form for a survey question. Choice options are typed one per line as
// "Türkçe | English" (the English part is optional).
export default function QuestionForm({
  action,
  question,
  submit,
}: {
  action: FormAction;
  question?: EditableQuestion;
  submit: string;
}) {
  const [type, setType] = useState<QuestionType>(question?.type ?? "RATING");
  const options = (question?.options ?? []).map((o) => (o.en && o.en !== o.tr ? `${o.tr} | ${o.en}` : o.tr)).join("\n");

  return (
    <ActionForm action={action} className="mt-4">
      {question && <input type="hidden" name="id" value={question.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Soru (TR)">
          <textarea name="textTr" required rows={2} defaultValue={question?.textTr} className={inputClass} />
        </Field>
        <Field label="Soru (EN)" hint="Boş bırakılırsa Türkçe metin kullanılır.">
          <textarea name="textEn" rows={2} defaultValue={question?.textEn} className={inputClass} />
        </Field>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Soru tipi</span>
          <Select
            label="Soru tipi"
            name="type"
            options={TYPES}
            value={type}
            onChange={(next) => setType(next as QuestionType)}
            className="mt-1.5"
          />
        </div>
        <label className="flex items-center gap-3 self-end rounded-xl px-1 py-2.5 text-sm font-semibold text-ink">
          <input type="checkbox" name="required" defaultChecked={question?.required ?? true} className="size-4 accent-brand" />
          Zorunlu soru
        </label>

        {type === "CHOICE" && (
          <>
            <Field
              label="Seçenekler"
              hint="Her satıra bir seçenek: “Türkçe | English”. İngilizce kısmı boş bırakılırsa Türkçe kullanılır."
              className="sm:col-span-2"
            >
              <textarea
                name="options"
                rows={8}
                defaultValue={options}
                placeholder={"Veri Madenciliği | Data Mining\nMakine Öğrenmesi | Machine Learning"}
                className={`${inputClass} font-mono text-[0.8rem]`}
              />
            </Field>
            <label className="flex items-center gap-3 rounded-xl px-1 py-1 text-sm font-semibold text-ink sm:col-span-2">
              <input
                type="checkbox"
                name="allowOther"
                defaultChecked={question?.allowOther ?? true}
                className="size-4 accent-brand"
              />
              “Diğer” alanı ekle (katılımcı listede olmayan konuları yazabilsin)
            </label>
          </>
        )}
      </div>
      <SubmitButton tone="navy" className="mt-4">
        {submit}
      </SubmitButton>
    </ActionForm>
  );
}
