import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db } from "./lib/db";
import { ensureDefaults } from "./lib/bootstrap";

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
        // A fresh database gets its first admin (admin@admin.com) here at the latest.
        await ensureDefaults();
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
          throw new CredentialsSignin();
        }
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
