import { NextResponse } from "next/server";
import { getSignedStorageUrl } from "@/lib/studio/signed-urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/studio/assets/signed-url
 * Generate signed URLs for private storage assets
 */
export async function POST(request: Request) {
  try {
    const { getUser } = await import("@/lib/supabase/server");
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, urls, transform, expiresIn } = body;

    // Single URL
    if (url) {
      const signedUrl = await getSignedStorageUrl(url, {
        expiresIn: expiresIn || 3600,
        transform,
      });

      if (!signedUrl) {
        return NextResponse.json(
          { error: "Failed to generate signed URL" },
          { status: 500 }
        );
      }

      return NextResponse.json({ signedUrl });
    }

    // Multiple URLs
    if (urls && Array.isArray(urls)) {
      const signedUrls = await Promise.all(
        urls.map((u: string) =>
          getSignedStorageUrl(u, {
            expiresIn: expiresIn || 3600,
            transform,
          })
        )
      );

      return NextResponse.json({ signedUrls });
    }

    return NextResponse.json(
      { error: "Missing 'url' or 'urls' parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Signed URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
