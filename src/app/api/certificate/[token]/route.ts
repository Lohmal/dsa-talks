import { db } from "@/lib/db";
import { certificateDataOf } from "@/lib/certificates";
import { publicOrigin } from "@/lib/origin";
import { certificateFileName, renderCertificatePdf, renderCertificatePng } from "@/lib/certificate";

// GET /api/certificate/<token>?format=png|pdf&download=1
// The token is the unguessable secret given to the participant (and visible to admins).
export async function GET(request: Request, { params }: RouteContext<"/api/certificate/[token]">) {
  const { token } = await params;
  const response = token.length >= 20 ? await db.response.findUnique({ where: { certificateToken: token } }) : null;
  if (!response) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "png" ? "png" : "pdf";
  const data = certificateDataOf(response, await publicOrigin());
  const body = format === "png" ? await renderCertificatePng(data) : await renderCertificatePdf(data);
  const disposition = url.searchParams.has("download") ? "attachment" : "inline";

  return new Response(Buffer.from(body), {
    headers: {
      "Content-Type": format === "png" ? "image/png" : "application/pdf",
      "Content-Disposition": `${disposition}; filename="${certificateFileName(response.certificateNo, format)}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
