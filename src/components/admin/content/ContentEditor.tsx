"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { isPair } from "@/lib/bilingual";
import { ActionForm, SubmitButton, type FormAction } from "@/components/admin/forms";
import { inputClass } from "@/components/admin/ui";
import { fileKeys, labelOf } from "./labels";

// One editor for everything a year shows: it walks the year's content tree and draws a field
// for each value. { tr, en } pairs get a Turkish and an English box side by side, lists can be
// added to, reordered and emptied, switches are checkboxes, file addresses get an upload button.

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Path = (string | number)[];

const isObject = (value: unknown): value is Record<string, Json> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function getAt(root: Json | undefined, path: Path): Json | undefined {
  return path.reduce<Json | undefined>((node, key) => (node as Record<string | number, Json> | undefined)?.[key], root);
}

function setAt(root: Json | undefined, path: Path, value: Json): Json {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = root.slice();
    copy[key as number] = setAt(root[key as number], rest, value);
    return copy;
  }
  const object = isObject(root) ? root : {};
  return { ...object, [key]: setAt(object[key as string], rest, value) };
}

// An empty copy of a list item, for "add": texts empty, lists empty, switches off. The photo
// frame of a portrait speaker is left out (it only fits that one photo).
function blank(value: Json | undefined): Json | undefined {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (isPair(value)) return { tr: Array.isArray(value.tr) ? [] : "", en: Array.isArray(value.en) ? [] : "" };
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "frame")
        .map(([key, item]) => [key, blank(item)])
        .filter(([, item]) => item !== undefined),
    );
  }
  return undefined;
}

// A short title for a collapsed list item: its name, title or time.
function summaryOf(item: Json): string {
  if (!isObject(item)) return typeof item === "string" ? item : "";
  const text = (value: Json | undefined) =>
    typeof value === "string" ? value : isPair(value) && typeof value.tr === "string" ? value.tr || String(value.en) : "";
  const person = [text(item.given), text(item.surname)].filter(Boolean).join(" ");
  return person || text(item.name) || text(item.title) || text(item.label) || text(item.date) || text(item.time) || "";
}

type Ctx = {
  defaults: Json;
  update: (path: Path, value: Json) => void;
  pageLabels: Record<string, string>;
};

