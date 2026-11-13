import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import { issueFromRow, productFromRow, type IssueRow, type ProductImageRow, type ProductRow } from "./db";
import { sampleIssues, sampleProducts } from "./sample-data";
import { categorySlugs, productSlug, type CategorySlug, type Issue, type Product } from "./types";

/**
 * Read access to the catalogue.
 *
 * Reads published content from Supabase when it is configured, otherwise the sample data.
 * Results are cached; the admin panel calls `updateTag(CATALOG_TAG)` after every save so the
 * site shows changes on the next request while staying static-fast.
 */
export const CATALOG_TAG = "catalog";

async function loadFromSupabase(): Promise<{ issues: Issue[]; products: Product[] }> {
  const db = createPublicClient();
  const [issuesRes, productsRes, imagesRes] = await Promise.all([
    db.from("issues").select("*").order("published_at", { ascending: false }),
    db.from("products").select("*").order("sort_order").order("created_at"),
    db.from("product_images").select("*").order("position"),
  ]);
  const error = issuesRes.error ?? productsRes.error ?? imagesRes.error;
  if (error) throw new Error(`Catalogue could not be loaded: ${error.message}`);

  const issueRows = issuesRes.data as IssueRow[];
  const issueSlugById = new Map(issueRows.map((row) => [row.id, row.slug]));
  const imagesByProduct = new Map<string, ProductImageRow[]>();
  for (const image of imagesRes.data as ProductImageRow[]) {
    imagesByProduct.set(image.product_id, [...(imagesByProduct.get(image.product_id) ?? []), image]);
  }
  return {
    issues: issueRows.map(issueFromRow),
    products: (productsRes.data as ProductRow[]).map((row) =>
      productFromRow(row, issueSlugById, imagesByProduct.get(row.id) ?? []),
    ),
  };
}

async function loadCatalog(): Promise<{ issues: Issue[]; products: Product[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  if (isSupabaseConfigured) return loadFromSupabase();
  const issues = [...sampleIssues].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { issues, products: sampleProducts };
}

export async function getIssues(): Promise<Issue[]> {
  return (await loadCatalog()).issues;
}

export async function getCurrentIssue(): Promise<Issue | undefined> {
  return (await getIssues())[0];
}

export async function getIssue(slug: string): Promise<Issue | undefined> {
  return (await getIssues()).find((issue) => issue.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  return (await loadCatalog()).products;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((product) => productSlug(product.code) === slug);
}

export async function getProductByCode(code: string): Promise<Product | undefined> {
  return (await getProducts()).find((product) => product.code === code);
}

export async function getIssueProducts(issueSlug: string): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.issueSlug === issueSlug);
}

/** Products of a category, newest issue first. */
export async function getCategoryProducts(category: CategorySlug): Promise<Product[]> {
  const [issues, products] = await Promise.all([getIssues(), getProducts()]);
  const issueOrder = new Map(issues.map((issue, index) => [issue.slug, index]));
  return products
    .filter((product) => product.category === category)
    .sort((a, b) => (issueOrder.get(a.issueSlug) ?? 99) - (issueOrder.get(b.issueSlug) ?? 99));
}

export function isCategorySlug(value: string): value is CategorySlug {
  return (categorySlugs as readonly string[]).includes(value);
}

export { categorySlugs, productSlug };
export type { CategorySlug, Issue, Product };
export type { ProductImage } from "./types";
