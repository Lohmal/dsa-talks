"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { videoEmbed, type GalleryItem } from "@/lib/gallery";

export type GalleryLabels = { empty: string; close: string; previous: string; next: string; play: string };

// The photos and videos of a year as a grid; a click opens them large (arrow keys, Esc).
// Used by both site templates, so it sticks to the colours they share (brand, line, muted).
export default function GalleryGrid({ items, locale, labels }: { items: GalleryItem[]; locale: "tr" | "en"; labels: GalleryLabels }) {
  const shown = items.filter((item) => item.image || videoEmbed(item.video));
  const [open, setOpen] = useState<number | null>(null);
  const caption = (item: GalleryItem) => item.caption?.[locale] || item.caption?.[locale === "tr" ? "en" : "tr"] || "";

  if (!shown.length) {
    return <p className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-muted">{labels.empty}</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((item, index) => {
          const video = videoEmbed(item.video);
          const preview = item.image || video?.thumbnail;
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => setOpen(index)}
                className="group relative block aspect-4/3 w-full overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={caption(item) || (video ? labels.play : `${index + 1}`)}
              >
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded files and video previews
                  <img
                    src={preview}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {video && (
                  <span className="absolute inset-0 grid place-items-center bg-black/25">
                    <span className="grid size-14 place-items-center rounded-full bg-white/90 text-brand shadow-lg">
                      <Play className="ml-1 size-6 fill-current" />
                    </span>
                  </span>
                )}
                {caption(item) && (
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-left text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {caption(item)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {open !== null && (
        <Lightbox items={shown} index={open} setIndex={setOpen} caption={caption} labels={labels} />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  setIndex,
  caption,
  labels,
}: {
  items: GalleryItem[];
  index: number;
  setIndex: (index: number | null) => void;
  caption: (item: GalleryItem) => string;
  labels: GalleryLabels;
}) {
  const item = items[index];
  const video = videoEmbed(item.video);
  const go = useCallback((step: number) => setIndex((index + step + items.length) % items.length), [index, items.length, setIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, setIndex]);

  const button = "grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25";
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption(item) || `${index + 1} / ${items.length}`}
      className="fixed inset-0 z-100 flex flex-col bg-black/90 p-3 sm:p-6"
      onClick={(event) => event.target === event.currentTarget && setIndex(null)}
    >
      <div className="flex items-center justify-between text-sm font-semibold text-white/80">
        <span>
          {index + 1} / {items.length}
        </span>
        <button type="button" autoFocus onClick={() => setIndex(null)} aria-label={labels.close} className={button}>
          <X className="size-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2 py-3" onClick={(event) => event.target === event.currentTarget && setIndex(null)}>
        {items.length > 1 && (
          <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className={`${button} hidden shrink-0 sm:grid`}>
            <ChevronLeft className="size-6" />
          </button>
        )}
        {video ? (
          <iframe
            key={video.embed}
            src={video.embed}
            title={caption(item) || labels.play}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="aspect-video max-h-full w-full max-w-5xl rounded-xl bg-black"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- an uploaded photo at full size
          <img src={item.image} alt={caption(item)} className="max-h-full max-w-full rounded-xl object-contain" />
        )}
        {items.length > 1 && (
          <button type="button" onClick={() => go(1)} aria-label={labels.next} className={`${button} hidden shrink-0 sm:grid`}>
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        {items.length > 1 && (
          <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className={`${button} sm:hidden`}>
            <ChevronLeft className="size-6" />
          </button>
        )}
        <p className="min-w-0 flex-1 text-center text-white">{caption(item)}</p>
        {items.length > 1 && (
          <button type="button" onClick={() => go(1)} aria-label={labels.next} className={`${button} sm:hidden`}>
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
