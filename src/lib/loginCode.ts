import "server-only";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { db, unused } from "./db";

// Second step of signing in: after the right password, a 6-digit code is e-mailed to the admin.
// The browser gets a random ticket that ties the code to this sign-in, so the code alone is not
// enough. Only hashes of both are stored.

export const CODE_MINUTES = 10;
const LIFETIME_MS = CODE_MINUTES * 60 * 1000;
const MAX_ATTEMPTS = 5; // wrong codes per sent code
const MAX_SENDS = 3; // the first code and two resends per ticket
const MAX_TICKETS = 5; // per admin in 15 minutes, against mail flooding
const WINDOW_MS = 15 * 60 * 1000;

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const hashCode = (ticket: string, code: string) => sha(`${ticket}:${code}`);
const newCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

// A new ticket and code for this admin, or null when too many were requested lately.
export async function startLoginCode(userId: string) {
  const recent = await db.loginCode.count({
    where: { userId, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
  });
  if (recent >= MAX_TICKETS) return null;

  const ticket = randomBytes(32).toString("base64url");
  const code = newCode();
  await db.loginCode.create({
    data: {
      userId,
      ticketHash: sha(ticket),
      codeHash: hashCode(ticket, code),
      expiresAt: new Date(Date.now() + LIFETIME_MS),
    },
  });
  return { ticket, code };
}

const findTicket = (ticket: string) =>
  ticket.length < 20 ? null : db.loginCode.findUnique({ where: { ticketHash: sha(ticket) } });

// "Kodu tekrar gönder": a fresh code (and fresh attempts) for the same sign-in. Null when the
// ticket is unknown, already used or has had all its codes.
export async function resendLoginCode(ticket: string) {
  const record = await findTicket(ticket);
  if (!record || record.usedAt) return null;
  const code = newCode();
  const updated = await db.loginCode.updateMany({
    where: { id: record.id, ...unused, sends: { lt: MAX_SENDS } },
    data: {
      codeHash: hashCode(ticket, code),
      attempts: 0,
      sends: { increment: 1 },
      expiresAt: new Date(Date.now() + LIFETIME_MS),
    },
  });
  return updated.count ? { userId: record.userId, code } : null;
}

// The admin's id for the right code. Every try uses up one attempt; the right code uses up the
// ticket. "expired" also covers used tickets and codes with no attempts left.
export async function checkLoginCode(ticket: string, code: string) {
  const record = await findTicket(ticket);
  if (!record || record.usedAt || record.expiresAt < new Date()) return "expired";

  const counted = await db.loginCode.updateMany({
    where: { id: record.id, ...unused, attempts: { lt: MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (!counted.count) return "expired";

  const right = timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(hashCode(ticket, code)));
  if (!right) return record.attempts + 1 >= MAX_ATTEMPTS ? "expired" : "wrong";

  const used = await db.loginCode.updateMany({ where: { id: record.id, ...unused }, data: { usedAt: new Date() } });
  return used.count ? { userId: record.userId } : "expired";
}
