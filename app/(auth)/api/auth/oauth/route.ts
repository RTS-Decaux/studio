import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const redirectTo = searchParams.get("redirectTo") || "/";

  if (!provider || !["github", "google", "gitlab"].includes(provider)) {
    return NextResponse.json(
      { error: "Invalid OAuth provider" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as "github" | "google" | "gitlab",
    options: {
      redirectTo: `${redirectUrl}?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    console.error("OAuth sign in error:", error);
    return NextResponse.json(
      { error: "Failed to initialize OAuth" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
