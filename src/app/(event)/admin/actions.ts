"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_EDITION_COOKIE, adminEdition, conferenceContent, eventContent, getEdition } from "@/lib/editions";
import { seedQuestions } from "@/lib/bootstrap";
import { eventDefaults } from "@/content/event";
import { fromIstanbul } from "@/lib/time";
import { queueCertificateMail, requeueFailedMails } from "@/lib/mailQueue";
import type { ActionState } from "@/components/admin/forms";

// Every action re-checks the admin session first; the forms live in src/app/(event)/admin/(panel).
// Survey settings, windows, questions and responses belong to the event year chosen at the top
// of the panel (adminEdition); changes by id also check that year, so a form left open while
// another year was chosen cannot touch the wrong one.

const ok = (message: string): ActionState => {
  revalidatePath("/admin", "layout");
  return { ok: true, message };
};
const fail = (message: string): ActionState => ({ ok: false, message });
const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "Geçersiz değer.";

// ── Event year shown in the panel ─────────────────────────────────────────────────────

export async function selectEdition(id: string) {
  await requireAdmin();
  if (!(await getEdition(id))) return;
  (await cookies()).set(ADMIN_EDITION_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/admin", "layout");
}

// ── Survey switch, mode and event details ────────────────────────────────────────────

export async function setSurveyOpen(_: ActionState, formData: FormData) {
  await requireAdmin();
  const edition = await adminEdition();
  const isOpen = formData.get("open") === "1";
  await db.edition.update({ where: { id: edition.id }, data: { isOpen } });
  return ok(isOpen ? "Anket açıldı; yanıt alınıyor." : "Anket kapatıldı; artık yanıt alınmıyor.");
}

export async function setMode(_: ActionState, formData: FormData) {
  await requireAdmin();
  const edition = await adminEdition();
  const mode = formData.get("mode") === "SESSION" ? "SESSION" : "EVENT";
  await db.edition.update({ where: { id: edition.id }, data: { mode } });
  return ok(mode === "EVENT" ? "Toplantı bazında moda geçildi." : "Konuşmacı bazında moda geçildi.");
}

const eventInfo = z.object({
  eventName: z.string().min(2, "Etkinlik adı gerekli."),
  speakersText: z.string().min(2, "Konuşmacılar alanı gerekli."),
  eventDateTr: z.string().min(2, "Tarih (TR) gerekli."),
  eventDateEn: z.string().min(2, "Tarih (EN) gerekli."),
  venueTr: z.string().min(2, "Yer (TR) gerekli."),
  venueEn: z.string().min(2, "Yer (EN) gerekli."),
  certificateDate: z.string().min(2, "Sertifika tarihi gerekli."),
  // An uploaded file (/media/<id>) or a file of the site (/images/...); empty: the default.
  certificateLogo: z
    .string()
    .max(300)
    .refine((value) => value === "" || /^\/(media|images)\/[\w./-]+$/.test(value), "Logo adresi geçersiz.")
    .transform((value) => value || null),
});

export async function saveEventInfo(_: ActionState, formData: FormData) {
  await requireAdmin();
  const parsed = eventInfo.safeParse(Object.fromEntries(Object.keys(eventInfo.shape).map((k) => [k, text(formData, k)])));
  if (!parsed.success) return fail(firstError(parsed.error));
  const edition = await adminEdition();
  await db.edition.update({ where: { id: edition.id }, data: parsed.data });
  return ok("Etkinlik bilgileri kaydedildi.");
}

// ── Speaker time windows (SESSION mode) ─────────────────────────────────────────────

// A window has one or more talks; the form sends one speaker/titleTr/titleEn triple per talk.
async function readSession(formData: FormData) {
  const all = (key: string) => formData.getAll(key).map((value) => String(value).trim());
  const [speakers, titlesTr, titlesEn] = [all("speaker"), all("titleTr"), all("titleEn")];
  const talks = speakers
    .map((speaker, i) => ({ speaker, titleTr: titlesTr[i] ?? "", titleEn: titlesEn[i] ?? "" }))
    .filter((talk) => talk.speaker || talk.titleTr || talk.titleEn)
    .map((talk) => ({ ...talk, titleTr: talk.titleTr || talk.titleEn, titleEn: talk.titleEn || talk.titleTr }));
  const startsAt = fromIstanbul(text(formData, "date"), text(formData, "start"));
  const endsAt = fromIstanbul(text(formData, "date"), text(formData, "end"));

  if (talks.length === 0) return { error: "En az bir konuşmacı ekleyin." };
  if (talks.some((talk) => talk.speaker.length < 2)) return { error: "Her konuşmanın konuşmacı adını yazın." };
  if (talks.some((talk) => !talk.titleTr)) return { error: "Her konuşmanın başlığını yazın." };
  if (!startsAt || !endsAt) return { error: "Tarih ve saatleri eksiksiz girin." };
  if (endsAt <= startsAt) return { error: "Bitiş saati başlangıçtan sonra olmalı." };

  // Clearing the old single-talk fields moves a window saved in the old format to `talks`.
  return { data: { talks, speaker: null, titleTr: null, titleEn: null, startsAt, endsAt } };
}

async function overlaps(editionId: string, startsAt: Date, endsAt: Date, exceptId?: string) {
  return db.surveySession.findFirst({
    where: { editionId, startsAt: { lt: endsAt }, endsAt: { gt: startsAt }, ...(exceptId && { id: { not: exceptId } }) },
  });
}

export async function createSession(_: ActionState, formData: FormData) {
  await requireAdmin();
  const edition = await adminEdition();
  const result = await readSession(formData);
  if (!result.data) return fail(result.error!);
  if (await overlaps(edition.id, result.data.startsAt, result.data.endsAt)) {
    return fail("Bu saat aralığı başka bir oturumla çakışıyor.");
  }
  await db.surveySession.create({ data: { ...result.data, editionId: edition.id } });
  return ok("Oturum eklendi.");
}

export async function updateSession(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Oturum bulunamadı.");
  const edition = await adminEdition();
  const result = await readSession(formData);
  if (!result.data) return fail(result.error!);
  if (await overlaps(edition.id, result.data.startsAt, result.data.endsAt, id.data)) {
    return fail("Bu saat aralığı başka bir oturumla çakışıyor.");
  }
  await db.surveySession.updateMany({ where: { id: id.data, editionId: edition.id }, data: result.data });
  return ok("Oturum güncellendi.");
}

export async function deleteSession(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Oturum bulunamadı.");
  // Responses keep their own copy of the speaker and talk, so they stay intact.
  const edition = await adminEdition();
  await db.surveySession.deleteMany({ where: { id: id.data, editionId: edition.id } });
  return ok("Oturum silindi.");
}

// ── Survey questions ────────────────────────────────────────────────────────────────

const question = z.object({
  type: z.enum(["RATING", "TEXT", "CHOICE"]),
  textTr: z.string().min(3, "Soru metni (TR) gerekli.").max(500),
  textEn: z.string().max(500),
  required: z.boolean(),
  allowOther: z.boolean(),
});

// Choice options are written one per line as "Türkçe | English" (English optional).
function readOptions(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [tr, en] = line.split("|").map((part) => part.trim());
      return { tr, en: en || tr };
    });
}

