import { locales, type Localized } from "@/i18n/config";
import { publicImageUrl } from "@/lib/supabase/config";
import { imageWidths, type CategorySlug, type Issue, type Product, type ProductImage } from "./types";

/** Database row shapes (see supabase/migrations). */
export interface IssueRow {
  id: string;
  slug: string;
  number: number;
  collection_name: Partial<Localized>;
  season: Partial<Localized>;
  intro: Partial<Localized>;
  published_at: string;
  cover_product_code: string | null;
  pdf_url: string | null;
  is_published: boolean;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  position: number;
  path_prefix: string;
  width: number;
  height: number;
  blur_data_url: string | null;
}

export interface ProductRow {
  id: string;
  code: string;
  name: string;
  description: Partial<Localized> | null;
  category: CategorySlug;
  issue_id: string | null;
  weight_grams: number;
  sizes: string | null;
  min_order: number;
  featured: boolean;
  is_published: boolean;
  sort_order: number;
}

/** Fills missing languages with the Turkish text so a page never shows an empty string. */
export function localize(value: Partial<Localized> | null | undefined): Localized {
  const fallback = value?.tr ?? "";
  return Object.fromEntries(locales.map((code) => [code, value?.[code]?.trim() || fallback])) as Localized;
}

export function issueFromRow(row: IssueRow): Issue {
  return {
    slug: row.slug,
    number: row.number,
    collectionName: localize(row.collection_name),
    season: localize(row.season),
    intro: localize(row.intro),
    publishedAt: row.published_at,
    coverProductCode: row.cover_product_code ?? "",
    pdfUrl: row.pdf_url ?? undefined,
  };
}

export function imageFromRow(row: ProductImageRow): ProductImage {
  const largest = imageWidths[imageWidths.length - 1];
  return {
    src: publicImageUrl(`${row.path_prefix}/${largest}.webp`),
    srcSet: imageWidths.map((w) => `${publicImageUrl(`${row.path_prefix}/${w}.webp`)} ${w}w`).join(", "),
    width: row.width,
    height: row.height,
    blurDataURL: row.blur_data_url ?? undefined,
  };
}

export function productFromRow(
  row: ProductRow,
  issueSlugById: Map<string, string>,
  images: ProductImageRow[],
): Product {
  const description = row.description && row.description.tr ? localize(row.description) : undefined;
  return {
    code: row.code,
    name: row.name,
    description,
    category: row.category,
    issueSlug: (row.issue_id && issueSlugById.get(row.issue_id)) || "",
    weightGrams: Number(row.weight_grams),
    sizes: row.sizes ?? undefined,
    minOrder: row.min_order,
    images: images.sort((a, b) => a.position - b.position).map(imageFromRow),
    featured: row.featured,
  };
}
