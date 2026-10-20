import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { Question } from "@prisma/client";
import { getQuestions } from "@/lib/survey";
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { createQuestion, deleteQuestion, moveQuestion, updateQuestion } from "@/app/admin/actions";

export const metadata = { title: "Sorular" };

export default async function QuestionsPage() {
  const questions = await getQuestions();

  return (
    <>
      <PageHeader
        title="Anket Soruları"
        description="Etkinlik Memnuniyet Anketi’ndeki sorular. Değişiklikler anket sayfasına hemen yansır; verilmiş yanıtlar soru metniyle birlikte saklandığı için bozulmaz."
      />

      <Card padded={false}>
        {questions.length === 0 ? (
          <div className="p-6">
            <EmptyState>Henüz soru yok. Aşağıdan ekleyin.</EmptyState>
          </div>
        ) : (
          <ol className="divide-y divide-line">
            {questions.map((question, index) => (
              <li key={question.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 w-6 shrink-0 text-lg font-black tabular-nums text-brand">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{question.textTr}</p>
                    <p className="mt-0.5 text-sm text-muted">{question.textEn}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={question.type === "RATING" ? "navy" : "gray"}>
                        {question.type === "RATING" ? "5’li puan" : "Yazılı cevap"}
                      </Badge>
                      <Badge tone={question.required ? "red" : "gray"}>{question.required ? "Zorunlu" : "İsteğe bağlı"}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <MoveButton id={question.id} direction="up" disabled={index === 0} />
                    <MoveButton id={question.id} direction="down" disabled={index === questions.length - 1} />
                    <ActionForm action={deleteQuestion}>
                      <input type="hidden" name="id" value={question.id} />
                      <SubmitButton tone="ghost" size="sm" confirm="Soru silinsin mi? Önceki yanıtlar korunur.">
                        <Trash2 className="size-4" />
                        <span className="sr-only">Sil</span>
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </div>
                <details className="ml-10 mt-2">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                    <Pencil className="size-3.5" /> Düzenle
                  </summary>
                  <QuestionForm action={updateQuestion} question={question} submit="Kaydet" />
                </details>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card title="Yeni soru ekle" actions={<Plus className="size-5 text-brand" />}>
        <QuestionForm action={createQuestion} submit="Soruyu ekle" />
      </Card>
    </>
  );
}

function MoveButton({ id, direction, disabled }: { id: string; direction: "up" | "down"; disabled: boolean }) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;
  return (
    <ActionForm action={moveQuestion}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={direction === "up" ? "Yukarı taşı" : "Aşağı taşı"}
        className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30"
      >
        <Icon className="size-4" />
      </button>
    </ActionForm>
  );
}

function QuestionForm({
  action,
  question,
  submit,
}: {
  action: typeof createQuestion;
  question?: Question;
  submit: string;
}) {
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
        <Field label="Soru tipi">
          <select name="type" defaultValue={question?.type ?? "RATING"} className={inputClass}>
            <option value="RATING">5’li puan (Kesinlikle katılıyorum … Kesinlikle katılmıyorum)</option>
            <option value="TEXT">Yazılı cevap</option>
          </select>
        </Field>
        <label className="flex items-center gap-3 self-end rounded-xl px-1 py-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="required"
            defaultChecked={question?.required ?? true}
            className="size-4 accent-[#d7182a]"
          />
          Zorunlu soru
        </label>
      </div>
      <SubmitButton tone="navy" className="mt-4">
        {submit}
      </SubmitButton>
    </ActionForm>
  );
}
