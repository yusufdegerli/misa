import type { Locale } from "@/i18n/config";

/**
 * Public contact details. Environment variables can override each one (for example on a
 * staging deployment) without a code change.
 */
export const site = {
  name: "Mişa Silver",
  /** International format, digits only. */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905339737593").replace(/\D/g, ""),
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || "+90 533 973 75 93",
  phone: process.env.NEXT_PUBLIC_PHONE || "+90 536 277 52 77",
  telegramUsername: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "misasilver925@gmail.com",
  addressTitle: "Beyazıt Merkez",
  address:
    process.env.NEXT_PUBLIC_ADDRESS || "Yeniçeriler Cad. Bileyciler Sok. No:28, Tavukpazarı, Çemberlitaş",
};

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function mailtoLink(subject: string, body: string): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function phoneLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mapsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${site.address}`)}`;
}

/** Builds a path inside the given language, e.g. localePath("en", "/product/ms-1042"). */
export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}
