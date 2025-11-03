import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectUrl") || "/";
  const requestUrl = new URL(request.url);

  // Create Supabase client using the existing helper
  const supabase = await createSupabaseServerClient();

  // Check if user is already signed in (use getUser() for security)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (user && !userError) {
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
  }

  // Sign in anonymously using Supabase's native anonymous auth
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Failed to sign in anonymously:", error);
    return NextResponse.json(
      { error: "Failed to sign in as guest" },
      { status: 500 },
    );
  }

  if (!data.session) {
    return NextResponse.json(
      { error: "No session created" },
      { status: 500 },
    );
  }

  // Redirect to the desired page
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
}
