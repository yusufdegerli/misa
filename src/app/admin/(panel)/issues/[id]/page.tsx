import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { IssueForm } from "@/components/admin/issue-form";
import { todayInIstanbul } from "@/lib/admin/dates";
import { deleteIssue } from "@/lib/admin/actions";
import { getIssueRow, listProducts } from "@/lib/admin/data";

// Reads live admin data on every visit; navigation may wait for it (see app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Sezonu düzenle" };

export default async function EditIssuePage({ params }: PageProps<"/admin/issues/[id]">) {
  const { id } = await params;
  const [issue, products] = await Promise.all([getIssueRow(id), listProducts()]);
  if (!issue) notFound();
  const inIssue = products.filter((product) => product.issue_id === issue.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-steel hover:text-ink">
        ← Genel bakış
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-steel">Sayı {issue.number}</p>
          <h1 className="font-display text-5xl font-light text-ink">{issue.collection_name.tr}</h1>
        </div>
        <div className="flex gap-3">
          {issue.is_published && (
            <a href={`/tr/issues/${issue.slug}`} target="_blank" rel="noopener noreferrer" className="min-h-11 content-center text-sm text-steel hover:text-ink">
              Sitede gör ↗
            </a>
          )}
          <DeleteButton
            label="Sezonu sil"
            confirmText={`"${issue.collection_name.tr}" sezonu silinsin mi? Ürünler silinmez, sezonsuz kalır.`}
            action={deleteIssue.bind(null, issue.id)}
          />
        </div>
      </div>
      <IssueForm
        today={todayInIstanbul()}
        issue={issue}
        nextNumber={issue.number}
        productCodes={inIssue.map((product) => ({ code: product.code, label: `${product.code} · ${product.name}` }))}
      />
    </div>
  );
}
