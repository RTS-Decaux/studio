import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST handler for signing out users
 * Preferred method for programmatic sign-outs
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Failed to sign out:", error);
      return NextResponse.json(
        { error: "Failed to sign out" },
        {
          status: 500,
        }
      );
    }

    // Return success response instead of redirect for API calls
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for direct browser navigation to sign out
 * Provides backward compatibility for link-based sign outs
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Failed to sign out:", error);
      // Redirect to home with error parameter
      return NextResponse.redirect(
        new URL(
          "/?error=signout_failed",
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        )
      );
    }

    // Successful sign out - redirect to home
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    return NextResponse.redirect(
      new URL(
        "/?error=unexpected_error",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      )
    );
  }
}
