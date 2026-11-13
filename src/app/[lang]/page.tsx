import Link from "next/link";
import { notFound } from "next/navigation";
import { JewelryArt } from "@/components/brand";
import { ArrowIcon, ChatIcon, DownloadIcon } from "@/components/icons";
import { IssueCover } from "@/components/issue-cover";
import { CoverParallax, Reveal, RevealWords } from "@/components/motion";
import { ProductCard, productDisplayName } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import {
  categorySlugs,
  getCurrentIssue,
  getIssueProducts,
  getIssues,
  getProductByCode,
  getProducts,
} from "@/lib/catalog";
import { localePath, site } from "@/lib/site";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const [issue, issues, allProducts] = await Promise.all([getCurrentIssue(), getIssues(), getProducts()]);
  if (!issue) notFound();
  const [issueProducts, cover] = await Promise.all([
    getIssueProducts(issue.slug),
    getProductByCode(issue.coverProductCode),
  ]);
  const featured = issueProducts.filter((product) => product.featured).slice(0, 3);
  const [lead, ...supporting] = featured;

  return (
    <>
      {/* Issue cover */}
      <section className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-12 px-5 pt-10 pb-24 md:gap-16 md:px-10 md:pt-20 md:pb-32">
        <div className="min-w-0 flex-[1_1_480px]">
          <Reveal>
            <p className="mb-7 text-xs tracking-[0.32em] text-antique uppercase">
              {fill(dict.hero.issue, { n: issue.number })} · {issue.season[lang]}
            </p>
          </Reveal>
          <h1 className="font-display text-[clamp(96px,15vw,220px)] leading-[0.85] font-light tracking-[-0.02em] text-ink">
            <RevealWords text={issue.collectionName[lang]} />
          </h1>
          <Reveal delay={0.25}>
            <p className="mt-9 max-w-md text-lg leading-relaxed text-steel">{issue.intro[lang]}</p>
            <div className="mt-12 flex flex-wrap items-center gap-7">
              <Link
                href={localePath(lang, `/issues/${issue.slug}`)}
                className="inline-flex min-h-13 items-center gap-3 rounded-full bg-ink px-7.5 text-sm font-semibold tracking-[0.06em] text-tile transition-colors hover:bg-ink/85"
              >
                {dict.hero.discover}
                <ArrowIcon />
              </Link>
              {issue.pdfUrl && (
                <a
                  href={issue.pdfUrl}
                  className="inline-flex min-h-11 items-center gap-2.5 border-b border-hairline text-sm tracking-[0.06em] text-ink hover:border-ink hover:text-ink"
                >
                  <DownloadIcon />
                  {dict.hero.pdfCatalog}
                </a>
              )}
            </div>
          </Reveal>
        </div>
        {cover && (
          <CoverParallax className="w-full min-w-0 flex-[1_1_400px] md:max-w-[540px]">
            <Link href={localePath(lang, `/product/${cover.code.toLowerCase()}`)} className="relative block">
              <ProductVisual
                product={cover}
                alt={productDisplayName(cover, dict)}
                sizes="(min-width: 1024px) 540px, 100vw"
                priority
                className="shadow-[0_30px_80px_-40px_rgba(30,35,40,0.3)]"
                artClassName="w-[66%]"
              />
              <span dir="ltr" className="absolute end-5 bottom-5 text-[11px] tracking-[0.14em] text-steel">
                {cover.code} · {productDisplayName(cover, dict)}
              </span>
            </Link>
          </CoverParallax>
        )}
        <div className="hidden flex-[1_1_100%] items-center gap-4 text-[11px] tracking-[0.3em] text-steel uppercase md:flex">
          <span className="block h-px w-14 bg-hairline" />
          {dict.hero.scroll}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" aria-labelledby="categories-title" className="scroll-mt-24 border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-30">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <h2 id="categories-title" className="font-display text-5xl leading-none font-light text-ink md:text-[64px]">
              <RevealWords text={dict.categories.title} />
            </h2>
            <Reveal>
              <p className="max-w-sm text-[15px] leading-relaxed text-steel">{dict.categories.intro}</p>
            </Reveal>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {categorySlugs.map((slug, index) => {
              const count = allProducts.filter((product) => product.category === slug).length;
              return (
                <Reveal as="li" key={slug} delay={index * 0.08}>
                  <Link href={localePath(lang, `/category/${slug}`)} className="group flex flex-col gap-4.5">
                    <div className="tile flex aspect-[4/5] items-center justify-center transition-transform duration-700 ease-soft group-hover:-translate-y-1.5">
                      <JewelryArt category={slug} className="tile-zoom w-[72%]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-[28px] leading-tight text-ink">
                        {dict.categories.plural[slug]}
                      </span>
                      <span className="flex items-center gap-2 text-xs tracking-[0.12em] text-antique">
                        {fill(dict.categories.count, { n: count })}
                        <ArrowIcon size={14} className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Editorial spread */}
      {lead && (
        <section aria-labelledby="editorial-title" className="bg-fog-deep text-ink">
          <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-30">
            <Reveal>
              <p className="mb-4 text-xs tracking-[0.32em] text-antique uppercase">{dict.editorial.eyebrow}</p>
            </Reveal>
            <h2 id="editorial-title" className="font-display mb-16 max-w-3xl text-5xl leading-[1.02] font-light md:text-[64px]">
              <RevealWords text={dict.editorial.title} />
            </h2>
            <div className="flex flex-wrap items-start gap-10">
              <Reveal className="min-w-0 flex-[7_1_440px]">
                <ProductCard product={lead} locale={lang} dict={dict} size="lg" sizes="(min-width: 1024px) 700px, 100vw" />
              </Reveal>
              <div className="flex min-w-0 flex-[5_1_340px] flex-col gap-10 md:pt-28">
                <Reveal>
                  <p className="max-w-md text-[17px] leading-[1.7] text-steel">{dict.editorial.body}</p>
                </Reveal>
                <div className="grid grid-cols-2 gap-6">
                  {supporting.map((product, index) => (
                    <Reveal key={product.code} delay={0.1 * (index + 1)}>
                      <ProductCard product={product} locale={lang} dict={dict} sizes="(min-width: 1024px) 260px, 50vw" />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Wholesale contact band: the one dark section, typography only */}
      <section id="wholesale" aria-labelledby="wholesale-title" className="bg-band text-frost">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-12 px-5 py-24 md:px-10 md:py-28">
          <div className="min-w-0 flex-[1_1_520px]">
            <Reveal>
              <p className="mb-4.5 text-xs tracking-[0.32em] text-champagne uppercase">{dict.wholesale.eyebrow}</p>
            </Reveal>
            <h2 id="wholesale-title" className="font-display max-w-2xl text-4xl leading-[1.05] font-light md:text-[56px]">
              <RevealWords text={dict.wholesale.title} />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-lg text-base leading-[1.7] text-band-muted">{dict.wholesale.body}</p>
            </Reveal>
          </div>
          <Reveal delay={0.25} className="flex flex-wrap gap-3.5">
            <a
              href={`https://wa.me/${site.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13.5 items-center gap-2.5 rounded-full bg-frost px-7 text-sm font-semibold tracking-[0.04em] text-band transition-colors hover:bg-tile"
            >
              <ChatIcon size={18} />
              WhatsApp
            </a>
            {site.telegramUsername && (
              <a
                href={`https://t.me/${site.telegramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13.5 items-center rounded-full border border-frost/30 px-7 text-sm tracking-[0.04em] transition-colors hover:border-frost"
              >
                Telegram
              </a>
            )}
            {site.email && (
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-13.5 items-center rounded-full border border-frost/30 px-7 text-sm tracking-[0.04em] transition-colors hover:border-frost"
              >
                {dict.wholesale.email}
              </a>
            )}
          </Reveal>
        </div>
      </section>

      {/* Issue archive */}
      <section aria-labelledby="issues-title">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-30">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <h2 id="issues-title" className="font-display text-5xl leading-none font-light text-ink md:text-[64px]">
              <RevealWords text={dict.issues.title} />
            </h2>
            <p className="text-[15px] text-steel">{dict.issues.intro}</p>
          </div>
          <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {issues.map((item, index) => (
              <Reveal as="li" key={item.slug} delay={index * 0.08}>
                <IssueCover issue={item} current={index === 0} locale={lang} dict={dict} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
