import "server-only";

import { cookies, headers } from "next/headers";
import {
  createServerClient,
  createMiddlewareClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function resolveEnvVar(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  return value;
}

export function getSupabaseServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const url = resolveEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = resolveEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...(options as CookieOptions | undefined) });
      },
      remove(name, options) {
        cookieStore.delete({ name, ...(options as CookieOptions | undefined) });
      },
    },
    headers,
  });
}

export function getSupabaseMiddlewareClient({
  request,
  response,
}: {
  request: NextRequest;
  response: NextResponse;
}) {
  const url = resolveEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = resolveEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createMiddlewareClient<Database>({
    req: request,
    res: response,
    supabaseUrl: url,
    supabaseKey: anonKey,
  });
}
