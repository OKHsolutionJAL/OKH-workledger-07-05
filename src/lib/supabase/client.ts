import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type AppSupabaseClient = SupabaseClient<Database>;

let browserClient: AppSupabaseClient | null = null;

export class SupabaseConfigError extends Error {
  constructor() {
    super("Configuração do Supabase incompleta. Verifique NEXT_PUBLIC_SUPABASE_URL e a chave pública do Supabase.");
    this.name = "SupabaseConfigError";
  }
}

export function getSupabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new SupabaseConfigError();
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey) as AppSupabaseClient;
  }

  return browserClient;
}
