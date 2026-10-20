"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getQuestions, getSettings, GRACE_MS, tidyName } from "@/lib/survey";
import { formatDate } from "@/lib/time";
import { mailCertificate, newCertificateNo, newCertificateToken } from "@/lib/certificates";
import type { SubmitResult } from "@/components/survey/types";

const details = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.email().max(200),
});

const isUniqueError = (error: unknown, field: string) => {
  const e = error as { code?: string; meta?: { target?: unknown } };
  return e?.code === "P2002" && String(e.meta?.target ?? "").includes(field);
};

export async function submitSurvey(formData: FormData): Promise<SubmitResult> {
  // Bots fill every field, people never see this one.
  if (formData.get("website")) return { status: "error", code: "server" };

  const locale = formData.get("locale") === "en" ? "en" : "tr";
  const now = new Date();

  try {
    // 1. Is the survey still open for what this visitor was shown?
    const settings = await getSettings();
    const sessionId = String(formData.get("sessionId") ?? "") || null;
    if (!settings.isOpen) return { status: "error", code: "closed" };

    let session = null;
    if (settings.mode === "SESSION") {
      session = sessionId && /^[a-f0-9]{24}$/.test(sessionId)
        ? await db.surveySession.findUnique({ where: { id: sessionId } })
        : null;
      const inWindow =
        session && session.startsAt <= now && now.getTime() < session.endsAt.getTime() + GRACE_MS;
      if (!inWindow) return { status: "error", code: "closed" };
    }

    // 2. Validate the participant and the answers.
    const fields: string[] = [];
    const parsed = details.safeParse({
      name: formData.get("name"),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) fields.push(String(issue.path[0]));
    }

    const questions = await getQuestions();
    const answers = questions.map((question) => {
      const raw = formData.get(`q_${question.id}`);
      const base = { questionId: question.id, type: question.type, textTr: question.textTr, textEn: question.textEn };
      if (question.type === "RATING") {
        const rating = Number(raw);
        const valid = Number.isInteger(rating) && rating >= 1 && rating <= 5;
        if (!valid && question.required) fields.push(question.id);
        return { ...base, rating: valid ? rating : null, text: null };
      }
      const text = String(raw ?? "").trim().slice(0, 3000);
      if (!text && question.required) fields.push(question.id);
      return { ...base, rating: null, text: text || null };
    });

    if (fields.length || !parsed.success) return { status: "error", code: "invalid", fields: [...new Set(fields)] };

    const email = parsed.data.email;
    const scope = session ? `session:${session.id}` : "event";
    const duplicate = session ? "duplicateSession" : "duplicate";

    if (await db.response.findUnique({ where: { email_scope: { email, scope } }, select: { id: true } })) {
      return { status: "error", code: duplicate };
    }

    // 3. Save. The unique index (email + scope) is the real guard against double submissions.
    const data = {
      name: tidyName(parsed.data.name, locale),
      email,
      scope,
      mode: settings.mode,
      sessionId: session?.id ?? null,
      speaker: session?.speaker ?? null,
      talkTitleTr: session?.titleTr ?? null,
      talkTitleEn: session?.titleEn ?? null,
      sessionStartsAt: session?.startsAt ?? null,
      sessionEndsAt: session?.endsAt ?? null,
      answers,
      locale,
      certificateDate: session ? formatDate(session.startsAt, "en") : settings.certificateDate,
      certificateToken: newCertificateToken(),
    };

    let response = null;
    for (let attempt = 0; !response && attempt < 5; attempt++) {
      try {
        response = await db.response.create({ data: { ...data, certificateNo: newCertificateNo() } });
      } catch (error) {
        if (isUniqueError(error, "email")) return { status: "error", code: duplicate };
        if (!isUniqueError(error, "certificateNo")) throw error;
      }
    }
    if (!response) throw new Error("Could not allocate a certificate number");

    // 4. E-mail the certificate; a mail problem does not undo the saved answers.
    const emailSent = await mailCertificate(response);

    return {
      status: "success",
      name: response.name,
      email: response.email,
      certificateNo: response.certificateNo,
      token: response.certificateToken,
      emailSent,
    };
  } catch (error) {
    console.error("[survey] submission failed:", error);
    return { status: "error", code: "server" };
  }
}
