import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SESSION_SECONDS } from "@/auth.config";
import { db } from "./db";
import { passwordStamp } from "./sessionStamp";

// The signed-in admin, checked against the database so a removed admin, or a session opened
// before the password was changed, loses access immediately. A session also ends 12 hours
// after signing in, however active it is. cache(): layout and page share one lookup per request.
const currentAdmin = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !session.stamp || !session.signedInAt) return null;
  if (Date.now() - session.signedInAt > SESSION_SECONDS * 1000) return null;
  const user = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, passwordHash: true } });
  if (!user || passwordStamp(user.passwordHash) !== session.stamp) return null;
  return { id: user.id, name: user.name, email: user.email };
});

// Every admin page, server action and download calls this.
export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

// For route handlers, where a redirect is not the right answer.
export const adminOrNull = currentAdmin;
