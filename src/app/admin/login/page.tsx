import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AuthShell from "@/components/admin/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Yönetim Girişi | DSATalks",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const session = await auth();
  if (session?.user?.id && (await db.user.findUnique({ where: { id: session.user.id }, select: { id: true } }))) {
    redirect("/admin");
  }
  const { next, reset } = await searchParams;

  return (
    <AuthShell>
      <LoginForm next={typeof next === "string" ? next : ""} passwordChanged={reset === "1"} />
    </AuthShell>
  );
}