export default function ContentEditor({
  initial,
  defaults,
  pageLabels,
  saveAction,
}: {
  initial: Json;
  defaults: Json;
  pageLabels: Record<string, string>;
  saveAction: FormAction;
}) {
  const [content, setContent] = useState<Json>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const serialized = JSON.stringify(content);
  const dirty = serialized !== saved;
  const tabs = isObject(content) ? Object.keys(content) : [];
  const [tab, setTab] = useState(tabs[0] ?? "");
  const ctx: Ctx = useMemo(
    () => ({ defaults, pageLabels, update: (path, value) => setContent((root) => setAt(root, path, value)) }),
    [defaults, pageLabels],
  );

  // Leaving the page with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save: FormAction = async (state, formData) => {
    const result = await saveAction(state, formData);
    if (result?.ok) setSaved(String(formData.get("content")));
    return result;
  };

  return (
    <div className="space-y-5">
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === key ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink/30"
            }`}
          >
            {labelOf(key)}
          </button>
        ))}
      </div>

      {tab && isObject(content) && (
        <Section ctx={ctx} path={[tab]} value={content[tab]} />
      )}

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl shadow-ink/10 ring-1 ring-line">
        <p className={`text-sm font-semibold ${dirty ? "text-amber-700" : "text-muted"}`}>
          {dirty ? "Kaydedilmemiş değişiklikler var." : "Bütün değişiklikler kayıtlı."}
        </p>
        <ActionForm action={save} className="flex flex-col items-end">
          <input type="hidden" name="content" value={serialized} />
          <SubmitButton>Kaydet</SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}

// A tab: its groups (objects) as collapsible boxes; a list (speakers) as a list.
function Section({ ctx, path, value }: { ctx: Ctx; path: Path; value: Json }) {
  if (path[0] === "pages" && isObject(value)) {
    return (
      <Box>
        <p className="mb-4 text-sm text-muted">Kapalı sayfalar menüde görünmez ve açılmaz.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(value).map(([key, on]) => (
            <label key={key} className="flex items-center gap-3 rounded-xl px-3 py-2 ring-1 ring-line">
              <input
                type="checkbox"
                checked={on === true}
                onChange={(event) => ctx.update([...path, key], event.target.checked)}
                className="size-4 accent-brand"
              />
              <span className="text-sm font-semibold text-ink">{ctx.pageLabels[key] ?? key}</span>
            </label>
          ))}
        </div>
      </Box>
    );
  }
  if (isObject(value) && !isPair(value)) {
    return (
      <div className="space-y-3">
        {Object.entries(value).map(([key, item]) =>
          isObject(item) && !isPair(item) ? (
            <details key={key} className="group rounded-2xl bg-white shadow-card ring-1 ring-ink/5">
              <summary className="cursor-pointer select-none px-5 py-4 font-extrabold text-ink">{labelOf(key)}</summary>
              <div className="space-y-4 border-t border-line px-5 py-5">
                <Fields ctx={ctx} path={[...path, key]} value={item} />
              </div>
            </details>
          ) : (
            <Box key={key}>
              <Node ctx={ctx} path={[...path, key]} value={item} />
            </Box>
          ),
        )}
      </div>
    );
  }
  return (
    <Box>
      <Node ctx={ctx} path={path} value={value} />
    </Box>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink/5">{children}</div>;
}

// The fields of an object; inside a list, missing fields of the other items are offered too.
function Fields({ ctx, path, value, template }: { ctx: Ctx; path: Path; value: Record<string, Json>; template?: Json }) {
  const shape = { ...(isObject(blank(template)) ? (blank(template) as Record<string, Json>) : {}), ...value };
  return (
    <div className="space-y-4">
      {Object.entries(shape).map(([key, item]) => (
        <Node key={key} ctx={ctx} path={[...path, key]} value={item} template={isObject(template) ? template[key] : undefined} />
      ))}
    </div>
  );
}

function Node({ ctx, path, value, template }: { ctx: Ctx; path: Path; value: Json; template?: Json }) {
  const key = path[path.length - 1];
  const label = labelOf(key);
  const file = typeof key === "string" && fileKeys.has(key);

  if (isPair(value)) {
    return Array.isArray(value.tr) || Array.isArray(value.en) ? (
      <Group label={label}>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["tr", "en"] as const).map((lang) => (
            <TextList key={lang} ctx={ctx} path={[...path, lang]} items={(value[lang] as string[]) ?? []} lang={lang} />
          ))}
        </div>
      </Group>
    ) : (
      <Group label={label}>
        <div className="grid gap-3 lg:grid-cols-2">
          {(["tr", "en"] as const).map((lang) => (
            <Text
              key={lang}
              ctx={ctx}
              path={[...path, lang]}
              value={String(value[lang] ?? "")}
              lang={lang}
              file={file}
              // Both languages the same kind of box, so the two sides line up.
              multiline={[value.tr, value.en].some((text) => String(text).length > 70 || String(text).includes("\n"))}
            />
          ))}
        </div>
      </Group>
    );
  }
  if (typeof value === "string") {
    return (
      <Group label={label}>
        <Text ctx={ctx} path={path} value={value} file={file} />
      </Group>
    );
  }
  if (typeof value === "number") {
    return (
      <Group label={label}>
        <input
          type="number"
          value={value}
          onChange={(event) => ctx.update(path, Number(event.target.value))}
          className={`${inputClass} max-w-40`}
        />
      </Group>
    );
  }
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input type="checkbox" checked={value} onChange={(event) => ctx.update(path, event.target.checked)} className="size-4 accent-brand" />
        {label}
      </label>
    );
  }
  if (Array.isArray(value)) {
    // New items copy the shape of the first one, or of the first item in the code defaults.
    const fromDefaults = getAt(ctx.defaults, path.map((part) => (typeof part === "number" ? 0 : part)));
    const itemTemplate = value[0] ?? (Array.isArray(fromDefaults) ? fromDefaults[0] : undefined);
    return <List ctx={ctx} path={path} items={value} template={itemTemplate ?? template} label={label} />;
  }
  if (isObject(value)) {
    return (
      <fieldset className="space-y-4 rounded-2xl p-4 ring-1 ring-line">
        <legend className="px-1 text-xs font-extrabold uppercase tracking-wider text-muted">{label}</legend>
        <Fields ctx={ctx} path={path} value={value} template={template} />
      </fieldset>
    );
  }
  return null;
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-bold text-ink">{label}</p>
      {children}
    </div>
  );
}

function Text({
  ctx,
  path,
  value,
  lang,
  file,
  multiline,
}: {
  ctx: Ctx;
  path: Path;
  value: string;
  lang?: "tr" | "en";
  file?: boolean;
  multiline?: boolean;
}) {
  // Decided once: switching between a line and a box while typing would lose the cursor.
  const [long] = useState(() => multiline ?? (value.length > 70 || value.includes("\n")));
  const props = {
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => ctx.update(path, event.target.value),
    className: `${inputClass} w-full`,
    "aria-label": lang ? `${labelOf(path[path.length - 2])} (${lang.toUpperCase()})` : String(labelOf(path[path.length - 1])),
  };
  return (
    <div>
      {lang && <span className="mb-1 block text-[0.65rem] font-extrabold uppercase tracking-wider text-muted">{lang === "tr" ? "Türkçe" : "English"}</span>}
      <div className="flex gap-2">
        {long ? <textarea rows={Math.min(8, Math.ceil(value.length / 80) + 1)} {...props} /> : <input {...props} />}
        {file && <UploadButton onUploaded={(url) => ctx.update(path, url)} />}
      </div>
      {file && value && /\.(png|jpe?g|webp)$|^\/media\//i.test(value) && (
        // eslint-disable-next-line @next/next/no-img-element -- a preview of any address, not a page image
        <img src={value} alt="" className="mt-2 h-20 w-auto rounded-lg object-contain ring-1 ring-line" />
      )}
    </div>
  );
}

// Paragraphs of one language: each in its own box, added and removed one by one.
function TextList({ ctx, path, items, lang }: { ctx: Ctx; path: Path; items: string[]; lang: "tr" | "en" }) {
  return (
    <div className="space-y-2">
      <span className="block text-[0.65rem] font-extrabold uppercase tracking-wider text-muted">{lang === "tr" ? "Türkçe" : "English"}</span>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <textarea
            value={item}
            rows={Math.min(8, Math.ceil(item.length / 80) + 1)}
            onChange={(event) => ctx.update([...path, index], event.target.value)}
            className={`${inputClass} w-full`}
            aria-label={`${index + 1}. (${lang.toUpperCase()})`}
          />
          <IconButton label="Sil" onClick={() => ctx.update(path, items.filter((_, i) => i !== index))}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      ))}
      <button
        type="button"
        onClick={() => ctx.update(path, [...items, ""])}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
      >
        <Plus className="size-4" /> Ekle
      </button>
    </div>
  );
}

function List({ ctx, path, items, template, label }: { ctx: Ctx; path: Path; items: Json[]; template?: Json; label: string }) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const copy = items.slice();
    [copy[from], copy[to]] = [copy[to], copy[from]];
    ctx.update(path, copy);
  };
  const empty = blank(template ?? "");
  return (
    <Group label={`${label} (${items.length})`}>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>
            {isObject(item) && !isPair(item) ? (
              <details className="rounded-xl ring-1 ring-line">
                <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 truncate text-sm font-bold text-ink">
                    {index + 1}. {summaryOf(item) || "(boş)"}
                  </span>
                  <ItemControls index={index} count={items.length} move={move} remove={() => ctx.update(path, items.filter((_, i) => i !== index))} />
                </summary>
                <div className="border-t border-line p-4">
                  <Fields ctx={ctx} path={[...path, index]} value={item} template={template} />
                </div>
              </details>
            ) : (
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Node ctx={ctx} path={[...path, index]} value={item} template={template} />
                </div>
                <ItemControls index={index} count={items.length} move={move} remove={() => ctx.update(path, items.filter((_, i) => i !== index))} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {empty !== undefined && (
        <button
          type="button"
          onClick={() => ctx.update(path, [...items, empty])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink ring-1 ring-line hover:ring-ink/30"
        >
          <Plus className="size-4" /> Yeni ekle
        </button>
      )}
    </Group>
  );
}

function ItemControls({ index, count, move, remove }: { index: number; count: number; move: (from: number, to: number) => void; remove: () => void }) {
  const stop = (fn: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    fn();
  };
  return (
    <span className="flex shrink-0 gap-1">
      <IconButton label="Yukarı taşı" disabled={index === 0} onClick={stop(() => move(index, index - 1))}>
        <ArrowUp className="size-4" />
      </IconButton>
      <IconButton label="Aşağı taşı" disabled={index === count - 1} onClick={stop(() => move(index, index + 1))}>
        <ArrowDown className="size-4" />
      </IconButton>
      <IconButton label="Sil" onClick={stop(() => confirm("Bu öğe silinsin mi? (Kaydet’e basana kadar geri alınabilir.)") && remove())}>
        <Trash2 className="size-4" />
      </IconButton>
    </span>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: (event: React.MouseEvent) => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 shrink-0 place-items-center rounded-lg text-muted ring-1 ring-line transition-colors hover:text-brand disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// Sends a file to /admin/upload and puts the address of the stored file into the field.
function UploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setBusy(true);
          setError("");
          const body = new FormData();
          body.set("file", file);
          const response = await fetch("/admin/upload", { method: "POST", body }).catch(() => null);
          const result = response?.ok ? ((await response.json()) as { url: string }) : null;
          setBusy(false);
          if (result) onUploaded(result.url);
          else setError((response && (await response.text())) || "Yüklenemedi.");
        }}
      />
      <IconButton label="Dosya yükle" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
      </IconButton>
      {error && <span className="self-center text-xs font-semibold text-brand">{error}</span>}
    </>
  );
}
