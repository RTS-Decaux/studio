import "server-only";

import { type CookieOptions, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Database } from "./types";

function getSupabaseEnvVars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
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
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvVars();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvVars();
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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

/**
 * Get the current user session from Supabase Auth
 * Returns null if no session exists
 * 
 * @deprecated Use getUser() instead for better security
 * This method reads directly from cookies without server verification
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to get session:", error);
    return null;
  }

  return session;
}

/**
 * Get the current authenticated user from Supabase Auth
 * Returns null if not authenticated
 */
export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error);
    return null;
  }

  return user;
}
