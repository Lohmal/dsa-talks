import type { Metadata } from "next";
import { db } from "@/lib/db";
import { responseTalks } from "@/lib/talks";
import { formatDate } from "@/lib/time";
import VerifyView, { type VerifiedCertificate } from "@/components/VerifyView";

export const metadata: Metadata = {
  title: "Sertifika Doğrulama | DSATalks",
  description: "DSATalks sertifika doğrulama – Certificate verification",
  robots: { index: false, follow: false },
};

// /dogrula?no=DSAT-2026-XXXXXX – linked from the QR code and the number on each certificate.
// Shows only what is printed on the certificate itself (no e-mail or answers).
export default async function VerifyPage({ searchParams }: PageProps<"/dogrula">) {
  const raw = (await searchParams).no;
  const query = (typeof raw === "string" ? raw : "").trim().toUpperCase().slice(0, 40);

  let certificate: VerifiedCertificate | null = null;
  if (query) {
    const response = await db.response.findUnique({
      where: { certificateNo: query },
      select: {
        name: true,
        certificateNo: true,
        certificateDate: true,
        createdAt: true,
        talks: true,
        speaker: true,
        talkTitleTr: true,
        talkTitleEn: true,
      },
    });
    if (response) {
      certificate = {
        name: response.name,
        certificateNo: response.certificateNo,
        date: response.certificateDate,
        issued: { tr: formatDate(response.createdAt, "tr"), en: formatDate(response.createdAt, "en") },
        talks: responseTalks(response).map((talk) => ({ speaker: talk.speaker, title: { tr: talk.titleTr, en: talk.titleEn } })),
      };
    }
  }

  return <VerifyView query={query} certificate={certificate} />;
}
