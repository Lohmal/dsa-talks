import "server-only";
import { createHash } from "node:crypto";

// Changes whenever the password does: a session opened with an older password stops working.
export const passwordStamp = (passwordHash: string) =>
  createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
