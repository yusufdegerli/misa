/** Supabase connection settings read from the environment (see .env.example). */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when the site should read the catalogue from Supabase instead of the sample data. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const IMAGE_BUCKET = "product-images";

/** Public URL of a file in the product image bucket. */
export function publicImageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
