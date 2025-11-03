import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Failed to sign out:", error);
        return NextResponse.json(
            { error: "Failed to sign out" },
            { status: 500 },
        );
    }

    return NextResponse.redirect(
        new URL(
            "/",
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        ),
    );
}
