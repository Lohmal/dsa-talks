import type { NextAuthConfig } from "next-auth";

export const SESSION_SECONDS = 60 * 60 * 12; // 12 hours

// The part of the Auth.js setup that needs no database, shared by proxy.ts and auth.ts.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: SESSION_SECONDS },
  trustHost: true,
  providers: [],
  callbacks: {
    // At sign-in: who, with which password (stamp) and when; checked by src/lib/admin.ts.
    jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
        token.stamp = user.stamp;
        token.signedInAt = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      session.stamp = token.stamp as string | undefined;
      session.signedInAt = token.signedInAt as number | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
