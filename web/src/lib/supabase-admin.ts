import { createClient } from "@supabase/supabase-js";

// Solo para uso server-side (rutas API/webhooks): bypassea RLS con la
// service_role key. Nunca importar desde código que corra en el browser.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
