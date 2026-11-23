import "server-only";
import { db } from "./db";
import { sendCertificate } from "./certificates";

// Certificate e-mails go through a queue kept in the database (Response.emailStatus):
// the survey only marks the response "pending"; one worker in this server process sends
// them one by one over a single SMTP connection, so a crowd submitting at once does not
// overload Gmail. Failures are retried with growing pauses, then marked "failed".
// shortcut: assumes one server process (the NSSM service); several instances would need
// a lease (claimed-at time) instead of the plain pending → sending claim below.

const RETRY_MINUTES = [1, 5, 15, 60]; // pauses before attempts 2..5; after that "failed"
const GAP_MS = 1_000; // between two mails
const POLL_MS = 15_000; // checks for due retries; new mails start at once (kick)

// Process-wide (instrumentation and the app can load this module as separate copies).
const state = globalThis as { mailQueueRunning?: boolean; mailWorker?: boolean };

export async function queueCertificateMail(responseId: string) {
  await db.response.update({
    where: { id: responseId },
    data: { emailStatus: "pending", emailAttempts: 0, emailNextAt: null, emailError: null },
  });
  kick();
}

// Puts every failed certificate mail back in the queue; returns how many.
export async function requeueFailedMails() {
  const { count } = await db.response.updateMany({
    where: { emailStatus: "failed" },
    data: { emailStatus: "pending", emailAttempts: 0, emailNextAt: null },
  });
  kick();
  return count;
}

// Minutes to wait after a failed attempt, or null to give up ("failed"). 5xx answers
// (bad address, daily quota, rejected login) will not fix themselves by waiting.
export function retryDelay(attempts: number, responseCode = 0) {
  return responseCode < 500 && attempts <= RETRY_MINUTES.length ? RETRY_MINUTES[attempts - 1] : null;
}

export function kick() {
  void drain().catch((error) => console.error("[mail queue] stopped:", error));
}

async function nextDue() {
  return db.response.findFirst({
    where: {
      emailStatus: "pending",
      OR: [{ emailNextAt: { isSet: false } }, { emailNextAt: null }, { emailNextAt: { lte: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
  });
}

async function drain() {
  if (state.mailQueueRunning) return;
  state.mailQueueRunning = true;
  try {
    for (let response = await nextDue(); response; response = await nextDue()) {
      const claim = await db.response.updateMany({
        where: { id: response.id, emailStatus: "pending" },
        data: { emailStatus: "sending" },
      });
      if (claim.count === 0) continue;

      const attempts = (response.emailAttempts ?? 0) + 1;
      try {
        await sendCertificate(response);
        await db.response.update({
          where: { id: response.id },
          data: { emailStatus: "sent", emailAttempts: attempts, emailError: null, emailSentAt: new Date() },
        });
      } catch (error) {
        const message = String((error as Error)?.message ?? error).slice(0, 500);
        const wait = retryDelay(attempts, (error as { responseCode?: number })?.responseCode);
        console.error(`[mail queue] ${response.email}, attempt ${attempts}${wait ? ", will retry" : ""}:`, message);
        await db.response.update({
          where: { id: response.id },
          data: wait
            ? {
                emailStatus: "pending",
                emailAttempts: attempts,
                emailError: message,
                emailNextAt: new Date(Date.now() + wait * 60_000),
              }
            : { emailStatus: "failed", emailAttempts: attempts, emailError: message },
        });
      }
      await new Promise((resolve) => setTimeout(resolve, GAP_MS));
    }
  } finally {
    state.mailQueueRunning = false;
  }
}

// Started once per server process (instrumentation.ts). Mails cut off by a restart while
// "sending" go back to the queue.
export async function startMailWorker() {
  if (state.mailWorker) return;
  state.mailWorker = true;
  await db.response.updateMany({ where: { emailStatus: "sending" }, data: { emailStatus: "pending" } });
  setInterval(kick, POLL_MS);
  kick();
}
