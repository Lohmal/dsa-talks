import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import type { Response } from "@prisma/client";
import { renderCertificatePdf, type CertificateData } from "./certificate";
import { getEdition, type EditionWithEvent } from "./editions";
import { sendCertificateMail } from "./mail";
import { verifyUrl } from "./origin";
import { readAsset } from "./assets";
import { responseTalks, talkTitles } from "./talks";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I look-alikes

// "DSAT-2026-7K4Q2M": the event's prefix and the year; uniqueness is enforced by the database index.
export function newCertificateNo(edition: EditionWithEvent) {
  const code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${edition.event.certificatePrefix}-${edition.year}-${code}`;
}

// The secret part of the download link; long enough that links cannot be guessed.
export const newCertificateToken = () => randomBytes(24).toString("base64url");

const dataUrl = (bytes: Uint8Array, type: string) => `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;

// The second logo of a year's certificates: the image chosen for the year (an uploaded file or
// a file under public/; PNG or JPEG), otherwise the DSATalks logo for DSATalks, otherwise none.
async function certificateLogo(edition: EditionWithEvent) {
  const path = edition.certificateLogo?.trim();
  try {
    if (path?.startsWith("/media/")) {
      const asset = await readAsset(path.slice("/media/".length));
      return asset ? dataUrl(asset.data, asset.contentType) : null;
    }
    if (path?.startsWith("/")) {
      const file = normalize(join(process.cwd(), "public", path));
      if (!file.startsWith(normalize(join(process.cwd(), "public")))) return null;
      return dataUrl(await readFile(file), /\.jpe?g$/i.test(path) ? "image/jpeg" : "image/png");
    }
  } catch (error) {
    console.error("[certificate] logo could not be read:", path, error);
    return null;
  }
  if (edition.event.slug === "dsatalks") {
    return dataUrl(await readFile(join(process.cwd(), "src/assets/certificate/dsa-talks.png")), "image/png");
  }
  return null;
}

export async function certificateDataOf(response: Response): Promise<CertificateData> {
  const edition = await getEdition(response.editionId);
  if (!edition) throw new Error(`Response ${response.id} has no event year`);
  return {
    eventName: edition.eventName || edition.event.name,
    logo: await certificateLogo(edition),
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
  const data = await certificateDataOf(response);
  const pdf = await renderCertificatePdf(data);
  await sendCertificateMail({
    eventName: data.eventName,
    to: response.email,
    name: response.name,
    locale: response.locale,
    certificateNo: response.certificateNo,
    talk: talkTitles(responseTalks(response), response.locale) || null,
    pdf,
  });
}
