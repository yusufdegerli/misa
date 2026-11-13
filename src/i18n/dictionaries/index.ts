import type { Locale } from "../config";
import ar from "./ar";
import en from "./en";
import hu from "./hu";
import ru from "./ru";
import tr, { type Dictionary } from "./tr";

const dictionaries: Record<Locale, Dictionary> = { tr, en, ru, ar, hu };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
