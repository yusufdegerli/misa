import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, locales } from "@/i18n/config";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

const LOCALE_COOKIE = "NEXT_LOCALE";

function preferredLocale(request: NextRequest): string {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && (locales as readonly string[]).includes(saved)) return saved;

  const headers = { "accept-language": request.headers.get("accept-language") ?? "" };
  const languages = new Negotiator({ headers }).languages();
  try {
    return match(languages, [...locales], defaultLocale);
  } catch {
    return defaultLocale;
  }
}

/** Keeps the admin's Supabase session cookies fresh on every admin request. */
async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseUrl || !supabasePublishableKey) return response;
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

/**
 * Admin paths: refresh the session. Everything else: send visitors without a language prefix
 * to their preferred language.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return refreshAdminSession(request);

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes and any path with a file extension (images, icons, robots.txt).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
