import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const convertSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!user.is_anonymous) {
    return NextResponse.json(
      { error: "User is not anonymous" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = convertSchema.parse(body);

    // Update user to permanent account
    const { error: updateError } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (updateError) {
      console.error("Failed to convert anonymous user:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    console.error("Failed to convert anonymous user:", error);
    return NextResponse.json(
      { error: "Failed to convert account" },
      { status: 500 }
    );
  }
}
