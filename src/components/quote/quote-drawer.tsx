"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { JewelryArt } from "@/components/brand";
import { ChatIcon, CloseIcon, ListIcon, MinusIcon, PlusIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { localePath, mailtoLink, site, whatsappLink } from "@/lib/site";
import { quoteActions, useQuote, type QuoteItem } from "./quote-store";

export type QuoteStrings = Pick<Dictionary, "quote" | "nav"> & {
  categories: Pick<Dictionary["categories"], "singular" | "productName">;
  product: Pick<Dictionary["product"], "platings" | "pieces">;
};

function lineName(item: QuoteItem, t: QuoteStrings) {
  return fill(t.categories.productName, { name: item.name, type: t.categories.singular[item.category] });
}

export function buildQuoteMessage(items: QuoteItem[], t: QuoteStrings): string {
  const lines = items.map(
    (item) =>
      `• ${item.code} ${lineName(item, t)} – ${t.product.platings[item.plating]} – ${fill(t.product.pieces, { n: item.qty })}`,
  );
  return [t.quote.intro, ...lines].join("\n");
}

/** Header button that shows how many lines are in the list and opens the drawer. */
export function QuoteButton({ t, compact = false }: { t: QuoteStrings; compact?: boolean }) {
  const { items } = useQuote();
  const badge = (
    <span className="inline-flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-ink">
      {items.length}
    </span>
  );
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => quoteActions.setOpen(true)}
        aria-label={`${t.quote.title} (${items.length})`}
        className="relative flex size-11 items-center justify-center text-gold-light"
      >
        <ListIcon size={22} />
        <span className="absolute -top-0.5 -end-0.5">{badge}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => quoteActions.setOpen(true)}
      className="flex min-h-11 items-center gap-2.5 rounded-full border border-gold/50 px-4.5 text-xs tracking-[0.08em] text-gold-light transition-colors hover:border-gold hover:bg-gold/10"
    >
      <ListIcon />
      {t.nav.quoteList}
      {badge}
    </button>
  );
}

export function QuoteDrawer({ t, locale }: { t: QuoteStrings; locale: Locale }) {
  const { items, open, totalPieces } = useQuote();
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const rtl = locale === "ar";
  const message = buildQuoteMessage(items, t);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") quoteActions.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("lenis-stopped");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("lenis-stopped");
      previouslyFocused?.focus();
    };
  }, [open]);

  const offscreen = rtl ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => quoteActions.setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-title"
            data-lenis-prevent
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-ink shadow-2xl"
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 }}
          >
            <header className="flex items-center justify-between border-b border-line ps-6 pe-4 py-4">
              <div>
                <h2 id="quote-title" className="font-display text-[34px] font-light text-pearl-strong">
                  {t.quote.title}
                </h2>
                <p className="text-xs text-smoke">
                  {fill(t.quote.summary, { count: items.length, total: totalPieces })}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => quoteActions.setOpen(false)}
                aria-label={t.nav.close}
                className="flex size-11 items-center justify-center text-pearl hover:text-gold-light"
              >
                <CloseIcon size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <p className="flex-1 px-6 py-10 text-[15px] leading-relaxed text-mist">{t.quote.empty}</p>
            ) : (
              <ul className="flex-1 overflow-y-auto px-6">
                {items.map((item) => (
                  <li key={`${item.code}-${item.plating}`} className="flex gap-3.5 border-b border-line py-4.5">
                    <Link
                      href={localePath(locale, `/product/${item.slug}`)}
                      onClick={() => quoteActions.setOpen(false)}
                      className="stage flex h-20 w-16 shrink-0 items-center justify-center"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <JewelryArt category={item.category} className="w-[80%]" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={localePath(locale, `/product/${item.slug}`)}
                          onClick={() => quoteActions.setOpen(false)}
                          className="font-display text-[22px] leading-tight text-pearl-strong hover:text-gold-light"
                        >
                          {lineName(item, t)}
                        </Link>
                        <button
                          type="button"
                          onClick={() => quoteActions.remove(item)}
                          className="min-h-8 text-[11px] text-smoke underline-offset-4 hover:text-pearl hover:underline"
                        >
                          {t.quote.remove}
                        </button>
                      </div>
                      <span dir="ltr" className="self-start text-[11px] tracking-[0.12em] text-smoke">
                        {item.code} · {t.product.platings[item.plating]}
                      </span>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-pearl/25">
                          <button
                            type="button"
                            onClick={() => quoteActions.setQty(item, item.qty - item.minOrder)}
                            disabled={item.qty <= item.minOrder}
                            aria-label={t.quote.decrease}
                            className="flex h-10 w-11 items-center justify-center text-pearl disabled:opacity-30"
                          >
                            <MinusIcon />
                          </button>
                          <span className="min-w-8 text-center text-sm text-pearl-strong" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => quoteActions.setQty(item, item.qty + item.minOrder)}
                            aria-label={t.quote.increase}
                            className="flex h-10 w-11 items-center justify-center text-pearl"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                        <span className="text-[11px] text-smoke">{fill(t.quote.min, { n: item.minOrder })}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {items.length > 0 && (
              <footer className="flex flex-col gap-3 border-t border-line bg-ink-raised px-6 pt-4 pb-6">
                <p className="text-[11px] tracking-[0.2em] text-gold uppercase">{t.quote.preview}</p>
                <p className="max-h-36 overflow-y-auto rounded-xl bg-charcoal px-3.5 py-3 text-xs leading-relaxed whitespace-pre-line text-mist">
                  {message}
                </p>
                <a
                  href={whatsappLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-13.5 items-center justify-center gap-2.5 rounded-full bg-gold text-[15px] font-semibold text-ink transition-colors hover:bg-gold-light"
                >
                  <ChatIcon size={18} />
                  {t.quote.sendWhatsApp}
                </a>
                <div className="flex items-center justify-between">
                  {site.email ? (
                    <a
                      href={mailtoLink(t.quote.emailSubject, message)}
                      className="flex min-h-11 items-center text-[13px] text-pearl hover:text-gold-light"
                    >
                      {t.quote.sendEmail}
                    </a>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => quoteActions.clear()}
                    className="min-h-11 text-[13px] text-smoke hover:text-pearl"
                  >
                    {t.quote.clear}
                  </button>
                </div>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