function readQuestion(formData: FormData) {
  const parsed = question.safeParse({
    type: text(formData, "type"),
    textTr: text(formData, "textTr"),
    textEn: text(formData, "textEn"),
    required: formData.get("required") === "on",
    allowOther: formData.get("allowOther") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const choice = parsed.data.type === "CHOICE";
  const options = choice ? readOptions(text(formData, "options")) : [];
  if (choice && options.length < 2) return { error: "Çoklu seçim sorusuna en az iki seçenek yazın." };
  return {
    data: {
      ...parsed.data,
      textEn: parsed.data.textEn || parsed.data.textTr,
      options,
      allowOther: choice && parsed.data.allowOther,
    },
  };
}

export async function createQuestion(_: ActionState, formData: FormData) {
  await requireAdmin();
  const edition = await adminEdition();
  const result = readQuestion(formData);
  if (!result.data) return fail(result.error!);
  const last = await db.question.findFirst({ where: { editionId: edition.id }, orderBy: { order: "desc" }, select: { order: true } });
  await db.question.create({ data: { ...result.data, editionId: edition.id, order: (last?.order ?? -1) + 1 } });
  return ok("Soru eklendi.");
}

export async function updateQuestion(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Soru bulunamadı.");
  const result = readQuestion(formData);
  if (!result.data) return fail(result.error!);
  const edition = await adminEdition();
  await db.question.updateMany({ where: { id: id.data, editionId: edition.id }, data: result.data });
  return ok("Soru güncellendi.");
}

export async function deleteQuestion(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Soru bulunamadı.");
  // Answers already given keep the question text, so results stay readable.
  const edition = await adminEdition();
  await db.question.deleteMany({ where: { id: id.data, editionId: edition.id } });
  return ok("Soru silindi.");
}

export async function moveQuestion(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  const edition = await adminEdition();
  const questions = await db.question.findMany({ where: { editionId: edition.id }, orderBy: { order: "asc" }, select: { id: true } });
  const index = questions.findIndex((q) => q.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= questions.length) return null;
  [questions[index], questions[target]] = [questions[target], questions[index]];
  await db.$transaction(questions.map((q, order) => db.question.update({ where: { id: q.id }, data: { order } })));
  revalidatePath("/admin", "layout");
  return null;
}

// ── Admin users ─────────────────────────────────────────────────────────────────────

const user = z.object({
  name: z.string().min(2, "Ad soyad gerekli.").max(100),
  email: z.email("Geçerli bir e-posta adresi girin."),
  password: z.string(),
});

const isDuplicateEmail = (error: unknown) => (error as { code?: string })?.code === "P2002";

export async function createUser(_: ActionState, formData: FormData) {
  await requireAdmin();
  const parsed = user.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return fail(firstError(parsed.error));
  if (parsed.data.password.length < 8) return fail("Şifre en az 8 karakter olmalı.");
  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });
  } catch (error) {
    if (isDuplicateEmail(error)) return fail("Bu e-posta adresiyle bir yönetici zaten var.");
    throw error;
  }
  return ok("Yönetici eklendi.");
}

