import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "./db";

// The signed-in admin, checked against the database so a removed admin loses access
// immediately. cache(): the panel layout and the page share one lookup per request.
const currentAdmin = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  return id ? db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } }) : null;
});

// Every admin page, server action and download calls this.
export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

// For route handlers, where a redirect is not the right answer.
export const adminOrNull = currentAdmin;
