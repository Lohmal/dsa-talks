import "server-only";
import nodemailer from "nodemailer";
import { certificateFileName } from "./certificate";

// SMTP comes from .env: Google Workspace (smtp.gmail.com) with the app password of
// confdsa@atu.edu.tr. Leaving SMTP_USER empty sends without logging in (IP-based relay).
// One shared, pooled connection per process: Gmail refuses many parallel logins from one account.
const shared = globalThis as { smtp?: ReturnType<typeof nodemailer.createTransport> };
function transport() {
  const user = process.env.SMTP_USER;
  shared.smtp ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: user ? { user, pass: process.env.SMTP_PASS } : undefined,
    pool: true,
    maxConnections: 1,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });
  return shared.smtp;
}

// The texts of the certificate e-mail, from the year's texts (İçerik → Metinler → Sertifika e-postası)
// in the participant's language. {event} = the event name, {name} = the participant.
export type MailTexts = {
  subject: string;
  greeting: string;
  body: string;
  talk: string;
  number: string;
  closing: string;
  footer: string;
};

// The event name at the top of the e-mail: "DSATalks" as "DSA" + "Talks", otherwise the first
// word in red and the rest in navy, like the site's wordmark.
function wordmark(event: string) {
  const split = event.startsWith("DSA") ? 3 : event.indexOf(" ") < 0 ? event.length : event.indexOf(" ");
  return `<span style="color:#d7182a">${escape(event.slice(0, split))}</span><span style="color:#13224b">${escape(event.slice(split))}</span>`;
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export async function sendCertificateMail(input: {
  texts: MailTexts;
  eventName: string;
  to: string;
  name: string;
  locale: string;
  certificateNo: string;
  talk?: string | null;
  pdf: Uint8Array;
}) {
  const fill = (text: string) => text.replaceAll("{event}", input.eventName).replaceAll("{name}", input.name);
  const t = input.texts;
  const talkLine = input.talk ? `${t.talk}: ${input.talk}` : "";

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#13224b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#d7182a;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px 0;font-size:28px;font-weight:900;letter-spacing:-1px">
          ${wordmark(input.eventName)}
        </td></tr>
        <tr><td style="padding:20px 32px 8px;font-size:16px;line-height:1.6">
          <p style="margin:0 0 12px">${escape(fill(t.greeting))}</p>
          <p style="margin:0 0 12px">${escape(fill(t.body))}</p>
          ${talkLine ? `<p style="margin:0 0 12px;color:#5b6478">${escape(talkLine)}</p>` : ""}
          <p style="margin:0 0 12px;color:#5b6478">${escape(t.number)}: <strong style="color:#13224b">${escape(input.certificateNo)}</strong></p>
          <p style="margin:24px 0 0">${escape(t.closing)}<br><strong>${escape(input.eventName)}</strong></p>
        </td></tr>
        <tr><td style="padding:24px 32px 28px;font-size:12px;color:#8a93ab">${escape(fill(t.footer))}</td></tr>
        <tr><td style="background:#13224b;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [fill(t.greeting), "", fill(t.body), talkLine, `${t.number}: ${input.certificateNo}`, "", t.closing, input.eventName]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");

  await transport().sendMail({
    from: process.env.MAIL_FROM || "CONFDSA <confdsa@atu.edu.tr>",
    to: { name: input.name, address: input.to },
    subject: fill(t.subject),
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

// Frame of the admin panel e-mails (Turkish only, like the panel).
const panelHtml = (body: string) => `<!doctype html>
<html><body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#13224b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#d7182a;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px 0;font-size:28px;font-weight:900;letter-spacing:-1px">
          <span style="color:#13224b">CONF</span><span style="color:#d7182a">DSA</span>
          <span style="display:block;margin-top:4px;font-size:11px;font-weight:700;letter-spacing:3px;color:#8a93ab">YÖNETİM PANELİ</span>
        </td></tr>
        <tr><td style="padding:20px 32px 8px;font-size:16px;line-height:1.6">
          ${body}
        </td></tr>
        <tr><td style="background:#13224b;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// "Şifremi unuttum" (and first-admin setup) link for the admin panel.
export async function sendPasswordResetMail(input: { to: string; name: string; url: string }) {
  const text = [
    `Merhaba ${input.name},`,
    "",
    "CONFDSA yönetim paneli için şifre belirleme isteği aldık. Yeni şifrenizi belirlemek için aşağıdaki bağlantıyı açın:",
    input.url,
    "",
    "Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.",
    "",
    "CONFDSA",
  ].join("\n");

  const html = panelHtml(`<p style="margin:0 0 12px">Merhaba ${escape(input.name)},</p>
          <p style="margin:0 0 20px">Yönetim paneli için şifre belirleme isteği aldık. Yeni şifrenizi belirlemek için butona tıklayın:</p>
          <p style="margin:0 0 20px"><a href="${escape(input.url)}" style="display:inline-block;background:#d7182a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">Şifremi belirle</a></p>
          <p style="margin:0 0 12px;font-size:13px;color:#5b6478">Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.</p>`);

  await transport().sendMail({
    from: process.env.MAIL_FROM || "CONFDSA <confdsa@atu.edu.tr>",
    to: { name: input.name, address: input.to },
    subject: "CONFDSA yönetim paneli – şifre belirleme",
    text,
    html,
  });
}

// The 6-digit code asked for after the password when signing in to the admin panel.
export async function sendLoginCodeMail(input: { to: string; name: string; code: string; minutes: number }) {
  const note = `Kod ${input.minutes} dakika geçerlidir. Bu girişi siz yapmadıysanız şifreniz başkasının elinde olabilir; “Şifremi unuttum” ile hemen yeni bir şifre belirleyin.`;
  const text = [
    `Merhaba ${input.name},`,
    "",
    "CONFDSA yönetim paneline giriş için doğrulama kodunuz:",
    input.code,
    "",
    note,
    "",
    "CONFDSA",
  ].join("\n");

  const html = panelHtml(`<p style="margin:0 0 12px">Merhaba ${escape(input.name)},</p>
          <p style="margin:0 0 16px">Yönetim paneline giriş için doğrulama kodunuz:</p>
          <p style="margin:0 0 20px;font-size:32px;font-weight:900;letter-spacing:8px;color:#13224b">${escape(input.code)}</p>
          <p style="margin:0 0 12px;font-size:13px;color:#5b6478">${escape(note)}</p>`);

  await transport().sendMail({
    from: process.env.MAIL_FROM || "CONFDSA <confdsa@atu.edu.tr>",
    to: { name: input.name, address: input.to },
    subject: `CONFDSA yönetim paneli – giriş kodu: ${input.code}`,
    text,
    html,
  });
}
