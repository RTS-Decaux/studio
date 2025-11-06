import { NextResponse } from "next/server";
import { deleteAsset, getAssetById } from "@/lib/studio/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/studio/assets/bulk-delete
 * Delete multiple assets at once
 */
export async function POST(request: Request) {
  try {
    const { getUser } = await import("@/lib/supabase/server");
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assetIds } = body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "Invalid asset IDs" }, { status: 400 });
    }

    // Validate all assets exist and belong to user
    const assets = await Promise.all(assetIds.map((id) => getAssetById(id)));

    const notFound = assets.filter((a) => !a);
    if (notFound.length > 0) {
      return NextResponse.json(
        { error: "Some assets not found" },
        { status: 404 }
      );
    }

    const forbidden = assets.filter((a) => a && a.userId !== user.id);
    if (forbidden.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete assets owned by other users" },
        { status: 403 }
      );
    }

    // Delete all assets
    const results = await Promise.allSettled(
      assetIds.map((id) => deleteAsset(id))
    );

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      return NextResponse.json(
        {
          success: false,
          deleted: assetIds.length - failed.length,
          failed: failed.length,
        },
        { status: 207 } // Multi-Status
      );
    }

    return NextResponse.json({
      success: true,
      deleted: assetIds.length,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete assets" },
      { status: 500 }
    );
  }
}
