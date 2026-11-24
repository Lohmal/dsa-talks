import { readAsset } from "@/lib/assets";

// GET /media/<id>: a file uploaded in the admin panel. Ids never change (a new upload gets a
// new id), so browsers may keep the file for a year. The sandbox stops an uploaded file from
// ever running script on this site.
export async function GET(_: Request, { params }: RouteContext<"/media/[id]">) {
  const asset = await readAsset((await params).id);
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Length": String(asset.size),
      "Content-Disposition": `inline; filename="${encodeURIComponent(asset.name)}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