export async function updateUser(_: ActionState, formData: FormData) {
  const me = await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Yönetici bulunamadı.");
  const parsed = user.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return fail(firstError(parsed.error));
  const { password, ...data } = parsed.data;
  if (password && password.length < 8) return fail("Yeni şifre en az 8 karakter olmalı.");
  try {
    await db.user.update({
      where: { id: id.data },
      data: { ...data, ...(password && { passwordHash: await bcrypt.hash(password, 10) }) },
    });
  } catch (error) {
    if (isDuplicateEmail(error)) return fail("Bu e-posta adresiyle bir yönetici zaten var.");
    throw error;
  }
  // A new password ends every session of that admin, including this one.
  if (password && id.data === me.id) await signOut({ redirectTo: "/admin/login" });
  return ok(password ? "Bilgiler ve şifre güncellendi." : "Bilgiler güncellendi.");
}

export async function deleteUser(_: ActionState, formData: FormData) {
  const me = await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Yönetici bulunamadı.");
  if ((await db.user.count()) <= 1) return fail("Son yönetici silinemez; önce başka bir yönetici ekleyin.");
  await db.user.delete({ where: { id: id.data } }).catch(() => null);
  if (id.data === me.id) await signOut({ redirectTo: "/admin/login" });
  return ok("Yönetici silindi.");
}

// ── Responses ───────────────────────────────────────────────────────────────────────

export async function resendCertificate(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  const response = id.success ? await db.response.findUnique({ where: { id: id.data } }) : null;
  if (!response) return fail("Yanıt bulunamadı.");
  await queueCertificateMail(response.id);
  return ok(`Sertifika ${response.email} adresine gönderilmek üzere sıraya alındı.`);
}

export async function resendFailedCertificates() {
  await requireAdmin();
  const count = await requeueFailedMails((await adminEdition()).id);
  return ok(count ? `${count} başarısız e-posta yeniden sıraya alındı.` : "Başarısız e-posta yok.");
}

export async function deleteResponse(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Yanıt bulunamadı.");
  await db.response.delete({ where: { id: id.data } }).catch(() => null);
  revalidatePath("/admin", "layout");
  redirect("/admin/responses");
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}

// ── Content of the chosen year (texts, details, speakers, committees, pages) ────────────

const CONTENT_KEYS = ["messages", "site", "speakers", "committees", "pages"];

