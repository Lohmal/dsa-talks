import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db } from "./lib/db";
import { ensureDefaults } from "./lib/bootstrap";
import { passwordStamp } from "./lib/sessionStamp";
import { clearFailures, isLocked, recordFailure } from "./lib/loginThrottle";

// The hash of a random password nobody knows (see authorize).
const DUMMY_HASH = "$2b$10$EQwz5vYC7UJIxd8WxzSN4Ov3ivDX/lactP/6EupCkaagirHT.4t4u";

// Shown on the login page as "too many attempts" (src/app/admin/login/actions.ts).
export class TooManyAttempts extends CredentialsSignin {
  code = "locked";
}

const credentials = z.object({
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentials.safeParse(raw);
        if (!parsed.success) throw new CredentialsSignin();
        const { email, password } = parsed.data;
        if (isLocked(email)) throw new TooManyAttempts();
        // A fresh database gets its first admin (admin@admin.com) here at the latest.
        await ensureDefaults();
        const user = await db.user.findUnique({ where: { email } });
        // Unknown addresses are checked against a dummy hash too, so the response time does
        // not reveal which addresses belong to an admin.
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) {
          recordFailure(email);
          throw new CredentialsSignin();
        }
        clearFailures(email);
        return { id: user.id, name: user.name, email: user.email, stamp: passwordStamp(user.passwordHash) };
      },
    }),
  ],
});
