import "server-only";

// Against password guessing: after 5 failed sign-ins for an e-mail address within 15 minutes,
// that address cannot sign in for 15 minutes. Kept in memory (one server process), so a
// restart clears it.

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; resetAt: number }>();

function entry(email: string) {
  const found = failures.get(email);
  if (found && found.resetAt <= Date.now()) {
    failures.delete(email);
    return undefined;
  }
  return found;
}

export const isLocked = (email: string) => (entry(email)?.count ?? 0) >= MAX_FAILURES;

export function recordFailure(email: string) {
  // Expired entries are dropped now and then, so random addresses cannot fill the memory.
  if (failures.size > 1000) for (const key of failures.keys()) entry(key);
  const found = entry(email);
  if (!found) {
    failures.set(email, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  found.count += 1;
  // The lock lasts 15 minutes from the failure that triggered it.
  if (found.count >= MAX_FAILURES) found.resetAt = Date.now() + WINDOW_MS;
}

export const clearFailures = (email: string) => failures.delete(email);
