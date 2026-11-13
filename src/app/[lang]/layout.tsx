import type { Metadata, Viewport } from "next";
import { Amiri, Cormorant_Garamond, Great_Vibes, Manrope, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { SilverDefs } from "@/components/brand";
import { SmoothScroll } from "@/components/motion";
import { QuoteDrawer, type QuoteStrings } from "@/components/quote/quote-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { directionOf, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentIssue } from "@/lib/catalog";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope" });
const greatVibes = Great_Vibes({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-great-vibes" });
// Arabic families are only downloaded on pages that use them.
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", preload: false });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic", preload: false });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: { default: "Mişa Silver", template: "%s · Mişa Silver" },
    description: getDictionary(lang).meta.description,
    alternates: { languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])) },
  };
}

export const viewport: Viewport = { themeColor: "#0e0d0b" };

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const currentIssue = await getCurrentIssue();
  const quoteStrings: QuoteStrings = {
    quote: dict.quote,
    nav: dict.nav,
    categories: { singular: dict.categories.singular, productName: dict.categories.productName },
    product: { platings: dict.product.platings, pieces: dict.product.pieces },
  };

  return (
    <html
      lang={lang}
      dir={directionOf(lang)}
      className={`${cormorant.variable} ${manrope.variable} ${greatVibes.variable} ${amiri.variable} ${notoArabic.variable}`}
    >
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          {dict.a11y.skipToContent}
        </a>
        <SilverDefs />
        <SmoothScroll />
        <SiteHeader
          locale={lang}
          nav={dict.nav}
          a11y={dict.a11y}
          quote={quoteStrings}
          currentIssueSlug={currentIssue?.slug}
        />
        <main id="main">{children}</main>
        <SiteFooter footer={dict.footer} />
        <QuoteDrawer t={quoteStrings} locale={lang} />
      </body>
    </html>
  );
}
