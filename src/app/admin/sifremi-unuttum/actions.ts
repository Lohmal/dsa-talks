"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { createResetLink } from "@/lib/passwordReset";
import { sendPasswordResetMail } from "@/lib/mail";

export type ResetRequestState = { sent: boolean; error?: string } | null;

// Always answers the same way, so the form cannot be used to find out which addresses are admins.
export async function requestPasswordReset(_: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { sent: false, error: "Geçerli bir e-posta adresi yazın." };

  try {
    const user = await db.user.findUnique({ where: { email: email.data } });
    if (user) {
      const url = await createResetLink(user.id);
      if (url) await sendPasswordResetMail({ to: user.email, name: user.name, url });
    }
  } catch (error) {
    console.error("[password reset] could not send the link:", error);
  }
  return { sent: true };
}
