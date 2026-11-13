import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions";

/** Checks the session before rendering any admin page. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const email = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-hairline bg-fog/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" aria-label="Yönetim ana sayfası">
              <Logo size="sm" />
            </Link>
            <nav aria-label="Yönetim" className="flex gap-5 text-sm">
              <Link href="/admin" className="text-ink hover:text-antique">
                Genel bakış
              </Link>
              <Link href="/admin/products/new" className="text-ink hover:text-antique">
                Yeni ürün
              </Link>
              <Link href="/admin/issues/new" className="text-ink hover:text-antique">
                Yeni sezon
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/tr" target="_blank" rel="noopener noreferrer" className="text-steel hover:text-ink">
              Siteyi aç ↗
            </a>
            <span className="hidden text-steel md:inline">{email}</span>
            <form action={signOut}>
              <button type="submit" className="min-h-11 text-ink underline-offset-4 hover:underline">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">{children}</main>
    </>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-10 text-sm text-steel">Yükleniyor…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
