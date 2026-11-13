import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
});
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope" });
const greatVibes = Great_Vibes({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-great-vibes" });

/**
 * Admin pages always read live data for the signed-in admin, so navigations into them are
 * allowed to wait for the server. Opting out here keeps Next's instant-navigation checks for the
 * public site, where they matter.
 */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Yönetim · Mişa Silver", template: "%s · Yönetim · Mişa Silver" },
  robots: { index: false, follow: false },
};

/** Separate root layout for the Turkish-only admin panel. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${manrope.variable} ${greatVibes.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
