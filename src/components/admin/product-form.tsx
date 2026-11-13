"use client";

import { useActionState } from "react";
import tr from "@/i18n/dictionaries/tr";
import { saveProduct, type FormState } from "@/lib/admin/actions";
import type { IssueRow, ProductRow } from "@/lib/catalog/db";
import { categorySlugs } from "@/lib/catalog/types";
import { FormFooter } from "./issue-form";
import { LocalizedFields } from "./localized-fields";
import { Card, Checkbox, Field, Select, TextInput } from "./ui";

// The admin panel is Turkish only, so only the Turkish dictionary is bundled.

export function ProductForm({ product, issues }: { product?: ProductRow; issues: IssueRow[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  return (
    <form action={action} className="flex flex-col gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <Card title="Ürün bilgileri">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Ürün kodu" hint="ör. MS-1042. Müşteriler sipariş verirken bu kodu kullanır.">
            <TextInput
              name="code"
              defaultValue={product?.code ?? ""}
              placeholder="MS-1042"
              autoCapitalize="characters"
              required
            />
          </Field>
          <Field label="Ürün adı" hint="Özel ad; tür kelimesi otomatik eklenir (Seren → Seren Yüzük).">
            <TextInput name="name" defaultValue={product?.name ?? ""} placeholder="Seren" required />
          </Field>
          <Field label="Kategori">
            <Select name="category" defaultValue={product?.category ?? ""} required>
              <option value="" disabled>
                Seçin
              </option>
              {categorySlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {tr.categories.plural[slug]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sezon">
            <Select name="issue_id" defaultValue={product?.issue_id ?? issues[0]?.id ?? ""}>
              <option value="">Sezonsuz</option>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  Sayı {issue.number} · {issue.collection_name.tr} ({issue.season.tr})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ağırlık (gram)">
            <TextInput
              name="weight_grams"
              inputMode="decimal"
              defaultValue={product ? String(product.weight_grams).replace(".", ",") : ""}
              placeholder="4,2"
              required
            />
          </Field>
          <Field label="Minimum sipariş (adet)">
            <TextInput name="min_order" type="number" min={1} defaultValue={product?.min_order ?? 12} required />
          </Field>
          <Field label="Ölçüler (isteğe bağlı)" hint="ör. US 5–10 veya 45 + 5 cm">
            <TextInput name="sizes" defaultValue={product?.sizes ?? ""} />
          </Field>
          <Field label="Sıra" hint="Küçük sayı önce gösterilir.">
            <TextInput name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} />
          </Field>
          <div className="md:col-span-2">
            <LocalizedFields
              name="description"
              label="Açıklama (isteğe bağlı)"
              defaultValue={product?.description}
              multiline
              hint="Bir iki cümle. Diğer dilleri boş bırakırsanız Türkçe gösterilir."
            />
          </div>
          <div className="flex flex-wrap gap-x-8 md:col-span-2">
            <Checkbox name="is_published" label="Yayında (sitede görünsün)" defaultChecked={product?.is_published ?? false} />
            <Checkbox name="featured" label="Öne çıkan (ana sayfada editör seçimi)" defaultChecked={product?.featured ?? false} />
          </div>
        </div>
      </Card>
      <FormFooter state={state} pending={pending} />
    </form>
  );
}
