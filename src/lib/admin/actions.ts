"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { CATALOG_TAG } from "@/lib/catalog";
import { categorySlugs, imageWidths } from "@/lib/catalog/types";
import { IMAGE_BUCKET } from "@/lib/supabase/config";
import { createAdminClient, createSessionClient } from "@/lib/supabase/server";
import { isAllowedAdmin, requireAdmin } from "./auth";
import { todayInIstanbul } from "./dates";

export interface FormState {
  error?: string;
  saved?: boolean;
}

/* ----------------------------------------------------------------------------------------- */
/* Sign in / out                                                                              */
/* ----------------------------------------------------------------------------------------- */

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "E-posta ve şifre gerekli." };
  if (!isAllowedAdmin(email)) return { error: "Bu e-posta ile giriş yetkisi yok." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-posta veya şifre hatalı." };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ----------------------------------------------------------------------------------------- */
/* Helpers                                                                                    */
/* ----------------------------------------------------------------------------------------- */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Reads `${prefix}.tr`, `${prefix}.en`, … into one object, dropping empty languages. */
function localized(formData: FormData, prefix: string): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {};
  for (const code of locales) {
    const value = text(formData, `${prefix}.${code}`);
    if (value) result[code] = value;
  }
  return result;
}

function friendlyDbError(message: string): string {
  if (message.includes("duplicate key")) return "Bu kod veya kısa ad zaten kullanılıyor.";
  if (message.includes("violates check constraint")) return "Bazı alanlar geçersiz. Lütfen kontrol edin.";
  return `Kaydedilemedi: ${message}`;
}

/* ----------------------------------------------------------------------------------------- */
/* Issues                                                                                     */
/* ----------------------------------------------------------------------------------------- */

export async function saveIssue(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(formData, "id");
  const row = {
    slug: text(formData, "slug").toLowerCase(),
    number: Number(text(formData, "number")),
    collection_name: localized(formData, "collection_name"),
    season: localized(formData, "season"),
    intro: localized(formData, "intro"),
    published_at: text(formData, "published_at") || todayInIstanbul(),
    cover_product_code: text(formData, "cover_product_code") || null,
    pdf_url: text(formData, "pdf_url") || null,
    is_published: formData.get("is_published") === "on",
  };

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug)) {
    return { error: "Kısa ad yalnızca küçük harf, rakam ve tire içerebilir (ör. kis-2026)." };
  }
  if (!Number.isInteger(row.number) || row.number < 1) return { error: "Sayı numarası 1 veya daha büyük olmalı." };
  if (!row.collection_name.tr || !row.season.tr) return { error: "Koleksiyon adı ve sezon Türkçe olarak gerekli." };

  const db = createAdminClient();
  const result = id
    ? await db.from("issues").update(row).eq("id", id).select("id").single()
    : await db.from("issues").insert(row).select("id").single();
  if (result.error) return { error: friendlyDbError(result.error.message) };

  updateTag(CATALOG_TAG);
  if (!id) redirect(`/admin/issues/${result.data.id}`);
  return { saved: true };
}

export async function deleteIssue(id: string) {
  await requireAdmin();
  const { error } = await createAdminClient().from("issues").delete().eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(CATALOG_TAG);
  redirect("/admin");
}

