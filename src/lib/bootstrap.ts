import "server-only";
import bcrypt from "bcryptjs";
import { db } from "./db";

// First-run defaults. Runs once per server process (see instrumentation.ts) and again lazily
// where it matters (login, survey), so a fresh database is always usable.

export const DEFAULT_ADMIN = { name: "Admin", email: "admin@admin.com", password: "admin123" };

const DEFAULT_SETTINGS = {
  key: "main",
  isOpen: false,
  mode: "EVENT" as const,
  eventName: "DSATalks",
  speakersText: "Prof. Dr. İlker Ünal, Silvan Schwaller, Dr. Recep Erol",
  eventDateTr: "4–5 Kasım 2026",
  eventDateEn: "4–5 November 2026",
  venueTr: "ATÜ Kütüphane Konferans Salonu, Adana",
  venueEn: "ATÜ Library Conference Hall, Adana",
  certificateDate: "4–5 November 2026",
};

// The questions of the printed "Etkinlik Memnuniyet Anketi" form.
type DefaultQuestion = {
  type: "RATING" | "TEXT" | "CHOICE";
  textTr: string;
  textEn: string;
  required: boolean;
  options?: { tr: string; en: string }[];
  allowOther?: boolean;
};

// Topics participants can pick for future events (multiple choice, plus "other").
export const TOPICS_QUESTION: DefaultQuestion = {
  type: "CHOICE",
  textTr: "İlerleyen etkinliklerde hangi konuların ele alınmasını istersiniz?",
  textEn: "Which topics would you like to see covered in future events?",
  required: false,
  allowOther: true,
  options: [
    ["Biyoinformatik için Veri Bilimi", "Data Science for Bioinformatics"],
    ["Adli Bilimler için Veri Bilimi", "Data Science for Forensics"],
    ["İstatistiksel Veri Analizi", "Statistical Data Analysis"],
    ["Veri Madenciliği", "Data Mining"],
    ["Büyük Veri Uygulamaları", "Big Data Applications"],
    ["Veri Ön İşleme ve Örnekleme", "Data Preprocessing and Sampling"],
    ["Olasılık ve İstatistik Kuramları", "Probabilistic and Statistical Theories"],
    ["Veri Görselleştirme ve Hikâye Anlatımı", "Data Visualization and Storytelling"],
    ["İş İnovasyonu için Veri Bilimi", "Data Science for Business Innovation"],
    ["Makine Öğrenmesi", "Machine Learning"],
    ["Derin Öğrenme", "Deep Learning"],
    ["Veri Gizliliği ve Güvenliği", "Data Privacy and Security"],
    ["Yapay Zekâ ve Etik", "AI and Ethics"],
  ].map(([tr, en]) => ({ tr, en })),
};

const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  ["Etkinliğin duyuru kanalları yeterlidir.", "The event's announcement channels were sufficient."],
  ["Etkinlik beklentilerimi karşılamaktadır.", "The event met my expectations."],
  ["Etkinlik içeriği anlaşılır ve öğreticidir.", "The event content was clear and instructive."],
  ["Etkinlik içeriği amaca uygundur.", "The event content suited its purpose."],
  ["Konuşmacı/Konuşmacılar konuya hakimdir.", "The speaker(s) had a good command of the subject."],
  [
    "Konuşmacının/Konuşmacıların katılımcılarla etkileşimi olumludur.",
    "The speaker(s) interacted well with the participants.",
  ],
  ["Katılımcı profili etkinliğin amacına uygundur.", "The participant profile suited the purpose of the event."],
  ["Fiziksel ortam uygundur.", "The physical environment was suitable."],
  ["Etkinlikten genel olarak memnunum.", "Overall, I am satisfied with the event."],
]
  .map(([textTr, textEn]): DefaultQuestion => ({ type: "RATING", textTr, textEn, required: true }))
  .concat(TOPICS_QUESTION, {
    type: "TEXT",
    textTr: "Etkinlikle ilgili diğer görüş ve önerileriniz",
    textEn: "Other comments and suggestions about the event",
    required: false,
  });

const isDuplicate = (error: unknown) => (error as { code?: string })?.code === "P2002";

async function run() {
  if ((await db.user.count()) === 0) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    await db.user
      .create({ data: { name: DEFAULT_ADMIN.name, email: DEFAULT_ADMIN.email, passwordHash } })
      .catch((error) => {
        if (!isDuplicate(error)) throw error; // another instance created it first
      });
  }

  await db.settings
    .upsert({ where: { key: "main" }, update: {}, create: DEFAULT_SETTINGS })
    .catch((error) => {
      if (!isDuplicate(error)) throw error;
    });

  if ((await db.question.count()) === 0) {
    await db.question.createMany({
      data: DEFAULT_QUESTIONS.map((q, order) => ({ ...q, options: q.options ?? [], allowOther: q.allowOther ?? false, order })),
    });
  }
}

let pending: Promise<void> | null = null;

export function ensureDefaults() {
  pending ??= run().catch((error) => {
    pending = null; // try again on the next call
    throw error;
  });
  return pending;
}
