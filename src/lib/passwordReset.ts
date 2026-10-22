import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { siteUrl } from "@/config/url";
import { db } from "./db";
import { clearFailures } from "./loginThrottle";

// One-time links for setting a new admin password. The link carries a random token; only its
// SHA-256 hash is stored, so a database copy cannot be used to reset anyone's password.

const LIFETIME_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_HOUR = 3; // per account, against mail flooding

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

// A new link for this admin (always on the configured address, never the request's Host header),
// or null when too many were requested in the last hour.
export async function createResetLink(userId: string) {
  const recent = await db.passwordToken.count({
    where: { userId, createdAt: { gt: new Date(Date.now() - LIFETIME_MS) } },
  });
  if (recent >= MAX_PER_HOUR) return null;

  const token = randomBytes(32).toString("base64url");
  await db.passwordToken.create({
    data: { userId, tokenHash: hash(token), expiresAt: new Date(Date.now() + LIFETIME_MS) },
  });
  return `${siteUrl}/admin/sifre-yenile?token=${token}`;
}

async function validToken(token: string) {
  if (!token || token.length < 20) return null;
  const record = await db.passwordToken.findUnique({ where: { tokenHash: hash(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  return record;
}

// For the "new password" page: whose link is this, if it can still be used?
export async function resetLinkOwner(token: string) {
  const record = await validToken(token);
  return record ? db.user.findUnique({ where: { id: record.userId }, select: { email: true, name: true } }) : null;
}

// Sets the password and retires every open link of that admin. False if the link is not valid.
export async function resetPassword(token: string, password: string) {
  const record = await validToken(token);
  if (!record) return false;
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.passwordToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);
  clearFailures(user.email); // a locked login (too many attempts) opens again
  return true;
}
