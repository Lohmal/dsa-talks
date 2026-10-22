import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminOrNull } from "@/lib/admin";
import AuthShell from "@/components/admin/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Yönetim Girişi | DSATalks",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await adminOrNull()) redirect("/admin");
  const { next, reset } = await searchParams;

  return (
    <AuthShell>
      <LoginForm next={typeof next === "string" ? next : ""} passwordChanged={reset === "1"} />
    </AuthShell>
  );
}
