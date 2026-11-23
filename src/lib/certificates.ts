import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import type { Response } from "@prisma/client";
import { renderCertificatePdf, type CertificateData } from "./certificate";
import { sendCertificateMail } from "./mail";
import { verifyUrl } from "./origin";
import { responseTalks, talkTitles } from "./talks";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I look-alikes

// "DSAT-2026-7K4Q2M"; uniqueness is enforced by the database index.
export function newCertificateNo() {
  const code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `DSAT-2026-${code}`;
}

// The secret part of the download link; long enough that links cannot be guessed.
export const newCertificateToken = () => randomBytes(24).toString("base64url");

export function certificateDataOf(response: Response): CertificateData {
  return {
    name: response.name,
    certificateNo: response.certificateNo,
    certificateDate: response.certificateDate,
    talks: responseTalks(response).map((talk) => ({ speaker: talk.speaker, title: talk.titleEn || talk.titleTr })),
    verifyUrl: verifyUrl(response.certificateNo),
  };
}

// Renders the PDF and mails it; throws on failure. Only the mail queue (mailQueue.ts) calls
// this, so the outcome is recorded and retried there.
export async function sendCertificate(response: Response) {
  const pdf = await renderCertificatePdf(certificateDataOf(response));
  await sendCertificateMail({
    to: response.email,
    name: response.name,
    locale: response.locale,
    certificateNo: response.certificateNo,
    talk: talkTitles(responseTalks(response), response.locale) || null,
    pdf,
  });
}
