import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    stamp?: string;
  }
  interface Session {
    user: { id: string } & DefaultSession["user"];
    stamp?: string;
    signedInAt?: number;
  }
}
