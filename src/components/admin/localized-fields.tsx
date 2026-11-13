"use client";

import { useState } from "react";
import { localeNames, locales, type Locale, type Localized } from "@/i18n/config";
import { inputClass } from "./ui";

/**
 * One field in five languages, shown as tabs. Turkish is required; an empty language falls back
 * to Turkish on the site. All inputs stay in the form, only the active one is visible.
 */
export function LocalizedFields({
  name,
  label,
  defaultValue,
  multiline,
  required,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: Partial<Localized> | null;
  multiline?: boolean;
  required?: boolean;
  hint?: string;
}) {
  const [active, setActive] = useState<Locale>("tr");
  const [filled, setFilled] = useState<Partial<Record<Locale, boolean>>>(() =>
    Object.fromEntries(locales.map((code) => [code, Boolean(defaultValue?.[code])])),
  );

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[13px] font-medium text-ink">{label}</legend>
      <div role="tablist" aria-label={`${label} dili`} className="flex flex-wrap gap-1">
        {locales.map((code) => (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={active === code}
            onClick={() => setActive(code)}
            className={`min-h-9 rounded-full px-3 text-xs transition-colors ${
              active === code ? "bg-ink text-tile" : "text-steel hover:bg-fog-deep"
            }`}
          >
            {code.toUpperCase()}
            {code !== "tr" && !filled[code] && <span className="ms-1 opacity-60">·</span>}
          </button>
        ))}
      </div>
      {locales.map((code) => {
        const props = {
          name: `${name}.${code}`,
          defaultValue: defaultValue?.[code] ?? "",
          required: required && code === "tr",
          lang: code,
          dir: code === "ar" ? ("rtl" as const) : ("ltr" as const),
          "aria-label": `${label} (${localeNames[code]})`,
          placeholder: code === "tr" ? "" : "Boş bırakılırsa Türkçe metin gösterilir",
          onChange: (event: { target: { value: string } }) =>
            setFilled((prev) => ({ ...prev, [code]: Boolean(event.target.value.trim()) })),
          className: `${inputClass} ${active === code ? "" : "hidden"}`,
        };
        return multiline ? <textarea key={code} rows={3} {...props} /> : <input key={code} {...props} />;
      })}
      {hint && <span className="text-xs leading-relaxed text-steel">{hint}</span>}
    </fieldset>
  );
}
