import type { Locale } from "./config";

/** Replaces `{key}` placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Intl locale tags. Arabic keeps Latin digits so product codes and weights read the same everywhere. */
const intlTags: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ru: "ru-RU",
  ar: "ar-u-nu-latn",
  hu: "hu-HU",
};

export function formatNumber(locale: Locale, value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat(intlTags[locale], { maximumFractionDigits }).format(value);
}
