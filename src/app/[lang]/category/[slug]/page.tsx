import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal, RevealWords } from "@/components/motion";
import { GridPageSkeleton } from "@/components/skeletons";
import { ProductCard } from "@/components/product-card";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { categorySlugs, getCategoryProducts, isCategorySlug } from "@/lib/catalog";

export function generateStaticParams() {
  return locales.flatMap((lang) => categorySlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isCategorySlug(slug)) return {};
  return { title: getDictionary(lang).categories.plural[slug] };
}

export default function CategoryPage({ params }: PageProps<"/[lang]/category/[slug]">) {
  return (
    <Suspense fallback={<GridPageSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: Pick<PageProps<"/[lang]/category/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isCategorySlug(slug)) notFound();
  const dict = getDictionary(lang);
  const products = await getCategoryProducts(slug);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-12 pb-28 md:px-10 md:pt-20">
      <header className="mb-16 flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-10">
        <h1 className="font-display text-[clamp(64px,10vw,128px)] leading-[0.9] font-light text-ink">
          <RevealWords text={dict.categories.plural[slug]} />
        </h1>
        <p className="text-sm tracking-[0.12em] text-antique">{fill(dict.categories.count, { n: products.length })}</p>
      </header>
      {products.length === 0 ? (
        <p className="text-steel">{dict.categories.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal as="li" key={product.code} delay={(index % 4) * 0.08}>
              <ProductCard product={product} locale={lang} dict={dict} sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw" />
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
