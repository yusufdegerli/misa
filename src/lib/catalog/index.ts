import { cacheLife, cacheTag } from "next/cache";
import { sampleIssues, sampleProducts } from "./sample-data";
import { categorySlugs, productSlug, type CategorySlug, type Issue, type Product } from "./types";

/**
 * Read access to the catalogue.
 *
 * Today this reads the sample data. When the database is connected, only the bodies of these
 * functions change; pages keep calling the same API. Saving in the admin panel will call
 * `revalidateTag(CATALOG_TAG)` so the site updates within seconds while staying static-fast.
 */
export const CATALOG_TAG = "catalog";

async function loadCatalog(): Promise<{ issues: Issue[]; products: Product[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
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
export type { Plating, ProductImage } from "./types";
