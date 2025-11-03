import "server-only";

import { type CookieOptions, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Database } from "./types";

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  return value;
}

type MutableCookies = {
  getAll: () => { name: string; value: string }[];
  set: (cookie: {
    name: string;
    value: string;
    options?: CookieOptions;
  }) => void;
};

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const cookieStore = await cookies();
  const mutableCookies = cookieStore as unknown as MutableCookies;

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return mutableCookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            mutableCookies.set(cookie);
          });
        },
      },
    },
  );
}

export function createSupabaseMiddlewareResponse(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            response.cookies.set(cookie);
          });
        },
      },
    },
  );

  return { supabase, response };
}
