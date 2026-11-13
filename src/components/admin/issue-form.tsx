"use client";

import { useActionState } from "react";
import { saveIssue, type FormState } from "@/lib/admin/actions";
import type { IssueRow } from "@/lib/catalog/db";
import { LocalizedFields } from "./localized-fields";
import { Card, Checkbox, Field, Select, TextInput, primaryButton } from "./ui";

export function IssueForm({
  issue,
  productCodes,
  nextNumber,
  today,
}: {
  issue?: IssueRow;
  productCodes: { code: string; label: string }[];
  nextNumber: number;
  /** Today's date (YYYY-MM-DD), computed on the server at request time. */
  today: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveIssue, {});
  return (
    <form action={action} className="flex flex-col gap-6">
      {issue && <input type="hidden" name="id" value={issue.id} />}
      <Card title="Sezon bilgileri">
        <div className="grid gap-5 md:grid-cols-2">
          <LocalizedFields
            name="collection_name"
            label="Koleksiyon adı"
            defaultValue={issue?.collection_name}
            required
            hint="Kapakta büyük yazılan ad, ör. Ayaz."
          />
          <LocalizedFields
            name="season"
            label="Sezon"
            defaultValue={issue?.season}
            required
            hint="ör. Kış 2026 / Winter 2026"
          />
          <Field label="Sayı numarası">
            <TextInput name="number" type="number" min={1} defaultValue={issue?.number ?? nextNumber} required />
          </Field>
          <Field label="Kısa ad (adres)" hint="Sayfa adresinde kullanılır, ör. kis-2026. Sonradan değiştirmeyin.">
            <TextInput
              name="slug"
              defaultValue={issue?.slug ?? ""}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="kis-2026"
              required
            />
          </Field>
          <Field label="Yayın tarihi" hint="En yeni tarihli yayındaki sezon ana sayfada kapak olur.">
            <TextInput
              name="published_at"
              type="date"
              defaultValue={issue?.published_at ?? today}
            />
          </Field>
          <Field label="Kapak ürünü" hint="Ana sayfada büyük gösterilecek ürün.">
            <Select name="cover_product_code" defaultValue={issue?.cover_product_code ?? ""}>
              <option value="">Seçilmedi</option>
              {productCodes.map((product) => (
                <option key={product.code} value={product.code}>
                  {product.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <LocalizedFields
              name="intro"
              label="Kısa tanıtım"
              defaultValue={issue?.intro}
              multiline
              hint="Kapakta başlığın altında görünen bir iki cümle."
            />
          </div>
          <Field label="PDF katalog adresi (isteğe bağlı)" className="md:col-span-2">
            <TextInput name="pdf_url" type="url" defaultValue={issue?.pdf_url ?? ""} placeholder="https://…" />
          </Field>
          <Checkbox name="is_published" label="Yayında (sitede görünsün)" defaultChecked={issue?.is_published ?? false} />
        </div>
      </Card>
      <FormFooter state={state} pending={pending} />
    </form>
  );
}

export function FormFooter({ state, pending }: { state: FormState; pending: boolean }) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-tile/95 px-5 py-3 backdrop-blur">
      <p role="status" aria-live="polite" className="text-sm">
        {state.error ? (
          <span className="text-red-800">{state.error}</span>
        ) : state.saved && !pending ? (
          <span className="text-emerald-800">Kaydedildi. Site güncellendi.</span>
        ) : (
          <span className="text-steel">Değişiklikler kaydedince sitede görünür.</span>
        )}
      </p>
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}
