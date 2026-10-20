import type { NextAuthConfig } from "next-auth";

// The part of the Auth.js setup that needs no database, shared by proxy.ts and auth.ts.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12 hours
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
