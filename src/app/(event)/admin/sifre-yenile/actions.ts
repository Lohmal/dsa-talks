"use server";

import { redirect } from "next/navigation";
import { resetPassword } from "@/lib/passwordReset";

export async function setNewPassword(_: string | null, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (password !== confirm) return "Şifreler birbiriyle aynı değil.";
  if (!(await resetPassword(token, password))) {
    return "Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir bağlantı isteyin.";
  }
  redirect("/admin/login?reset=1");
}
