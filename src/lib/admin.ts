import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "./db";

// Every admin page, server action and download calls this. Besides the session cookie it
// checks the account still exists, so a removed admin loses access immediately.
export async function requireAdmin() {
  const session = await auth();
  const id = session?.user?.id;
  const user = id ? await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } }) : null;
  if (!user) redirect("/admin/login");
  return user;
}

// For route handlers, where a redirect is not the right answer.
export async function adminOrNull() {
  const session = await auth();
  const id = session?.user?.id;
  return id ? db.user.findUnique({ where: { id }, select: { id: true } }) : null;
}
