import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DownloadIcon } from "@/components/icons";
import { GridPageSkeleton } from "@/components/skeletons";
import { Reveal, RevealWords } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { categorySlugs, getIssue, getIssueProducts, getIssues } from "@/lib/catalog";

export async function generateStaticParams() {
  const issues = await getIssues();
  return locales.flatMap((lang) => issues.map((issue) => ({ lang, slug: issue.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/issues/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const issue = await getIssue(slug);
  if (!isLocale(lang) || !issue) return {};
  return { title: `${issue.collectionName[lang]} — ${issue.season[lang]}`, description: issue.intro[lang] };
}

export default function IssuePage({ params }: PageProps<"/[lang]/issues/[slug]">) {
  return (
    <Suspense fallback={<GridPageSkeleton />}>
      <IssueContent params={params} />
    </Suspense>
  );
}

async function IssueContent({ params }: Pick<PageProps<"/[lang]/issues/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const issue = await getIssue(slug);
  if (!issue) notFound();
  const dict = getDictionary(lang);
  const products = await getIssueProducts(issue.slug);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-12 pb-28 md:px-10 md:pt-20">
      <header className="mb-20 border-b border-hairline pb-14">
        <Reveal>
          <p className="mb-6 text-xs tracking-[0.32em] text-antique uppercase">
            {fill(dict.hero.issue, { n: issue.number })} · {issue.season[lang]}
          </p>
        </Reveal>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <h1 className="font-display text-[clamp(88px,14vw,200px)] leading-[0.85] font-light text-ink">
            <RevealWords text={issue.collectionName[lang]} />
          </h1>
          <Reveal className="max-w-md">
            <p className="text-lg leading-relaxed text-steel">{issue.intro[lang]}</p>
            {issue.pdfUrl && (
              <a href={issue.pdfUrl} className="mt-6 inline-flex min-h-11 items-center gap-2.5 text-sm text-antique hover:text-ink">
                <DownloadIcon />
                {dict.hero.pdfCatalog}
              </a>
            )}
          </Reveal>
        </div>
      </header>

      {categorySlugs.map((category) => {
        const inCategory = products.filter((product) => product.category === category);
        if (inCategory.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`cat-${category}`} className="mb-24">
            <h2 id={`cat-${category}`} className="font-display mb-10 text-4xl font-light text-ink md:text-5xl">
              {dict.categories.plural[category]}
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {inCategory.map((product, index) => (
                <Reveal as="li" key={product.code} delay={(index % 4) * 0.08}>
                  <ProductCard product={product} locale={lang} dict={dict} sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw" />
                </Reveal>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
