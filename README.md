# Mişa Silver

Wholesale catalogue site for 925 sterling silver jewellery, presented as a seasonal magazine.
Five languages (tr, en, ru, ar, hu), Arabic right-to-left. No prices or checkout: visitors ask about
pieces via WhatsApp, Telegram or email, with the product code filled in.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Visitors without a language in the URL are redirected by `src/proxy.ts`.

Contact details are read from environment variables; copy `.env.example` to `.env.local` and fill them in.

## Layout

- `src/app/[lang]/` pages: home (current issue), `issues`, `issues/[slug]`, `category/[slug]`, `product/[slug]`
- `src/i18n/` languages, dictionaries (Turkish is the source; others must match its shape) and formatting
- `src/lib/catalog/` catalogue API used by every page; currently backed by `sample-data.ts`
- `src/components/` header, footer, product visuals, motion helpers

## Status

- Product photos are placeholders (line drawings) until uploads exist.
- Sample products, codes and weights are not real.
- The logo is a typeset stand-in until the SVG arrives.
- Not built yet: admin panel, database and image storage, PDF catalogue generation.
