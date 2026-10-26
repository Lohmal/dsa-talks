"use server";

import { AuthError } from "next-auth";
import { ExpiredCode, checkPassword, signIn } from "@/auth";
import { db } from "@/lib/db";
import { CODE_MINUTES, resendLoginCode, startLoginCode } from "@/lib/loginCode";
import { sendLoginCodeMail } from "@/lib/mail";

// Signing in takes two steps: e-mail and password, then the code e-mailed to the admin.
export type LoginState =
  | { step: "password"; error?: string }
  | { step: "code"; ticket: string; email: string; error?: string; resent?: boolean };

const isDev = process.env.NODE_ENV !== "production";

// Without SMTP a local server could never sign in, so outside production the code is also
// printed to the server console and a failed send does not stop the sign-in.
async function mailCode(user: { email: string; name: string }, code: string) {
  if (isDev) console.info(`[login] code for ${user.email}: ${code}`);
  try {
    await sendLoginCodeMail({ to: user.email, name: user.name, code, minutes: CODE_MINUTES });
    return true;
  } catch (error) {
    console.error("[login] could not send the code:", error);
    return isDev;
  }
}

async function sendCode(formData: FormData): Promise<LoginState> {
  const user = await checkPassword(formData.get("email"), formData.get("password"));
  if (user === "locked") {
    return {
      step: "password",
      error: "Çok fazla hatalı deneme yapıldı. 15 dakika sonra tekrar deneyin veya şifrenizi sıfırlayın.",
    };
  }
  if (!user) return { step: "password", error: "E-posta veya şifre hatalı." };

  const started = await startLoginCode(user.id);
  if (!started) return { step: "password", error: "Kısa sürede çok fazla kod istendi. 15 dakika sonra tekrar deneyin." };
  if (!(await mailCode(user, started.code))) {
    return { step: "password", error: "Doğrulama kodu e-postası gönderilemedi. Biraz sonra tekrar deneyin." };
  }
  return { step: "code", ticket: started.ticket, email: user.email };
}

async function resendCode(state: Extract<LoginState, { step: "code" }>): Promise<LoginState> {
  const resent = await resendLoginCode(state.ticket);
  const user = resent && (await db.user.findUnique({ where: { id: resent.userId } }));
  if (!resent || !user) {
    return { ...state, resent: false, error: "Bu giriş için yeni kod gönderilemiyor. Geri dönüp şifrenizle tekrar giriş yapın." };
  }
  if (!(await mailCode(user, resent.code))) {
    return { ...state, resent: false, error: "Doğrulama kodu e-postası gönderilemedi. Biraz sonra tekrar deneyin." };
  }
  return { ...state, resent: true, error: undefined };
}

async function verifyCode(state: Extract<LoginState, { step: "code" }>, formData: FormData): Promise<LoginState> {
  const next = String(formData.get("next") ?? "");
  try {
    await signIn("credentials", {
      ticket: state.ticket,
      code: formData.get("code"),
      // Only paths inside the panel, never another site.
      redirectTo: next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin",
    });
    return state;
  } catch (error) {
    if (error instanceof ExpiredCode) {
      return {
        ...state,
        resent: false,
        error: "Kodun süresi doldu ya da çok fazla hatalı deneme yapıldı. Yeni kod isteyin.",
      };
    }
    if (error instanceof AuthError) return { ...state, resent: false, error: "Kod hatalı. Tekrar deneyin." };
    throw error; // the redirect after a successful sign-in
  }
}

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const intent = formData.get("intent");
  if (intent === "back") return { step: "password" };
  if (state.step === "code" && intent === "resend") return resendCode(state);
  if (state.step === "code" && intent === "code") return verifyCode(state, formData);
  return sendCode(formData);
}
