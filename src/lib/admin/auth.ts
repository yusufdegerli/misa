import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

/** Emails allowed into the admin panel, from ADMIN_EMAILS (comma separated). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | undefined | null): boolean {
  return Boolean(email) && adminEmails().includes(email!.toLowerCase());
}

/**
 * Returns the signed-in admin's email or sends the visitor to the login page.
 * Every admin page and every admin server action calls this first.
 */
export async function requireAdmin(): Promise<string> {
  // Admin pages are always rendered per request. Cookies alone are not enough: Next includes
  // session-only data in the prefetched shell, and the Supabase client reads the clock.
  await connection();
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!isAllowedAdmin(email)) redirect("/admin/login");
  return email!;
}
