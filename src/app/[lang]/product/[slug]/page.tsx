import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowIcon, ChatIcon } from "@/components/icons";
import { ProductSkeleton } from "@/components/skeletons";
import { Reveal } from "@/components/motion";
import { ProductCard, productDisplayName } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fill, formatNumber } from "@/i18n/format";
import { getIssue, getIssueProducts, getProduct, getProducts, productSlug } from "@/lib/catalog";
import { localePath, mailtoLink, site, whatsappLink } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  const params = locales.flatMap((lang) => products.map((product) => ({ lang, slug: productSlug(product.code) })));
  // At least one entry is required to prerender; an unknown slug simply renders "not found".
  return params.length ? params : [{ lang: defaultLocale, slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getProduct(slug);
  if (!isLocale(lang) || !product) return {};
  const dict = getDictionary(lang);
  return {
    title: `${productDisplayName(product, dict)} · ${product.code}`,
    description: product.description?.[lang] ?? dict.meta.description,
  };
}

export default function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/[lang]/product/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = await getProduct(slug);
  if (!product) notFound();

  const dict = getDictionary(lang);
  const [issue, siblings] = await Promise.all([getIssue(product.issueSlug), getIssueProducts(product.issueSlug)]);
  const related = siblings.filter((item) => item.code !== product.code).slice(0, 4);
  const name = productDisplayName(product, dict);
  const t = dict.product;
  const question = fill(t.whatsAppQuestion, { code: product.code, name });

  const specs = [
    { label: t.purity, value: t.purityValue },
    { label: t.weight, value: fill(t.grams, { g: formatNumber(lang, product.weightGrams) }) },
    product.sizes && { label: t.sizes, value: product.sizes },
    { label: t.minOrder, value: fill(t.pieces, { n: product.minOrder }) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-6 pb-28 md:px-10 md:pt-8">
      <nav aria-label={dict.a11y.breadcrumb} className="mb-10 text-xs tracking-[0.08em] text-steel">
        <ol className="flex flex-wrap gap-2.5">
          {issue && (
            <li className="flex gap-2.5">
              <Link href={localePath(lang, `/issues/${issue.slug}`)} className="hover:text-ink">
                {issue.season[lang]}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
          )}
          <li className="flex gap-2.5">
            <Link href={localePath(lang, `/category/${product.category}`)} className="hover:text-ink">
              {dict.categories.plural[product.category]}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
          <li aria-current="page" className="text-ink">
            {name}
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-start gap-12 lg:gap-18">
        <div className="w-full max-w-[640px] min-w-0 flex-[1_1_520px]">
          <ProductGallery
            product={product}
            alt={name}
            pendingLabel={t.photoPending}
            zoomHint={t.zoomHint}
            thumbLabel={t.gallery}
          />
        </div>

        <div className="min-w-0 flex-[1_1_380px] lg:pt-3">
          <Reveal>
            <p className="mb-4.5 text-xs tracking-[0.32em] text-antique uppercase">
              {dict.categories.singular[product.category]}
              {issue ? ` · ${fill(dict.hero.issue, { n: issue.number })}` : ""}
            </p>
            <h1 className="font-display text-6xl leading-[0.95] font-light text-ink md:text-[88px]">{name}</h1>
            <p dir="ltr" className="mt-3.5 text-[13px] tracking-[0.2em] text-steel rtl:text-end">
              {product.code}
            </p>
            {product.description && (
              <p className="mt-8 max-w-md text-base leading-[1.7] text-steel">{product.description[lang]}</p>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="mt-10 grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] border-b border-hairline text-sm">
              {specs.map((spec) => (
                <div key={spec.label} className="contents">
                  <dt className="border-t border-hairline py-4 text-steel">{spec.label}</dt>
                  <dd className="border-t border-hairline py-4 text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.2} className="mt-10">
            <div className="flex flex-wrap gap-3.5">
              <a
                href={whatsappLink(question)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 flex-[1_1_220px] items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-sm font-semibold tracking-[0.06em] text-tile transition-colors hover:bg-ink/85"
              >
                <ChatIcon />
                {t.askWhatsApp}
              </a>
              {site.email && (
                <a
                  href={mailtoLink(fill(t.emailSubject, { code: product.code }), question)}
                  className="flex min-h-14 flex-[1_1_160px] items-center justify-center rounded-full border border-ink px-6 text-sm tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-tile"
                >
                  {t.sendEmail}
                </a>
              )}
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-steel">{t.priceNote}</p>
          </Reveal>
        </div>
      </div>

      {related.length > 0 && issue && (
        <section aria-labelledby="related-title" className="mt-32 border-t border-hairline pt-18">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <h2 id="related-title" className="font-display text-4xl font-light text-ink md:text-5xl">
              {t.sameIssue}
            </h2>
            <Link
              href={localePath(lang, `/issues/${issue.slug}`)}
              className="flex items-center gap-2 text-[13px] tracking-[0.1em] text-antique hover:text-ink"
            >
              {t.fullCollection}
              <ArrowIcon size={14} />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal as="li" key={item.code} delay={index * 0.08}>
                <ProductCard product={item} locale={lang} dict={dict} sizes="(min-width: 1024px) 300px, 50vw" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
