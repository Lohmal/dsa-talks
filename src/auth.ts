import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db } from "./lib/db";
import { ensureDefaults } from "./lib/bootstrap";
import { passwordStamp } from "./lib/sessionStamp";
import { clearFailures, isLocked, recordFailure } from "./lib/loginThrottle";
import { checkLoginCode } from "./lib/loginCode";

// The hash of a random password nobody knows (see checkPassword).
const DUMMY_HASH = "$2b$10$EQwz5vYC7UJIxd8WxzSN4Ov3ivDX/lactP/6EupCkaagirHT.4t4u";

// Shown on the login page (src/app/admin/login/actions.ts).
export class WrongCode extends CredentialsSignin {
  code = "wrong";
}
export class ExpiredCode extends CredentialsSignin {
  code = "expired";
}

const credentials = z.object({
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1),
});

const codeInput = z.object({
  ticket: z.string(),
  code: z
    .string()
    .transform((code) => code.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\d{6}$/)),
});

// First step of signing in: the admin for the right e-mail and password, null otherwise, or
// "locked" after too many wrong passwords. The session itself needs the e-mailed code (authorize).
export async function checkPassword(email: unknown, password: unknown) {
  const parsed = credentials.safeParse({ email, password });
  if (!parsed.success) return null;
  const input = parsed.data;
  if (isLocked(input.email)) return "locked";
  // A fresh database gets its first admin (admin@admin.com) here at the latest.
  await ensureDefaults();
  const user = await db.user.findUnique({ where: { email: input.email } });
  // Unknown addresses are checked against a dummy hash too, so the response time does
  // not reveal which addresses belong to an admin.
  const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    recordFailure(input.email);
    return null;
  }
  clearFailures(input.email);
  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { ticket: {}, code: {} },
      async authorize(raw) {
        const parsed = codeInput.safeParse(raw);
        if (!parsed.success) throw new WrongCode();
        const result = await checkLoginCode(parsed.data.ticket, parsed.data.code);
        if (result === "wrong") throw new WrongCode();
        const user = result === "expired" ? null : await db.user.findUnique({ where: { id: result.userId } });
        if (!user) throw new ExpiredCode();
        return { id: user.id, name: user.name, email: user.email, stamp: passwordStamp(user.passwordHash) };
      },
    }),
  ],
});
