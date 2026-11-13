import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { listIssues } from "@/lib/admin/data";

// Reads live admin data on every visit; navigation may wait for it (see app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Yeni ürün" };

export default async function NewProductPage() {
  const issues = await listIssues();
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-steel hover:text-ink">
        ← Genel bakış
      </Link>
      <h1 className="font-display text-5xl font-light text-ink">Yeni ürün</h1>
      <p className="-mt-3 text-sm text-steel">Kaydettikten sonra fotoğraf ekleme bölümü açılır.</p>
      <ProductForm issues={issues} />
    </div>
  );
}
