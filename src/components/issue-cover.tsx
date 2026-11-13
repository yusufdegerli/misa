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
        className={`group shine flex aspect-[3/4] flex-col justify-between bg-gradient-to-b from-[#1c1a17] to-[#0b0a09] p-7 transition-transform duration-700 ease-soft hover:-translate-y-1.5 ${
          current ? "border border-gold" : "border border-pearl/15"
        }`}
      >
        <span className={`text-[10px] tracking-[0.3em] uppercase ${current ? "text-gold" : "text-smoke"}`}>
          {fill(dict.hero.issue, { n: issue.number })}
          {current ? ` · ${dict.issues.current}` : ""}
        </span>
        <span className="font-display text-[64px] leading-[0.9] font-light text-pearl-strong">
          {issue.collectionName[locale]}
        </span>
      </Link>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-pearl-strong">{issue.season[locale]}</span>
        {issue.pdfUrl ? (
          <a href={issue.pdfUrl} className="text-gold hover:text-gold-light">
            PDF ↓
          </a>
        ) : (
          <Link href={localePath(locale, `/issues/${issue.slug}`)} className="text-gold hover:text-gold-light">
            {dict.issues.view}
          </Link>
        )}
      </div>
    </div>
  );
}
