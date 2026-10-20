"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(_: string | null, formData: FormData) {
  const next = String(formData.get("next") ?? "");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      // Only paths inside the panel, never another site.
      redirectTo: next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin",
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) return "E-posta veya şifre hatalı.";
    throw error; // the redirect after a successful sign-in
  }
}
