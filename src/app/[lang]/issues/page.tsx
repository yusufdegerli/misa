import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IssueCover } from "@/components/issue-cover";
import { Reveal, RevealWords } from "@/components/motion";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getIssues } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/[lang]/issues">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).issues.title };
}

export default async function IssuesPage({ params }: PageProps<"/[lang]/issues">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const issues = await getIssues();

  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-12 pb-28 md:px-10 md:pt-20">
      <header className="mb-16 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <h1 className="font-display text-[clamp(64px,10vw,128px)] leading-[0.9] font-light text-pearl-strong">
          <RevealWords text={dict.issues.title} />
        </h1>
        <p className="max-w-sm text-[15px] text-mist">{dict.issues.intro}</p>
      </header>
      <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {issues.map((issue, index) => (
          <Reveal as="li" key={issue.slug} delay={index * 0.08}>
            <IssueCover issue={issue} current={index === 0} locale={lang} dict={dict} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
