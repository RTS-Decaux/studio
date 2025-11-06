import { NextResponse } from "next/server";
import { createAsset } from "@/lib/studio/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/studio/assets/upload
 * Upload asset file to Supabase Storage and create asset record
 */
export async function POST(request: Request) {
  try {
    const { getUser } = await import("@/lib/supabase/server");
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const projectId = formData.get("projectId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type || !["image", "video", "audio"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid asset type" },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const supabase = await createSupabaseServerClient();
    const bucket = "studio-assets"; // Make sure this bucket exists in Supabase

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user.id}/${type}s/${timestamp}-${sanitizedFileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Store the storage path (we'll generate signed URLs on-demand)
    // Note: For private buckets, we store the path and generate signed URLs when needed
    const storagePath = filePath;

    // We'll store the path in metadata and generate signed URLs dynamically
    // This is more secure than storing public URLs for sensitive content
    const fileUrl = `supabase://storage/${bucket}/${filePath}`;
    const thumbnailUrl = type === "image" ? fileUrl : null;

    // Extract metadata
    const metadata: Record<string, any> = {
      size: file.size,
      format: file.type.split("/")[1] || file.name.split(".").pop(),
      originalName: file.name,
      storagePath: filePath,
      bucket,
    };

    // Try to extract image dimensions if it's an image
    if (type === "image") {
      try {
        // For browser-side, we could use Image API but on server we'd need sharp
        // For now, we'll set dimensions to be extracted client-side or later
        // You can add sharp library for server-side dimension extraction
        metadata.width = null;
        metadata.height = null;
      } catch (e) {
        // Dimensions will be null if extraction fails
      }
    } else if (type === "video") {
      // Video metadata would require ffmpeg or similar
      // Set to null for now
      metadata.width = null;
      metadata.height = null;
      metadata.duration = null;
    }

    // Create asset record in database
    const asset = await createAsset({
      userId: user.id,
      projectId: projectId || null,
      name: file.name,
      type: type as "image" | "video" | "audio",
      url: fileUrl,
      thumbnailUrl,
      metadata,
      sourceType: "upload",
      sourceGenerationId: null,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Asset upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload asset" },
      { status: 500 }
    );
  }
}
