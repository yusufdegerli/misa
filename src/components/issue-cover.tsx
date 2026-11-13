import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import type { Issue } from "@/lib/catalog";
import { localePath } from "@/lib/site";

/** An issue shown as a magazine cover on the archive shelf. */
export function IssueCover({
  issue,
  current,
  locale,
  dict,
}: {
  issue: Issue;
  current: boolean;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={localePath(locale, `/issues/${issue.slug}`)}
        className={`group flex aspect-[3/4] flex-col justify-between bg-tile p-7 transition-transform duration-700 ease-soft hover:-translate-y-1.5 ${
          current ? "border border-antique" : "border border-hairline"
        }`}
      >
        <span className={`text-[10px] tracking-[0.3em] uppercase ${current ? "text-antique" : "text-steel"}`}>
          {fill(dict.hero.issue, { n: issue.number })}
          {current ? ` · ${dict.issues.current}` : ""}
        </span>
        <span className="font-display text-[64px] leading-[0.9] font-light text-ink">
          {issue.collectionName[locale]}
        </span>
      </Link>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-ink">{issue.season[locale]}</span>
        {issue.pdfUrl ? (
          <a href={issue.pdfUrl} className="text-antique hover:text-ink">
            PDF ↓
          </a>
        ) : (
          <Link href={localePath(locale, `/issues/${issue.slug}`)} className="text-antique hover:text-ink">
            {dict.issues.view}
          </Link>
        )}
      </div>
    </div>
  );
}
