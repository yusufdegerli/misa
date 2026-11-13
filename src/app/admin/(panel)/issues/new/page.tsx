import type { Metadata } from "next";
import Link from "next/link";
import { IssueForm } from "@/components/admin/issue-form";
import { todayInIstanbul } from "@/lib/admin/dates";
import { listIssues, listProducts } from "@/lib/admin/data";

// Reads live admin data on every visit; navigation may wait for it (see app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Yeni sezon" };

export default async function NewIssuePage() {
  const [issues, products] = await Promise.all([listIssues(), listProducts()]);
  const nextNumber = Math.max(0, ...issues.map((issue) => issue.number)) + 1;
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-steel hover:text-ink">
        ← Genel bakış
      </Link>
      <h1 className="font-display text-5xl font-light text-ink">Yeni sezon</h1>
      <IssueForm
        today={todayInIstanbul()}
        nextNumber={nextNumber}
        productCodes={products.map((product) => ({ code: product.code, label: `${product.code} · ${product.name}` }))}
      />
    </div>
  );
}
