import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";

// The participation certificate (English only), drawn after the approved design:
// red/navy frame with corner stripes, the logos, the participant's name and the event.

export type CertificateData = {
  name: string;
  certificateNo: string;
  certificateDate: string; // "4–5 November 2026"
  talks?: { speaker: string; title: string }[]; // SESSION mode: the talks of the attended window
  verifyUrl: string; // the verification page for this certificate (printed and as a QR code)
};

const W = 2000;
const H = 1414;
const NAVY = "#13224b";
const RED = "#c8102e";
const MUTED = "#4a5578";
const UNIVERSITY = "Adana Alparslan Türkeş Science and Technology University";
const ORGANIZER = `the Department of Data Science and Analytics at ${UNIVERSITY}`;

const assets = join(process.cwd(), "src/assets");

type Assets = {
  fonts: { name: string; data: Buffer; weight: 400 | 500 | 600 | 700 | 900; style: "normal" | "italic" }[];
  logos: string[];
};

let loaded: Promise<Assets> | null = null;

function loadAssets(): Promise<Assets> {
  loaded ??= (async (): Promise<Assets> => {
    const font = (file: string) => readFile(join(assets, "fonts", file));
    const logo = async (file: string) =>
      `data:image/png;base64,${(await readFile(join(assets, "certificate", file))).toString("base64")}`;
    const [regular, medium, semibold, bold, black, boldItalic, mediumItalic, ...logos] = await Promise.all([
      font("Poppins-Regular.ttf"),
      font("Poppins-Medium.ttf"),
      font("Poppins-SemiBold.ttf"),
      font("Poppins-Bold.ttf"),
      font("Poppins-Black.ttf"),
      font("Poppins-BoldItalic.ttf"),
      font("Poppins-MediumItalic.ttf"),
      logo("atu.png"),
      logo("dsa-talks.png"),
    ]);
    return {
      fonts: [
        { name: "Poppins", data: regular, weight: 400, style: "normal" },
        { name: "Poppins", data: medium, weight: 500, style: "normal" },
        { name: "Poppins", data: semibold, weight: 600, style: "normal" },
        { name: "Poppins", data: bold, weight: 700, style: "normal" },
        { name: "Poppins", data: black, weight: 900, style: "normal" },
        { name: "Poppins", data: boldItalic, weight: 700, style: "italic" },
        { name: "Poppins", data: mediumItalic, weight: 500, style: "italic" },
      ],
      logos,
    };
  })().catch((error) => {
    loaded = null;
    throw error;
  });
  return loaded;
}

type Token = { text: string; tone?: "brand" | "talk"; suffix?: string };

// Satori wraps flex items, not inline text runs, so the sentence is laid out word by word.
function sentence(data: CertificateData): Token[] {
  const words = (text: string, tone?: Token["tone"]) =>
    text
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ text: word, tone }));

  const ending = [
    { text: "DSATalks", tone: "brand" as const, suffix: "," },
    ...words(`held on ${data.certificateDate} and organized by ${ORGANIZER}.`),
  ];

  const talks = data.talks ?? [];
  if (talks.length) {
    // “A” by X · “A” by X and “B” by Y · “A” by X, “B” by Y and “C” by Z
    const list = talks.flatMap((talk, i) => [
      ...(i === 0 ? [] : words(i === talks.length - 1 ? "and" : "")),
      ...words(`“${talk.title}”`, "talk"),
      ...words("by"),
      // The speaker stays on one line ("Prof. Dr. …" never splits).
      { text: talk.speaker, suffix: i < talks.length - 2 ? "," : undefined },
    ]);
    return [...words(`in recognition of attending the ${talks.length > 1 ? "talks" : "talk"}`), ...list, ...words("at"), ...ending];
  }
  return [...words("in recognition of participation in"), ...ending];
}

function Corner({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="270"
      height="270"
      viewBox="0 0 270 270"
      style={{ position: "absolute", ...(flip ? { right: 70, bottom: 70, transform: "rotate(180deg)" } : { left: 70, top: 70 }) }}
    >
      <polygon points="0,0 142,0 0,142" fill={RED} />
      <polygon points="142,0 270,0 0,270 0,142" fill={NAVY} />
    </svg>
  );
}

