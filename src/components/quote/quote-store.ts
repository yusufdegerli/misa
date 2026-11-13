"use client";

import { useSyncExternalStore } from "react";
import type { CategorySlug, Plating } from "@/lib/catalog";

export interface QuoteItem {
  code: string;
  slug: string;
  name: string;
  category: CategorySlug;
  plating: Plating;
  qty: number;
  minOrder: number;
}

interface QuoteState {
  items: QuoteItem[];
  open: boolean;
}

/**
 * The quote list lives only in this visitor's browser. It is a convenience for building a
 * message, not stored data, so losing it (private window, cleared storage) is harmless.
 */
const STORAGE_KEY = "misa-quote-v1";
const SERVER_STATE: QuoteState = { items: [], open: false };

let state: QuoteState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(saved)) state = { ...state, items: saved };
  } catch {
    // Storage unavailable or corrupt: start with an empty list.
  }
}

function update(next: Partial<QuoteState>) {
  state = { ...state, ...next };
  if (next.items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Ignore: the list still works for this visit.
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useQuote() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
  return {
    items: current.items,
    open: current.open,
    totalPieces: current.items.reduce((sum, item) => sum + item.qty, 0),
  };
}

const sameLine = (a: Pick<QuoteItem, "code" | "plating">, b: Pick<QuoteItem, "code" | "plating">) =>
  a.code === b.code && a.plating === b.plating;

export const quoteActions = {
  /** Adds a line, or raises the quantity if the same piece and plating is already listed. */
  add(item: QuoteItem) {
    const existing = state.items.find((line) => sameLine(line, item));
    const items = existing
      ? state.items.map((line) => (sameLine(line, item) ? { ...line, qty: line.qty + item.qty } : line))
      : [...state.items, item];
    update({ items });
  },
  setQty(line: Pick<QuoteItem, "code" | "plating">, qty: number) {
    update({
      items: state.items.map((item) => (sameLine(item, line) ? { ...item, qty: Math.max(item.minOrder, qty) } : item)),
    });
  },
  remove(line: Pick<QuoteItem, "code" | "plating">) {
    update({ items: state.items.filter((item) => !sameLine(item, line)) });
  },
  clear() {
    update({ items: [] });
  },
  setOpen(open: boolean) {
    update({ open });
  },
};
