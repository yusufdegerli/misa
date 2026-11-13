import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct } from "@/lib/admin/actions";
import { getProductRow, listIssues } from "@/lib/admin/data";
import { productSlug } from "@/lib/catalog/types";

// Reads live admin data on every visit; navigation may wait for it (see app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Ürünü düzenle" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [found, issues] = await Promise.all([getProductRow(id), listIssues()]);
  if (!found) notFound();
  const { product, images } = found;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-steel hover:text-ink">
        ← Genel bakış
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-steel">{product.code}</p>
          <h1 className="font-display text-5xl font-light text-ink">{product.name}</h1>
        </div>
        <div className="flex gap-3">
          {product.is_published && (
            <a
              href={`/tr/product/${productSlug(product.code)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 content-center text-sm text-steel hover:text-ink"
            >
              Sitede gör ↗
            </a>
          )}
          <DeleteButton
            label="Ürünü sil"
            confirmText={`${product.code} ${product.name} ve tüm fotoğrafları silinsin mi? Bu işlem geri alınamaz.`}
            action={deleteProduct.bind(null, product.id)}
          />
        </div>
      </div>
      <ImageManager productId={product.id} images={images} />
      <ProductForm product={product} issues={issues} />
    </div>
  );
}
