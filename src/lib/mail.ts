import "server-only";
import nodemailer from "nodemailer";
import { certificateFileName } from "./certificate";

// SMTP comes from .env: Google Workspace (smtp.gmail.com) with the app password of
// confdsa@atu.edu.tr. Leaving SMTP_USER empty sends without logging in (IP-based relay).
function transport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: user ? { user, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });
}

const copy = {
  tr: {
    subject: "DSATalks katılım sertifikanız",
    greeting: (name: string) => `Merhaba ${name},`,
    body: "Etkinlik Memnuniyet Anketi’ni doldurduğunuz için teşekkür ederiz. DSATalks katılım sertifikanız ektedir.",
    talk: "Konuşma",
    number: "Sertifika numarası",
    closing: "Daha iyi bir gelecek için,",
  },
  en: {
    subject: "Your DSATalks certificate of participation",
    greeting: (name: string) => `Dear ${name},`,
    body: "Thank you for completing the Event Satisfaction Survey. Your DSATalks certificate of participation is attached.",
    talk: "Talk",
    number: "Certificate number",
    closing: "For a better future,",
  },
};

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export async function sendCertificateMail(input: {
  to: string;
  name: string;
  locale: string;
  certificateNo: string;
  talk?: string | null;
  pdf: Uint8Array;
}) {
  const t = input.locale === "en" ? copy.en : copy.tr;
  const talkLine = input.talk ? `${t.talk}: ${input.talk}` : "";

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#13224b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#d7182a;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px 0;font-size:28px;font-weight:900;letter-spacing:-1px">
          <span style="color:#d7182a">DSA</span><span style="color:#13224b">Talks</span>
        </td></tr>
        <tr><td style="padding:20px 32px 8px;font-size:16px;line-height:1.6">
          <p style="margin:0 0 12px">${escape(t.greeting(input.name))}</p>
          <p style="margin:0 0 12px">${escape(t.body)}</p>
          ${talkLine ? `<p style="margin:0 0 12px;color:#5b6478">${escape(talkLine)}</p>` : ""}
          <p style="margin:0 0 12px;color:#5b6478">${escape(t.number)}: <strong style="color:#13224b">${escape(input.certificateNo)}</strong></p>
          <p style="margin:24px 0 0">${escape(t.closing)}<br><strong>DSATalks</strong></p>
        </td></tr>
        <tr><td style="padding:24px 32px 28px;font-size:12px;color:#8a93ab">Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi · Veri Bilimi ve Analitiği Bölümü</td></tr>
        <tr><td style="background:#13224b;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [t.greeting(input.name), "", t.body, talkLine, `${t.number}: ${input.certificateNo}`, "", t.closing, "DSATalks"]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");

  await transport().sendMail({
    from: process.env.MAIL_FROM || "DSATalks <confdsa@atu.edu.tr>",
    to: { name: input.name, address: input.to },
    subject: t.subject,
    text,
    html,
    attachments: [
      {
        filename: certificateFileName(input.certificateNo, "pdf"),
        content: Buffer.from(input.pdf),
        contentType: "application/pdf",
      },
    ],
  });
}

// "Şifremi unuttum" (and first-admin setup) link for the admin panel. Turkish only, like the panel.
export async function sendPasswordResetMail(input: { to: string; name: string; url: string }) {
  const text = [
    `Merhaba ${input.name},`,
    "",
    "DSATalks yönetim paneli için şifre belirleme isteği aldık. Yeni şifrenizi belirlemek için aşağıdaki bağlantıyı açın:",
    input.url,
    "",
    "Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.",
    "",
    "DSATalks",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#13224b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#d7182a;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px 0;font-size:28px;font-weight:900;letter-spacing:-1px">
          <span style="color:#d7182a">DSA</span><span style="color:#13224b">Talks</span>
          <span style="display:block;margin-top:4px;font-size:11px;font-weight:700;letter-spacing:3px;color:#8a93ab">YÖNETİM PANELİ</span>
        </td></tr>
        <tr><td style="padding:20px 32px 8px;font-size:16px;line-height:1.6">
          <p style="margin:0 0 12px">Merhaba ${escape(input.name)},</p>
          <p style="margin:0 0 20px">Yönetim paneli için şifre belirleme isteği aldık. Yeni şifrenizi belirlemek için butona tıklayın:</p>
          <p style="margin:0 0 20px"><a href="${escape(input.url)}" style="display:inline-block;background:#d7182a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">Şifremi belirle</a></p>
          <p style="margin:0 0 12px;font-size:13px;color:#5b6478">Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.</p>
        </td></tr>
        <tr><td style="background:#13224b;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await transport().sendMail({
    from: process.env.MAIL_FROM || "DSATalks <confdsa@atu.edu.tr>",
    to: { name: input.name, address: input.to },
    subject: "DSATalks yönetim paneli – şifre belirleme",
    text,
    html,
  });
}
