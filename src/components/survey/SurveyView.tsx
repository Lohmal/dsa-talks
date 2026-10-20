"use client";

import { useRef, useState, useTransition } from "react";
import { AlertCircle, CalendarClock, Check, CheckCircle2, Download, Loader2, Lock, Mail, Send } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { useLanguage, type Messages } from "@/i18n/LanguageProvider";
import { submitSurvey } from "@/app/anket/actions";
import type { SubmitResult, SurveyProps, SurveyQuestion } from "./types";

const RATINGS = [5, 4, 3, 2, 1] as const;

// The public "Etkinlik Memnuniyet Anketi": closed / waiting notices, the form, and the
// certificate once the answers are saved.
export default function SurveyView(props: SurveyProps) {
  const { m } = useLanguage();
  const [done, setDone] = useState<Extract<SubmitResult, { status: "success" }> | null>(null);

  return (
    <PublicShell title={m.survey.title} intro={m.survey.intro}>
      {done ? (
        <Success result={done} />
      ) : props.status === "open" ? (
        <SurveyForm {...props} onDone={setDone} />
      ) : (
        <Notice {...props} />
      )}
    </PublicShell>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-10 ${className}`}>{children}</div>
  );
}

function Notice(props: Extract<SurveyProps, { status: "closed" | "waiting" }>) {
  const { m, locale } = useLanguage();
  const closed = props.status === "closed";
  const Icon = closed ? Lock : CalendarClock;

  return (
    <Card className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-7" />
      </span>
      <h2 className="mt-6 text-2xl font-extrabold text-ink sm:text-3xl">
        {closed ? m.survey.closedTitle : m.survey.waitingTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{closed ? m.survey.closedText : m.survey.waitingText}</p>
      {props.status === "waiting" && props.next && (
        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-surface p-5 text-left ring-1 ring-line">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand">{m.survey.next}</p>
          {props.next.talks.map((talk) => (
            <p key={talk.speaker + talk.title.tr} className="mt-2">
              <span className="block font-bold text-ink">{talk.title[locale]}</span>
              <span className="block text-sm text-muted">{talk.speaker}</span>
            </p>
          ))}
          <p className="mt-3 text-sm font-semibold text-ink">{props.next.dateTime[locale]}</p>
        </div>
      )}
    </Card>
  );
}

function SurveyForm({
  mode,
  sessionId,
  info,
  questions,
  onDone,
}: Extract<SurveyProps, { status: "open" }> & { onDone: (result: Extract<SubmitResult, { status: "success" }>) => void }) {
  const { m, locale } = useLanguage();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<Extract<SubmitResult, { status: "error" }> | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const invalid = new Set(error?.fields ?? []);
  const ratingQuestions = questions.filter((q) => q.type === "RATING");
  const otherQuestions = questions.filter((q) => q.type !== "RATING");

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: m.survey.info.eventName, value: info.eventName },
    { label: m.survey.info.speaker, value: info.speaker },
    ...(info.talks.length
      ? [
          {
            label: m.survey.info.talk,
            value:
              info.talks.length === 1 ? (
                info.talks[0].title[locale]
              ) : (
                <ul className="space-y-1.5">
                  {info.talks.map((talk) => (
                    <li key={talk.speaker + talk.title.tr}>
                      {talk.title[locale]} <span className="font-normal text-muted">· {talk.speaker}</span>
                    </li>
                  ))}
                </ul>
              ),
          },
        ]
      : []),
    { label: m.survey.info.dateTime, value: info.dateTime[locale] },
    { label: m.survey.info.venue, value: info.venue[locale] },
  ];

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await submitSurvey(formData);
      if (result.status === "success") {
        onDone(result);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setError(result);
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="sessionId" value={sessionId ?? ""} />
      {/* Honeypot: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <Card className="p-0! overflow-hidden">
        <dl className="divide-y divide-line">
          {rows.map(({ label, value }) => (
            <div key={label} className="grid gap-1 px-6 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-8">
              <dt className="text-sm font-bold text-muted">{label}</dt>
              <dd className="font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {error && (
        <div
          ref={errorRef}
          role="alert"
          className="flex items-start gap-3 rounded-2xl bg-brand/[0.07] p-4 font-semibold text-brand-dark ring-1 ring-brand/20"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          {m.survey.errors[error.code]}
        </div>
      )}

      <Card>
        <SectionTitle>{m.survey.you}</SectionTitle>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label={m.survey.name}
            hint={invalid.has("name") ? m.survey.errors.name : m.survey.nameHint}
            invalid={invalid.has("name")}
          >
            <input
              name="name"
              required
              minLength={3}
              maxLength={120}
              autoComplete="name"
              placeholder={m.survey.namePlaceholder}
              className={inputClass(invalid.has("name"))}
            />
          </Field>
          <Field
            label={m.survey.email}
            hint={invalid.has("email") ? m.survey.errors.email : m.survey.emailHint}
            invalid={invalid.has("email")}
          >
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              inputMode="email"
              placeholder={m.survey.emailPlaceholder}
              className={inputClass(invalid.has("email"))}
            />
          </Field>
        </div>
      </Card>

      {ratingQuestions.length > 0 && (
        <Card>
          <SectionTitle>{m.survey.evaluation}</SectionTitle>
          <p className="mt-2 text-sm text-muted">{m.survey.scaleHint}</p>
          <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-ink">
            {RATINGS.map((value) => (
              <li key={value} className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 ring-1 ring-line">
                <span className="grid size-5 place-items-center rounded-full bg-ink text-[0.7rem] font-black text-white">
                  {value}
                </span>
                {m.survey.scale[String(value) as keyof Messages["survey"]["scale"]]}
              </li>
            ))}
          </ul>

          <ol className="mt-8 divide-y divide-line border-y border-line">
            {ratingQuestions.map((question, index) => (
              <RatingRow key={question.id} index={index + 1} question={question} invalid={invalid.has(question.id)} />
            ))}
          </ol>
        </Card>
      )}

      {otherQuestions.map((question) =>
        question.type === "CHOICE" ? (
          <ChoiceCard key={question.id} question={question} invalid={invalid.has(question.id)} />
        ) : (
        <Card key={question.id}>
          <label htmlFor={`q_${question.id}`} className="block">
            <SectionTitle>{locale === "en" ? question.textEn : question.textTr}</SectionTitle>
            {!question.required && <span className="mt-1 block text-sm text-muted">{m.survey.optional}</span>}
          </label>
          <textarea
            id={`q_${question.id}`}
            name={`q_${question.id}`}
            rows={5}
            maxLength={3000}
            required={question.required}
            placeholder={m.survey.commentPlaceholder}
            className={`${inputClass(invalid.has(question.id))} mt-5 resize-y`}
          />
        </Card>
        ),
      )}

      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <p className="max-w-lg text-sm text-muted">{m.survey.privacy}</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          {pending ? m.survey.submitting : m.survey.submit}
        </button>
      </div>
    </form>
  );
}

function RatingRow({ index, question, invalid }: { index: number; question: SurveyQuestion; invalid: boolean }) {
  const { m, locale } = useLanguage();
  const text = locale === "en" ? question.textEn : question.textTr;

  return (
    <li className={`py-5 transition-colors ${invalid ? "-mx-3 rounded-xl bg-brand/5 px-3" : ""}`}>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center md:gap-8">
        <p id={`label_${question.id}`} className="flex gap-3 font-semibold leading-snug text-ink">
          <span className={`w-6 shrink-0 font-black tabular-nums ${invalid ? "text-brand" : "text-brand/80"}`}>{index}</span>
          {text}
        </p>
        <div
          role="radiogroup"
          aria-labelledby={`label_${question.id}`}
          aria-required={question.required}
          aria-invalid={invalid}
          className="grid grid-cols-5 gap-2 pl-9 md:flex md:pl-0"
        >
          {RATINGS.map((value) => (
            <label key={value} className="group relative cursor-pointer" title={m.survey.scale[String(value) as "5"]}>
              <input
                type="radio"
                name={`q_${question.id}`}
                value={value}
                required={question.required}
                className="peer sr-only"
                aria-label={`${value} – ${m.survey.scale[String(value) as "5"]}`}
              />
              <span
                className={`grid h-11 place-items-center rounded-xl text-base font-extrabold tabular-nums ring-1 transition md:w-11 ${
                  invalid ? "ring-brand/50" : "ring-line"
                } bg-white text-ink group-hover:ring-ink/40 peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand`}
              >
                {value}
              </span>
            </label>
          ))}
        </div>
      </div>
    </li>
  );
}

function Success({ result }: { result: Extract<SubmitResult, { status: "success" }> }) {
  const { m } = useLanguage();
  const base = `/api/certificate/${result.token}`;

  return (
    <Card className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-8" />
      </span>
      <h2 className="mt-6 text-3xl font-extrabold text-ink">{m.survey.successTitle}</h2>
      <p className="mt-3 text-muted">{m.survey.successText}</p>
      <p
        className={`mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
          result.emailSent ? "bg-surface text-ink ring-1 ring-line" : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
        }`}
      >
        <Mail className="size-4 shrink-0" />
        <span className="truncate">
          {result.emailSent ? m.survey.emailSent.replace("{email}", result.email) : m.survey.emailFailed}
        </span>
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element -- generated on request, not a static asset */}
      <img
        src={`${base}?format=png`}
        alt={`DSATalks certificate – ${result.name}`}
        width={2000}
        height={1414}
        className="mt-8 h-auto w-full rounded-xl shadow-card ring-1 ring-ink/10"
      />

      <a
        href={`${base}?download=1`}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
      >
        <Download className="size-5" />
        {m.survey.download}
      </a>
      <p className="mt-4 text-sm text-muted">
        {m.survey.certificateNo} <span className="font-bold text-ink">{result.certificateNo}</span>
      </p>
    </Card>
  );
}

function ChoiceCard({ question, invalid }: { question: SurveyQuestion; invalid: boolean }) {
  const { m, locale } = useLanguage();
  const name = `q_${question.id}`;

  return (
    <Card className={invalid ? "ring-2 ring-brand/40" : ""}>
      <SectionTitle>{locale === "en" ? question.textEn : question.textTr}</SectionTitle>
      <p className="mt-1 text-sm text-muted">
        {m.survey.multiHint}
        {!question.required && ` · ${m.survey.optional}`}
      </p>
      <div role="group" aria-label={locale === "en" ? question.textEn : question.textTr} className="mt-5 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <label key={option.tr} className="group relative cursor-pointer">
            <input type="checkbox" name={name} value={index} className="peer sr-only" />
            <span className="flex h-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink ring-1 ring-line transition group-hover:ring-ink/40 peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
              <span className="grid size-5 shrink-0 place-items-center rounded-md ring-1 ring-current/40">
                <Check className="size-3.5 opacity-0 transition-opacity group-has-checked:opacity-100" />
              </span>
              {option[locale]}
            </span>
          </label>
        ))}
      </div>
      {question.allowOther && (
        <label className="mt-4 block">
          <span className="text-sm font-bold text-ink">{m.survey.otherLabel}</span>
          <input
            name={`${name}_other`}
            maxLength={300}
            placeholder={m.survey.otherPlaceholder}
            className={`${inputClass(false)} mt-2`}
          />
        </label>
      )}
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-extrabold tracking-[-0.01em] text-ink sm:text-2xl">{children}</h2>;
}

function Field({
  label,
  hint,
  invalid,
  children,
}: {
  label: string;
  hint: string;
  invalid: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="mt-2 block">{children}</span>
      <span className={`mt-1.5 block text-xs ${invalid ? "font-semibold text-brand" : "text-muted"}`}>{hint}</span>
    </label>
  );
}

function inputClass(invalid: boolean) {
  return `w-full rounded-xl bg-white px-4 py-3 text-ink ring-1 transition placeholder:text-muted/60 focus:outline-none focus:ring-2 ${
    invalid ? "ring-brand focus:ring-brand" : "ring-line focus:ring-ink"
  }`;
}
