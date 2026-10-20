"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";

export type SelectOption = { value: string; label: string; hint?: string };

// A styled dropdown in place of the browser's native <select>: a button that opens a list.
// Works with the keyboard (arrows, Home/End, Enter/Space, Escape) and, with `name`, inside
// ordinary forms through a hidden input.
export default function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  label,
  disabled = false,
  loading = false,
  className = "",
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  label: string; // accessible name
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = value ?? own;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === current));
  const selected = options[selectedIndex];

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    setOwn(option.value);
    setOpen(false);
    if (option.value !== current) onChange?.(option.value);
  };

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(last, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => setOpen(false),
      Tab: () => setOpen(false),
    };
    const move = moves[event.key];
    if (!move) return;
    if (event.key !== "Tab") event.preventDefault();
    move();
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-busy={loading}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-ink ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-70 ${
          open ? "ring-2 ring-ink" : "ring-line hover:ring-ink/30"
        }`}
      >
        <span className="min-w-0 truncate">{selected?.label ?? ""}</span>
        {loading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-brand" />
        ) : (
          <ChevronDown className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-72 min-w-full overflow-auto rounded-xl bg-white p-1.5 shadow-xl shadow-ink/15 ring-1 ring-ink/10"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                id={`${id}-${index}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  index === active ? "bg-surface" : ""
                } ${isSelected ? "font-bold text-ink" : "text-ink/85"}`}
              >
                <Check className={`mt-0.5 size-4 shrink-0 text-brand ${isSelected ? "" : "invisible"}`} />
                <span className="min-w-0">
                  {option.label}
                  {option.hint && <span className="block text-xs font-normal text-muted">{option.hint}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
