import type { Locale } from "@/i18n/config";

/** Contact details come from environment variables so they can change without a code edit. */
export const site = {
  name: "Mişa Silver",
  /** International format, digits only, e.g. 905xxxxxxxxx. Empty lets WhatsApp ask for a contact. */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  telegramUsername: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_ADDRESS ?? "",
};

export function whatsappLink(text: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function mailtoLink(subject: string, body: string): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Builds a path inside the given language, e.g. localePath("en", "/product/ms-1042"). */
export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}
