import { adminOrNull } from "@/lib/admin";
import { buildResponsesWorkbook } from "@/lib/export";

// GET /admin/export?scope=all|event|<session id> → .xlsx with every response and a summary sheet.
export async function GET(request: Request) {
  if (!(await adminOrNull())) return new Response("Unauthorized", { status: 401 });

  const scope = new URL(request.url).searchParams.get("scope") ?? "all";
  const buffer = await buildResponsesWorkbook(scope);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="DSATalks-anket-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