export async function saveContent(_: ActionState, formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("content") ?? "");
  if (raw.length > 4_000_000) return fail("İçerik çok büyük; kaydedilemedi.");
  let content: unknown;
  try {
    content = JSON.parse(raw);
  } catch {
    return fail("İçerik okunamadı; sayfayı yenileyip tekrar deneyin.");
  }
  if (typeof content !== "object" || content === null || Array.isArray(content)) return fail("İçerik okunamadı.");
  // The whole tree is stored (not only the changes), so this year keeps exactly these texts
  // even when the defaults in the code change later.
  const clean = Object.fromEntries(Object.entries(content).filter(([key]) => CONTENT_KEYS.includes(key)));
  const edition = await adminEdition();
  await db.edition.update({ where: { id: edition.id }, data: { content: clean } });
  revalidatePath("/", "layout");
  return ok(`${edition.event.name} ${edition.year} içeriği kaydedildi.`);
}

// Back to the defaults of the code (everything saved for this year is dropped).
export async function resetContent() {
  await requireAdmin();
  const edition = await adminEdition();
  await db.edition.update({ where: { id: edition.id }, data: { content: {} } });
  revalidatePath("/", "layout");
  return ok("İçerik varsayılanlara döndürüldü.");
}

// ── Events and their years ─────────────────────────────────────────────────────────────

const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Kısa ad küçük harf, rakam ve tire olmalı (ör. veri-gunleri).").max(40);
const prefixSchema = z.string().regex(/^[A-Z0-9]{2,8}$/, "Sertifika öneki 2–8 büyük harf veya rakam olmalı (ör. DSAT).");
const yearSchema = z.coerce.number().int().min(2000, "Geçerli bir yıl yazın.").max(2100, "Geçerli bir yıl yazın.");

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const hasContent = (content: unknown) => isPlainObject(content) && Object.keys(content).length > 0;

async function chooseEdition(id: string) {
  (await cookies()).set(ADMIN_EDITION_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 24 * 365 });
}

// A new event (always the one-page event template), with its first year and the default questions.
export async function createEvent(_: ActionState, formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ name: z.string().min(2, "Etkinlik adı gerekli.").max(60), slug: slugSchema, prefix: prefixSchema, year: yearSchema })
    .safeParse({
      name: text(formData, "name"),
      slug: text(formData, "slug").toLowerCase(),
      prefix: text(formData, "prefix").toUpperCase(),
      year: text(formData, "year"),
    });
  if (!parsed.success) return fail(firstError(parsed.error));
  const { name, slug, prefix, year } = parsed.data;
  if (slug === "confdsa" || (await db.event.findUnique({ where: { slug } }))) return fail("Bu kısa adla bir etkinlik zaten var.");

  // Starts from the texts of the event template with its own name and no speakers yet.
  const content = eventDefaults();
  const messages = content.messages as Record<string, Record<string, unknown>>;
  messages.meta = { ...messages.meta, name: { tr: name, en: name } };
  const last = await db.event.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  const event = await db.event.create({
    data: { slug, name, template: "EVENT", certificatePrefix: prefix, currentYear: year, order: (last?.order ?? 0) + 1 },
  });
  const edition = await db.edition.create({
    data: {
      eventId: event.id,
      year,
      content: JSON.parse(JSON.stringify({ ...content, messages, speakers: [] })),
      eventName: name,
      speakersText: "",
      eventDateTr: "",
      eventDateEn: "",
      venueTr: "",
      venueEn: "",
      certificateDate: "",
    },
  });
  await seedQuestions(edition.id);
  await chooseEdition(edition.id);
  return ok(`${name} ${year} oluşturuldu ve panelde seçildi. Metinleri İçerik sayfasından düzenleyin.`);
}

