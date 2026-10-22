"use client";

import { useSyncExternalStore } from "react";

// The visitor's cookie choice for third-party content (Google Maps), remembered in this
// browser. "unset" until they answer the banner; "pending" during server render.

export type Consent = "accepted" | "rejected" | "unset";

const KEY = "dsa-talks-cookies";
const listeners = new Set<() => void>();

function read(): Consent {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "accepted" || value === "rejected" ? value : "unset";
  } catch {
    return "unset"; // storage blocked: ask again next time
  }
}

export function setConsent(value: Consent) {
  try {
    if (value === "unset") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    // The choice just won't be remembered.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useConsent(): Consent | "pending" {
  return useSyncExternalStore(subscribe, read, () => "pending" as const);
}
