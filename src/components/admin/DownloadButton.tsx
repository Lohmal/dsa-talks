"use client";

import { useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { buttonClass, type buttonTones } from "./ui";

// Downloads a generated file (Excel, certificate PDF) with a spinner while the server builds it.
export default function DownloadButton({
  href,
  fileName,
  children,
  tone = "primary",
  icon = "download",
}: {
  href: string;
  fileName: string;
  children: React.ReactNode;
  tone?: keyof typeof buttonTones;
  icon?: "download" | "excel";
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const Icon = icon === "excel" ? FileSpreadsheet : Download;

  const start = async () => {
    setState("loading");
    try {
      const response = await fetch(href, { credentials: "same-origin" });
      if (!response.ok) throw new Error(String(response.status));
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <button
      type="button"
      onClick={start}
      disabled={state === "loading"}
      aria-busy={state === "loading"}
      title={state === "error" ? "İndirilemedi, tekrar deneyin." : undefined}
      className={buttonClass(state === "error" ? "danger" : tone)}
    >
      {state === "loading" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : state === "error" ? (
        <AlertCircle className="size-4" />
      ) : (
        <Icon className="size-4" />
      )}
      {state === "loading" ? "Hazırlanıyor…" : state === "error" ? "Tekrar dene" : children}
    </button>
  );
}
