import type { Localized } from "@/i18n/config";

export const categorySlugs = ["rings", "necklaces", "earrings", "bracelets", "sets"] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export interface ProductImage {
  /** Public URL of the original upload; the image CDN derives every display size from it. */
  src: string;
  width: number;
  height: number;
  /** Tiny blurred preview shown while the real image loads. */
  blurDataURL?: string;
}

/** A season's collection, presented like a magazine issue. */
export interface Issue {
  slug: string;
  number: number;
  /** Collection name, e.g. "Ayaz". Localized because Russian and Arabic write it in their own script. */
  collectionName: Localized;
  season: Localized;
  intro: Localized;
  /** ISO date; the newest published issue is the current one. */
  publishedAt: string;
  coverProductCode: string;
  pdfUrl?: string;
}

export interface Product {
  /** Wholesale product code, e.g. "MS-1042". Also used (lowercased) in the URL. */
  code: string;
  /** Proper name of the piece, e.g. "Seren". Shown with the category's word in each language. */
  name: string;
  description?: Localized;
  category: CategorySlug;
  issueSlug: string;
  weightGrams: number;
  sizes?: string;
  minOrder: number;
  /** Ordered 4:5 photos. Empty until the owner uploads them; the site shows a placeholder meanwhile. */
  images: ProductImage[];
  featured?: boolean;
}

export function productSlug(code: string): string {
  return code.toLowerCase();
}
