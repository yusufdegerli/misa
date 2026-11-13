import Link from "next/link";
import { Badge, Card, primaryButton, secondaryButton } from "@/components/admin/ui";
import { JewelryArt } from "@/components/brand";
import { getDictionary } from "@/i18n/dictionaries";
import { listIssues, listProducts } from "@/lib/admin/data";
import { publicImageUrl } from "@/lib/supabase/config";

// Reads live admin data on every visit; navigation may wait for it (see app/admin/layout.tsx).
export const instant = false;

export default async function AdminHome() {
  const [issues, products] = await Promise.all([listIssues(), listProducts()]);
  const tr = getDictionary("tr");
  const issueName = new Map(issues.map((issue) => [issue.id, `${issue.collection_name.tr ?? issue.slug}`]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-light text-ink">Genel bakış</h1>
          <p className="mt-2 text-sm text-steel">
            {products.length} ürün · {issues.length} sezon. Yaptığınız değişiklikler kaydedince sitede görünür.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/issues/new" className={secondaryButton}>
            Yeni sezon
          </Link>
          <Link href="/admin/products/new" className={primaryButton}>
            Yeni ürün
          </Link>
        </div>
      </div>

      <Card title="Sezonlar">
        {issues.length === 0 ? (
          <p className="text-sm text-steel">
            Henüz sezon yok. Ürünler bir sezona bağlanır; önce bir sezon oluşturun (ör. Sayı 1 · Kış 2026).
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link
                  href={`/admin/issues/${issue.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-antique"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-xs text-steel">Sayı {issue.number}</span>
                    <span className="font-display text-2xl">{issue.collection_name.tr}</span>
                    <span className="text-sm text-steel">{issue.season.tr}</span>
                  </span>
                  <Badge tone={issue.is_published ? "live" : "draft"}>
                    {issue.is_published ? "Yayında" : "Taslak"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Ürünler">
        {products.length === 0 ? (
          <p className="text-sm text-steel">Henüz ürün yok.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}`} className="group flex flex-col gap-2">
                  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-hairline bg-tile">
                    {product.first_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={publicImageUrl(`${product.first_image}/640.webp`)}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-contain"
                      />
                    ) : (
                      <JewelryArt category={product.category} className="w-[60%] opacity-60" />
                    )}
                    <span className="absolute top-2 left-2">
                      <Badge tone={product.is_published ? "live" : "draft"}>
                        {product.is_published ? "Yayında" : "Taslak"}
                      </Badge>
                    </span>
                  </div>
                  <span className="text-sm font-medium text-ink group-hover:text-antique">
                    {product.name} {tr.categories.singular[product.category]}
                  </span>
                  <span className="-mt-1.5 text-xs text-steel">
                    {product.code} · {product.image_count} foto ·{" "}
                    {(product.issue_id && issueName.get(product.issue_id)) || "sezonsuz"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