// A new year of an event. The chosen parts are copied from an earlier year (copies only: the
// earlier year stays as it was; if it still used the code defaults, they are saved into it
// first, so later changes in the code cannot alter it).
export async function createEdition(_: ActionState, formData: FormData) {
  await requireAdmin();
  const source = await getEdition(text(formData, "sourceId"));
  if (!source) return fail("Kopyalanacak yıl bulunamadı.");
  const year = yearSchema.safeParse(text(formData, "year"));
  if (!year.success) return fail(firstError(year.error));
  if (await db.edition.findUnique({ where: { eventId_year: { eventId: source.eventId, year: year.data } } })) {
    return fail(`${source.event.name} ${year.data} zaten var.`);
  }
  const copy = (key: string) => formData.get(key) === "on";
  const conference = source.event.template === "CONFERENCE";
  const resolved = (conference ? conferenceContent(source) : eventContent(source)) as Record<string, unknown>;
  if (!hasContent(source.content)) {
    await db.edition.update({ where: { id: source.id }, data: { content: JSON.parse(JSON.stringify(resolved)) } });
  }

  const content: Record<string, unknown> = {};
  if (copy("texts")) {
    content.messages = resolved.messages;
    content.site = resolved.site;
    if (conference) content.pages = resolved.pages;
  }
  content.speakers = copy("speakers") ? resolved.speakers : [];
  if (copy("committees")) content.committees = resolved.committees;

  const survey = copy("survey")
    ? {
        mode: source.mode,
        eventName: source.eventName,
        speakersText: source.speakersText,
        eventDateTr: source.eventDateTr,
        eventDateEn: source.eventDateEn,
        venueTr: source.venueTr,
        venueEn: source.venueEn,
        certificateDate: source.certificateDate,
        certificateLogo: source.certificateLogo,
      }
    : { eventName: source.event.name, speakersText: "", eventDateTr: "", eventDateEn: "", venueTr: "", venueEn: "", certificateDate: "" };
  const edition = await db.edition.create({
    data: { eventId: source.eventId, year: year.data, content: JSON.parse(JSON.stringify(content)), ...survey },
  });

  if (copy("questions")) {
    const questions = await db.question.findMany({ where: { editionId: source.id }, orderBy: { order: "asc" } });
    await db.question.createMany({
      data: questions.map(({ type, textTr, textEn, required, options, allowOther }, order) => ({
        editionId: edition.id,
        order,
        type,
        textTr,
        textEn,
        required,
        options,
        allowOther,
      })),
    });
  } else {
    await seedQuestions(edition.id);
  }
  if (copy("makeCurrent")) await db.event.update({ where: { id: source.eventId }, data: { currentYear: year.data } });
  await chooseEdition(edition.id);
  revalidatePath("/", "layout");
  return ok(`${source.event.name} ${year.data} oluşturuldu ve panelde seçildi.`);
}

// The year shown at the address of the event (and on the home page for CONFDSA).
export async function makeCurrentYear(_: ActionState, formData: FormData) {
  await requireAdmin();
  const edition = await getEdition(text(formData, "id"));
  if (!edition) return fail("Yıl bulunamadı.");
  await db.event.update({ where: { id: edition.eventId }, data: { currentYear: edition.year } });
  revalidatePath("/", "layout");
  return ok(`${edition.event.name} için güncel yıl artık ${edition.year}.`);
}

export async function updateEvent(_: ActionState, formData: FormData) {
  await requireAdmin();
  const id = objectId.safeParse(text(formData, "id"));
  if (!id.success) return fail("Etkinlik bulunamadı.");
  const parsed = z
    .object({ name: z.string().min(2, "Etkinlik adı gerekli.").max(60), prefix: prefixSchema, order: z.coerce.number().int().min(0).max(999) })
    .safeParse({ name: text(formData, "name"), prefix: text(formData, "prefix").toUpperCase(), order: text(formData, "order") || "0" });
  if (!parsed.success) return fail(firstError(parsed.error));
  await db.event.update({
    where: { id: id.data },
    data: { name: parsed.data.name, certificatePrefix: parsed.data.prefix, order: parsed.data.order },
  });
  revalidatePath("/", "layout");
  return ok("Etkinlik bilgileri kaydedildi.");
}

// Only an empty year can go: no responses, not the current one.
export async function deleteEdition(_: ActionState, formData: FormData) {
  await requireAdmin();
  const edition = await getEdition(text(formData, "id"));
  if (!edition) return fail("Yıl bulunamadı.");
  if (edition.year === edition.event.currentYear) return fail("Güncel yıl silinemez; önce başka bir yılı güncel yapın.");
  if (await db.response.count({ where: { editionId: edition.id } })) return fail("Yanıtı olan bir yıl silinemez.");
  await db.$transaction([
    db.question.deleteMany({ where: { editionId: edition.id } }),
    db.surveySession.deleteMany({ where: { editionId: edition.id } }),
    db.edition.delete({ where: { id: edition.id } }),
  ]);
  const jar = await cookies();
  if (jar.get(ADMIN_EDITION_COOKIE)?.value === edition.id) jar.delete({ name: ADMIN_EDITION_COOKIE, path: "/admin" });
  revalidatePath("/", "layout");
  return ok(`${edition.event.name} ${edition.year} silindi.`);
}
