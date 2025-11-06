import { NextResponse } from "next/server";
import { getAssetById, updateAsset } from "@/lib/studio/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/studio/assets/[id]
 * Get asset by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = await import("@/lib/supabase/server");
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const asset = await getAssetById(id);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Verify ownership
    if (asset.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Get asset error:", error);
    return NextResponse.json({ error: "Failed to get asset" }, { status: 500 });
  }
}

/**
 * PATCH /api/studio/assets/[id]
 * Update asset (name, metadata, etc.)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = await import("@/lib/supabase/server");
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const asset = await getAssetById(id);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Verify ownership
    if (asset.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, metadata } = body;

    // Validate updates
    const updates: Partial<{ name: string; metadata: any }> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (metadata !== undefined) {
      if (typeof metadata !== "object") {
        return NextResponse.json(
          { error: "Invalid metadata" },
          { status: 400 }
        );
      }
      updates.metadata = { ...asset.metadata, ...metadata };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const updatedAsset = await updateAsset(id, updates);

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/studio/assets/[id]
 * Delete asset
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = await import("@/lib/supabase/server");
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const asset = await getAssetById(id);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Verify ownership
    if (asset.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // TODO: Delete actual file from storage
    // await deleteFileFromStorage(asset.url);

    // Delete from database
    const { deleteAsset } = await import("@/lib/studio/queries");
    await deleteAsset(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
