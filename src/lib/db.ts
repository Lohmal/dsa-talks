import "server-only";
import { PrismaClient } from "@prisma/client";

// One client per server process; dev reloads reuse the same one instead of opening new pools.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Not used yet (one-time tokens and login codes). On MongoDB an optional field left out at
// create time is missing from the document, and `usedAt: null` alone does not match that.
export const unused = { OR: [{ usedAt: null }, { usedAt: { isSet: false } }] };
