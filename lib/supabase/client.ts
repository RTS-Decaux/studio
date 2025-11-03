import { createSupabaseServerClient } from "./server";
import { createSupabaseBrowserClient } from "./browser";

export const supabaseServerClient = createSupabaseServerClient;
export const supabaseBrowserClient = createSupabaseBrowserClient;
