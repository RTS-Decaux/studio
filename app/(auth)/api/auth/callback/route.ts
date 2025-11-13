import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth Callback Endpoint
 *
 * ⚠️ STATUS: TEMPORARILY DISABLED - COMING SOON
 * This endpoint handles OAuth provider callbacks and is currently deactivated.
 */
export async function GET(request: Request) {
  // TODO: Remove this when OAuth is ready
  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent("OAuth authentication is coming soon")}`,
      request.url
    )
  );

  /* eslint-disable no-unreachable */
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code as string
    );
    /* eslint-enable no-unreachable */

    if (error) {
      console.error("Failed to exchange code for session:", error);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Authentication failed")}`,
          request.url
        )
      );
    }
  }

  // Redirect to the next URL or home
  return NextResponse.redirect(new URL(next, request.url));
}
