import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

/**
 * Cookie-free client with the publishable key. Row level security limits it to published
 * content, which is what the public site shows. Safe to use inside cached functions.
 */
export function createPublicClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
