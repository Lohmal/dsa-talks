"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, ImageDown } from "lucide-react";
import { Card, buttonClass, inputClass } from "./ui";

const NAVY = "#13224b";
const RED = "#d7182a";

function download(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

// A print-ready poster: wordmark, title, the QR code and the address underneath.
async function posterPng(url: string) {
  const width = 1200;
  const height = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, width, 24);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, height - 24, width, 24);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 96px ${font}`;
  const dsa = ctx.measureText("DSA").width;
  const talks = ctx.measureText("Talks").width;
  const left = (width - dsa - talks) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = RED;
  ctx.fillText("DSA", left, 190);
  ctx.fillStyle = NAVY;
  ctx.fillText("Talks", left + dsa, 190);

  ctx.textAlign = "center";
  ctx.fillStyle = NAVY;
  ctx.font = `800 52px ${font}`;
  ctx.fillText("ETKİNLİK MEMNUNİYET ANKETİ", width / 2, 290);
  ctx.fillStyle = "#5b6478";
  ctx.font = `500 34px ${font}`;
  ctx.fillText("Event Satisfaction Survey", width / 2, 345);

  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, url, { width: 820, margin: 1, errorCorrectionLevel: "M", color: { dark: NAVY, light: "#ffffff" } });
  ctx.drawImage(qr, (width - 820) / 2, 400);

  ctx.fillStyle = NAVY;
  ctx.font = `600 34px ${font}`;
  ctx.fillText("Sertifikanız için QR kodu okutun · Scan for your certificate", width / 2, 1300);
  ctx.fillStyle = "#5b6478";
  ctx.font = `500 30px ${font}`;
  ctx.fillText(url.replace(/^https?:\/\//, ""), width / 2, 1360);

  return canvas.toDataURL("image/png");
}

export default function QrCard({ url }: { url: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: NAVY, light: "#ffffff" } }).then(
      (data) => {
        if (!cancelled) setPreview(data);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <Card>
        <div className="aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-line">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL generated in the browser
            <img src={preview} alt="Anket sayfasının QR kodu" className="size-full" />
          )}
        </div>
      </Card>

      <Card title="Paylaş ve indir">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Anket adresi</span>
          <div className="mt-1.5 flex gap-2">
            <input readOnly value={url} className={`${inputClass} font-mono`} onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={buttonClass("outline")}
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>
          </div>
        </label>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!preview}
            onClick={() => preview && download(preview, "DSATalks-anket-qr.png")}
            className={buttonClass("primary")}
          >
            <Download className="size-4" /> Sadece QR (PNG)
          </button>
          <button
            type="button"
            onClick={async () => download(await posterPng(url), "DSATalks-anket-afis.png")}
            className={buttonClass("navy")}
          >
            <ImageDown className="size-4" /> Başlıklı afiş (PNG)
          </button>
        </div>
        <p className="mt-4 text-sm text-muted">
          QR kod yukarıdaki adrese gider. Site kendi alan adına taşındığında <code className="font-mono">NEXT_PUBLIC_SITE_URL</code>{" "}
          ayarlanırsa QR kod o adresi kullanır.
        </p>
      </Card>
    </div>
  );
}
