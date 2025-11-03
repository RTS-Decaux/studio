import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let client: SupabaseClient<Database> | undefined;

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  return value;
}

export function createSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }

  return client;
}
