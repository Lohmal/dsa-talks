import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import type { Question } from "@prisma/client";
import { getQuestions } from "@/lib/survey";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import QuestionForm from "@/components/admin/QuestionForm";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { createQuestion, deleteQuestion, moveQuestion, updateQuestion } from "@/app/admin/actions";

export const metadata = { title: "Sorular" };

const TYPE_LABEL = { RATING: "5’li puan", TEXT: "Yazılı cevap", CHOICE: "Çoklu seçim" } as const;

// Only the fields the form needs, as plain data for the client component.
const editable = (q: Question) => ({
  id: q.id,
  type: q.type,
  textTr: q.textTr,
  textEn: q.textEn,
  required: q.required,
  options: q.options.map(({ tr, en }) => ({ tr, en })),
  allowOther: q.allowOther,
});

export default async function QuestionsPage() {
  await requireAdmin();
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
                      <Badge tone={question.type === "TEXT" ? "gray" : "navy"}>
                        {TYPE_LABEL[question.type]}
                        {question.type === "CHOICE" && ` · ${question.options.length} seçenek`}
                      </Badge>
                      {question.type === "CHOICE" && question.allowOther && <Badge>“Diğer” alanı var</Badge>}
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
                  <QuestionForm action={updateQuestion} question={editable(question)} submit="Kaydet" />
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
      {disabled ? (
        <span aria-hidden className="grid size-8 place-items-center text-muted opacity-30">
          <Icon className="size-4" />
        </span>
      ) : (
        <SubmitButton tone="ghost" size="sm" className="size-8 p-0!">
          <Icon className="size-4" />
          <span className="sr-only">{direction === "up" ? "Yukarı taşı" : "Aşağı taşı"}</span>
        </SubmitButton>
      )}
    </ActionForm>
  );
}
