"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { inputClass } from "./ui";

// A form field holding a file address (e.g. "/media/<id>"), with an upload button that stores
// the chosen file (POST /admin/upload) and fills in its address. `as="png"` keeps images as
// PNG (certificate logos).
export default function FileField({ name, defaultValue, as }: { name: string; defaultValue: string; as?: "png" }) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch(`/admin/upload${as ? `?as=${as}` : ""}`, { method: "POST", body }).catch(() => null);
    if (response?.ok) setValue(((await response.json()) as { url: string }).url);
    else setError((response && (await response.text())) || "Yüklenemedi.");
    setBusy(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input name={name} value={value} onChange={(event) => setValue(event.target.value)} className={`${inputClass} w-full`} />
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          aria-label="Görsel yükle"
          className="grid size-11 shrink-0 place-items-center rounded-xl text-muted ring-1 ring-line hover:text-brand disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Kaldır"
            className="grid size-11 shrink-0 place-items-center rounded-xl text-muted ring-1 ring-line hover:text-brand"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-brand">{error}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded file
        <img src={value} alt="" className="mt-2 h-16 w-auto rounded-lg object-contain ring-1 ring-line" />
      )}
    </div>
  );
}
