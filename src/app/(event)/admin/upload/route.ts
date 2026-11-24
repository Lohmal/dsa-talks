import sharp from "sharp";
import { adminOrNull } from "@/lib/admin";
import { db } from "@/lib/db";

// POST /admin/upload (multipart, field "file"): stores a photo, logo or PDF and answers with
// its address ({ url: "/media/<id>" }). Photos are turned upright, shrunk to at most 1600 px
// and saved as WebP; ?as=png keeps a PNG (certificate logos: the certificate renderer reads
// PNG and JPEG only). SVG is not accepted, since it can carry script.

// Under the 10 MB that Next buffers for requests passing proxy.ts (with room for the form).
const MAX_BYTES = 8 * 1024 * 1024;
const IMAGES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: Request) {
  if (!(await adminOrNull())) return new Response("Oturum gerekli.", { status: 401 });
  // Only from this site's own pages.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return new Response("Geçersiz istek.", { status: 403 });

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return new Response("Dosya seçilmedi.", { status: 400 });
  if (file.size > MAX_BYTES) return new Response("Dosya 8 MB’tan büyük olamaz.", { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  let data: Buffer;
  let contentType: string;
  let name = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "dosya";
  if (IMAGES.includes(file.type)) {
    const png = new URL(request.url).searchParams.get("as") === "png";
    try {
      const image = sharp(bytes).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
      data = png ? await image.png().toBuffer() : await image.webp({ quality: 86 }).toBuffer();
    } catch {
      return new Response("Görsel okunamadı.", { status: 400 });
    }
    contentType = png ? "image/png" : "image/webp";
    name = name.replace(/\.\w+$/, "") + (png ? ".png" : ".webp");
  } else if (file.type === "application/pdf" && bytes.subarray(0, 5).toString() === "%PDF-") {
    data = bytes;
    contentType = "application/pdf";
  } else {
    return new Response("Yalnızca PNG, JPEG, WebP veya PDF yüklenebilir.", { status: 415 });
  }

  const asset = await db.asset.create({ data: { name, contentType, size: data.length, data: new Uint8Array(data) } });
  return Response.json({ url: `/media/${asset.id}` });
}
