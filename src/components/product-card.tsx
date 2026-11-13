import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatNumber } from "@/i18n/format";
import { productSlug, type Product } from "@/lib/catalog";
import { localePath } from "@/lib/site";

export function productDisplayName(product: Product, dict: Dictionary): string {
  return fill(dict.categories.productName, {
    name: product.name,
    type: dict.categories.singular[product.category],
  });
}

interface ProductCardProps {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  sizes: string;
  /** "dark" on the warm-black ground, "light" inside ivory sections. */
  tone?: "dark" | "light";
  size?: "md" | "lg";
}

export function ProductCard({ product, locale, dict, sizes, tone = "dark", size = "md" }: ProductCardProps) {
  const name = productDisplayName(product, dict);
  const nameColor = tone === "dark" ? "text-pearl-strong" : "text-ivory-ink";
  const metaColor = tone === "dark" ? "text-smoke" : "text-ivory-muted";
  return (
    // Full prefetch so the product page is ready on click and the photo can morph into place.
    <Link
      href={localePath(locale, `/product/${productSlug(product.code)}`)}
      prefetch={true}
      className="group flex flex-col gap-4"
    >
      <div className="transition-transform duration-700 ease-soft group-hover:-translate-y-1.5">
        <ProductVisual product={product} alt={name} pendingLabel={dict.product.photoPending} sizes={sizes} morph />
      </div>
      <div
        className={
          size === "lg" ? "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" : "flex flex-col gap-1"
        }
      >
        <span className={`font-display ${size === "lg" ? "text-[32px]" : "text-2xl"} leading-tight ${nameColor}`}>
          {name}
        </span>
        <span dir="ltr" className={`self-start text-[11px] tracking-[0.14em] rtl:self-end ${metaColor}`}>
          {product.code} · {fill(dict.product.grams, { g: formatNumber(locale, product.weightGrams) })}
        </span>
      </div>
    </Link>
  );
}