/* ----------------------------------------------------------------------------------------- */
/* Products                                                                                   */
/* ----------------------------------------------------------------------------------------- */

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(formData, "id");
  const category = text(formData, "category");
  const row = {
    code: text(formData, "code").toUpperCase().replace(/\s+/g, ""),
    name: text(formData, "name"),
    description: localized(formData, "description"),
    category,
    issue_id: text(formData, "issue_id") || null,
    weight_grams: Number(text(formData, "weight_grams").replace(",", ".")),
    sizes: text(formData, "sizes") || null,
    min_order: Number(text(formData, "min_order")),
    sort_order: Number(text(formData, "sort_order") || "0"),
    featured: formData.get("featured") === "on",
    is_published: formData.get("is_published") === "on",
  };

  if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(row.code)) return { error: "Ürün kodu harf, rakam ve tireden oluşmalı (ör. MS-1042)." };
  if (!row.name) return { error: "Ürün adı gerekli." };
  if (!(categorySlugs as readonly string[]).includes(category)) return { error: "Kategori seçin." };
  if (!(row.weight_grams > 0)) return { error: "Ağırlık 0'dan büyük bir sayı olmalı (ör. 4,2)." };
  if (!Number.isInteger(row.min_order) || row.min_order < 1) return { error: "Minimum sipariş 1 veya daha büyük olmalı." };
  if (!Number.isInteger(row.sort_order)) return { error: "Sıra bir tam sayı olmalı." };

  const db = createAdminClient();
  const payload = { ...row, description: Object.keys(row.description).length ? row.description : null };
  const result = id
    ? await db.from("products").update(payload).eq("id", id).select("id").single()
    : await db.from("products").insert(payload).select("id").single();
  if (result.error) return { error: friendlyDbError(result.error.message) };

  updateTag(CATALOG_TAG);
  if (!id) redirect(`/admin/products/${result.data.id}`);
  return { saved: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data: images } = await db.from("product_images").select("path_prefix").eq("product_id", id);
  const paths = (images ?? []).flatMap((image) => imageWidths.map((w) => `${image.path_prefix}/${w}.webp`));
  if (paths.length) await db.storage.from(IMAGE_BUCKET).remove(paths);
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(CATALOG_TAG);
  redirect("/admin");
}

/* ----------------------------------------------------------------------------------------- */
/* Product images                                                                             */
/* ----------------------------------------------------------------------------------------- */

export interface UploadTicket {
  pathPrefix: string;
  uploads: { width: number; path: string; token: string }[];
}

/** Reserves storage paths for one photo and returns signed upload tokens for each width. */
export async function requestImageUpload(productId: string): Promise<UploadTicket> {
  await requireAdmin();
  const db = createAdminClient();
  const pathPrefix = `${productId}/${crypto.randomUUID()}`;
  const uploads = await Promise.all(
    imageWidths.map(async (width) => {
      const path = `${pathPrefix}/${width}.webp`;
      const { data, error } = await db.storage.from(IMAGE_BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw new Error(error?.message ?? "Upload could not be prepared.");
      return { width, path, token: data.token };
    }),
  );
  return { pathPrefix, uploads };
}

/** Records an uploaded photo after all its sizes are in storage. */
export async function finishImageUpload(input: {
  productId: string;
  pathPrefix: string;
  width: number;
  height: number;
  blurDataURL: string;
}) {
  await requireAdmin();
  if (!input.pathPrefix.startsWith(`${input.productId}/`)) throw new Error("Invalid image path.");
  const db = createAdminClient();
  const { data: last } = await db
    .from("product_images")
    .select("position")
    .eq("product_id", input.productId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await db.from("product_images").insert({
    product_id: input.productId,
    path_prefix: input.pathPrefix,
    width: Math.round(input.width),
    height: Math.round(input.height),
    blur_data_url: input.blurDataURL.slice(0, 4000),
    position: (last?.position ?? -1) + 1,
  });
  if (error) throw new Error(error.message);
  updateTag(CATALOG_TAG);
}

export async function deleteImage(imageId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db.from("product_images").delete().eq("id", imageId).select("path_prefix").single();
  if (error) throw new Error(error.message);
  await db.storage.from(IMAGE_BUCKET).remove(imageWidths.map((w) => `${data.path_prefix}/${w}.webp`));
  updateTag(CATALOG_TAG);
}

/** Saves a new photo order; the first photo is the one shown on cards. */
export async function reorderImages(productId: string, orderedIds: string[]) {
  await requireAdmin();
  const db = createAdminClient();
  const results = await Promise.all(
    orderedIds.map((id, position) =>
      db.from("product_images").update({ position }).eq("id", id).eq("product_id", productId),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  updateTag(CATALOG_TAG);
}
