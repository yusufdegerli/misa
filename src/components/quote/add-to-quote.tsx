"use client";

import { useState } from "react";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CategorySlug, Plating } from "@/lib/catalog";
import { quoteActions } from "./quote-store";

const platingSwatch: Record<Plating, string> = {
  rhodium: "#D9D9D6",
  gold: "#D4B26A",
  rose: "#D9A08E",
};

interface AddToQuoteProps {
  product: {
    code: string;
    slug: string;
    name: string;
    category: CategorySlug;
    minOrder: number;
    platings: Plating[];
  };
  t: Pick<Dictionary["product"], "plating" | "platings" | "addToQuote" | "added"> &
    Pick<Dictionary["quote"], "decrease" | "increase" | "min">;
  minLabel: string;
}

/** Plating choice, quantity in steps of the minimum order, and the add button. */
export function AddToQuote({ product, t, minLabel }: AddToQuoteProps) {
  const [plating, setPlating] = useState<Plating>(product.platings[0] ?? "rhodium");
  const [qty, setQty] = useState(product.minOrder);
  const [added, setAdded] = useState(false);

  function add() {
    quoteActions.add({ ...product, plating, qty });
    setAdded(true);
    quoteActions.setOpen(true);
    window.setTimeout(() => setAdded(false), 2400);
  }

  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="mb-3.5 text-xs tracking-[0.2em] text-smoke uppercase">{t.plating}</legend>
        <div className="flex flex-wrap gap-2.5">
          {product.platings.map((option) => {
            const selected = option === plating;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => setPlating(option)}
                className={`flex min-h-11 items-center gap-2.5 rounded-full border px-4.5 text-[13px] transition-colors ${
                  selected ? "border-gold text-pearl-strong" : "border-pearl/25 text-mist hover:border-pearl/50"
                }`}
              >
                <span aria-hidden="true" className="size-3 rounded-full" style={{ background: platingSwatch[option] }} />
                {t.platings[option]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex min-h-14 items-center rounded-full border border-pearl/25">
          <button
            type="button"
            onClick={() => setQty((n) => Math.max(product.minOrder, n - product.minOrder))}
            disabled={qty <= product.minOrder}
            aria-label={t.decrease}
            className="flex h-14 w-12 items-center justify-center text-pearl disabled:opacity-30"
          >
            <MinusIcon />
          </button>
          <span className="min-w-14 text-center text-[15px] text-pearl-strong" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((n) => n + product.minOrder)}
            aria-label={t.increase}
            className="flex h-14 w-12 items-center justify-center text-pearl"
          >
            <PlusIcon />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex min-h-14 flex-1 basis-56 items-center justify-center gap-2.5 rounded-full bg-gold px-6 text-sm font-semibold tracking-[0.06em] text-ink transition-colors hover:bg-gold-light"
        >
          {added ? <CheckIcon /> : <PlusIcon />}
          <span aria-live="polite">{added ? t.added : t.addToQuote}</span>
        </button>
      </div>
      <p className="-mt-5 text-xs text-smoke">{minLabel}</p>
    </div>
  );
}
