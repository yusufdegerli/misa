import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/** Small, consistent form primitives for the admin panel. */

export const inputClass =
  "w-full rounded-lg border border-hairline bg-tile px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-steel/70 focus:border-ink";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs leading-relaxed text-steel">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4.5 accent-ink" />
      {label}
    </label>
  );
}

export function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-tile p-6 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-tile transition-colors hover:bg-ink/85 disabled:opacity-50";
export const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink px-5 text-sm text-ink transition-colors hover:bg-ink hover:text-tile disabled:opacity-50";
export const dangerButton =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-red-700/40 px-5 text-sm text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50";

export function Badge({ tone, children }: { tone: "live" | "draft"; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tone === "live" ? "bg-emerald-50 text-emerald-800" : "bg-fog-deep text-steel"
      }`}
    >
      {children}
    </span>
  );
}
