import { Logo } from "@/components/brand";
import { localeNames, locales } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/lib/site";

export function SiteFooter({ footer }: { footer: Dictionary["footer"] }) {
  const contacts = [
    site.whatsappNumber && { label: "WhatsApp", href: `https://wa.me/${site.whatsappNumber}` },
    site.telegramUsername && { label: "Telegram", href: `https://t.me/${site.telegramUsername}` },
    site.email && { label: site.email, href: `mailto:${site.email}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer id="contact" className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-12 px-5 pt-18 pb-12 md:px-10">
        <div className="flex flex-[1_1_260px] flex-col items-start gap-3">
          <Logo size="lg" />
          <p className="mt-2 max-w-72 text-sm leading-relaxed text-smoke">{footer.tagline}</p>
        </div>
        <div className="flex flex-[1_1_200px] flex-col gap-3 text-sm">
          <h2 className="text-[11px] tracking-[0.24em] text-gold uppercase">{footer.contact}</h2>
          {contacts.map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-pearl hover:text-gold-light"
            >
              {contact.label}
            </a>
          ))}
          {site.address && <p className="text-smoke">{site.address}</p>}
        </div>
        <div className="flex flex-[1_1_200px] flex-col gap-3 text-sm">
          <h2 className="text-[11px] tracking-[0.24em] text-gold uppercase">{footer.language}</h2>
          <p className="leading-loose text-pearl">
            {locales.map((code, index) => (
              <span key={code} lang={code}>
                {localeNames[code]}
                {index < locales.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </div>
      </div>
      <p className="mx-auto max-w-[1280px] px-5 pb-10 text-xs text-smoke md:px-10">
        © {site.name}. {footer.rights}
      </p>
    </footer>
  );
}
