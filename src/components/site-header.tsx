"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { QuoteButton, type QuoteStrings } from "@/components/quote/quote-drawer";
import { localeNames, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/site";

interface SiteHeaderProps {
  locale: Locale;
  nav: Dictionary["nav"];
  a11y: Dictionary["a11y"];
  quote: QuoteStrings;
  currentIssueSlug?: string;
}

/** Same page in another language: swaps the first path segment. */
function switchLocale(pathname: string, target: Locale) {
  const parts = pathname.split("/");
  parts[1] = target;
  return parts.join("/") || `/${target}`;
}

function rememberLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({ locale, className = "" }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={`flex gap-2.5 text-[11px] tracking-[0.12em] ${className}`}>
      {locales.map((code) => (
        <Link
          key={code}
          href={switchLocale(pathname, code)}
          hrefLang={code}
          lang={code}
          aria-label={localeNames[code]}
          aria-current={code === locale ? "true" : undefined}
          onClick={() => rememberLocale(code)}
          className={`flex min-h-8 items-center ${code === locale ? "text-gold-light" : "text-smoke hover:text-pearl"}`}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

export function SiteHeader({ locale, nav, a11y, quote, currentIssueSlug }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const links = [
    currentIssueSlug && { href: localePath(locale, `/issues/${currentIssueSlug}`), label: nav.collection },
    { href: localePath(locale, "/#categories"), label: nav.categories },
    { href: localePath(locale, "/issues"), label: nav.issues },
    { href: "#contact", label: nav.contact },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-500 ${
        scrolled || menuOpen ? "border-line bg-ink/85 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label={a11y.mainMenu}
        className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-5 py-3.5 md:px-10 md:py-4.5"
      >
        <Link href={localePath(locale)} aria-label={a11y.home} className="shrink-0">
          <span className="md:hidden">
            <Logo size="sm" />
          </span>
          <span className="hidden md:inline">
            <Logo />
          </span>
        </Link>

        <div className="hidden items-center gap-9 text-[13px] tracking-[0.08em] lg:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-pearl transition-colors hover:text-gold-light">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageSwitcher locale={locale} />
          <QuoteButton t={quote} />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <QuoteButton t={quote} compact />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? nav.close : nav.menu}
            className="flex size-11 items-center justify-center text-pearl"
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="border-t border-line lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="flex flex-col gap-1 overflow-hidden px-5 pt-4 pb-8">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display py-2 text-4xl font-light text-pearl-strong"
                >
                  {link.label}
                </Link>
              ))}
              <LanguageSwitcher locale={locale} className="mt-6 gap-5 text-[13px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
