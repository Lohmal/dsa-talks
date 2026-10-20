// Runs once when a server instance starts: creates the first admin, the settings and the
// default survey questions if the database is empty.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  try {
    const { ensureDefaults } = await import("./lib/bootstrap");
    await ensureDefaults();
  } catch (error) {
    console.error("[bootstrap] could not prepare the database:", error);
  }
}