function Certificate({ data, logos, qr }: { data: CertificateData; logos: string[]; qr: string }) {
  const tokens = sentence(data);
  const long = tokens.length > 38; // several talks: a slightly smaller, wider paragraph
  const nameSize = Math.max(56, Math.min(86, Math.round((86 * 26) / Math.max(26, data.name.length))));

  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        background: "white",
        fontFamily: "Poppins",
        color: NAVY,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 24, background: RED }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26, background: NAVY }} />
      <div style={{ position: "absolute", left: 52, right: 52, top: 50, bottom: 52, border: `4px solid ${NAVY}` }} />
      <div style={{ position: "absolute", left: 68, right: 68, top: 68, bottom: 70, border: `2px solid ${RED}` }} />
      <Corner />
      <Corner flip />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 96,
          bottom: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 64 }}>
          {logos.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
            <img key={index} src={src} width={150} height={150} alt="" />
          ))}
        </div>

        <div style={{ marginTop: 28, fontSize: 26, fontWeight: 700, letterSpacing: 9, textTransform: "uppercase" }}>
          {UNIVERSITY}
        </div>

        <div style={{ marginTop: 44, fontSize: 116, fontWeight: 900, letterSpacing: 26, lineHeight: 1, paddingLeft: 26 }}>
          CERTIFICATE
        </div>
        <div style={{ marginTop: 34, fontSize: 40, fontWeight: 700, letterSpacing: 18, color: RED, paddingLeft: 18 }}>
          OF PARTICIPATION
        </div>

        <div style={{ marginTop: 52, fontSize: 31, color: MUTED }}>This certificate is presented to</div>

        <div
          style={{
            marginTop: 18,
            width: 1320,
            display: "flex",
            justifyContent: "center",
            paddingBottom: 22,
            borderBottom: `3px solid ${NAVY}`,
            fontSize: nameSize,
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: 1.15,
            textAlign: "center",
          }}
        >
          {data.name}
        </div>

        <div
          style={{
            marginTop: 44,
            width: long ? 1360 : 1260,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: long ? 29 : 32,
            lineHeight: 1.6,
          }}
        >
          {tokens.map((token, index) => (
            <span key={index} style={{ display: "flex", marginRight: 10 }}>
              <span
                style={{
                  ...(token.tone === "brand" && { color: RED, fontWeight: 700 }),
                  ...(token.tone === "talk" && { fontWeight: 700, fontStyle: "italic" }),
                }}
              >
                {token.text}
              </span>
              {token.suffix}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            padding: "20px 52px",
            borderRadius: 999,
            background: NAVY,
            color: "white",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          {data.certificateDate}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 34,
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontSize: 28,
            fontWeight: 500,
            fontStyle: "italic",
          }}
        >
          <div style={{ width: 64, height: 6, borderRadius: 3, background: RED }} />
          For a Better Future
          <div style={{ width: 64, height: 6, borderRadius: 3, background: RED }} />
        </div>
      </div>

      {/* Verification: QR code and the certificate number, bottom left. */}
      <div
        style={{
          position: "absolute",
          left: 104,
          bottom: 100,
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
          color: MUTED,
          fontSize: 18,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
        <img src={qr} width={112} height={112} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 2 }}>
          <span style={{ fontWeight: 600, color: NAVY, letterSpacing: 1 }}>{`Certificate No: ${data.certificateNo}`}</span>
          <span>{`Verify at ${data.verifyUrl.replace(/^https?:\/\//, "").replace(/\?.*$/, "")}`}</span>
        </div>
      </div>
    </div>
  );
}

export async function renderCertificatePng(data: CertificateData) {
  const [{ fonts, logos }, qr] = await Promise.all([
    loadAssets(),
    QRCode.toDataURL(data.verifyUrl, { margin: 0, width: 224, errorCorrectionLevel: "M", color: { dark: NAVY, light: "#ffffff" } }),
  ]);
  const image = new ImageResponse(<Certificate data={data} logos={logos} qr={qr} />, { width: W, height: H, fonts });
  return new Uint8Array(await image.arrayBuffer());
}

// A4 landscape PDF with the certificate image filling the page.
export async function renderCertificatePdf(data: CertificateData) {
  const png = await renderCertificatePng(data);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`DSATalks Certificate – ${data.name}`);
  pdf.setAuthor(UNIVERSITY);
  pdf.setCreator("DSATalks");
  const page = pdf.addPage([841.89, 595.28]);
  const image = await pdf.embedPng(png);
  page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  return pdf.save();
}

export function certificateFileName(certificateNo: string, extension: "pdf" | "png") {
  return `DSATalks-Certificate-${certificateNo}.${extension}`;
}
