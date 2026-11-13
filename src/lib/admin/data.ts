import "server-only";
import type { IssueRow, ProductImageRow, ProductRow } from "@/lib/catalog/db";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";

/**
 * Admin reads include drafts, so they use the secret-key client. Each one checks the admin first:
 * a second line of defence, and it reads the session cookie, which keeps these pages out of
 * build-time prerendering (they always render per request).
 */

export async function listIssues(): Promise<IssueRow[]> {
  await requireAdmin();
  const { data, error } = await createAdminClient()
    .from("issues")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as IssueRow[];
}

export type ProductListItem = ProductRow & { image_count: number; first_image: string | null };

export async function listProducts(): Promise<ProductListItem[]> {
  await requireAdmin();
  const db = createAdminClient();
  const [products, images] = await Promise.all([
    db.from("products").select("*").order("sort_order").order("created_at", { ascending: false }),
    db.from("product_images").select("product_id, path_prefix, position").order("position"),
  ]);
  if (products.error) throw new Error(products.error.message);
  if (images.error) throw new Error(images.error.message);
  return (products.data as ProductRow[]).map((product) => {
    const own = images.data.filter((image) => image.product_id === product.id);
    return { ...product, image_count: own.length, first_image: own[0]?.path_prefix ?? null };
  });
}

export async function getIssueRow(id: string): Promise<IssueRow | null> {
  await requireAdmin();
  const { data } = await createAdminClient().from("issues").select("*").eq("id", id).maybeSingle();
  return (data as IssueRow | null) ?? null;
}

export async function getProductRow(id: string): Promise<{ product: ProductRow; images: ProductImageRow[] } | null> {
  await requireAdmin();
  const db = createAdminClient();
  const [product, images] = await Promise.all([
    db.from("products").select("*").eq("id", id).maybeSingle(),
    db.from("product_images").select("*").eq("product_id", id).order("position"),
  ]);
  if (!product.data) return null;
  return { product: product.data as ProductRow, images: (images.data ?? []) as ProductImageRow[] };
}
