import "server-only";

import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, getSession } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET_ID = "uploads";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

function sanitizeFilename(originalName: string) {
  const name = originalName.trim().toLowerCase();
  const replaced = name.replace(/[^a-z0-9.\-_]/g, "-");
  return replaced.replace(/-+/g, "-").replace(/(^-|-$)/g, "") || "file";
}

function buildStoragePath(userId: string, originalName: string) {
  const sanitized = sanitizeFilename(originalName);
  return `uploads/${userId}/${Date.now()}-${randomUUID()}-${sanitized}`;
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = (formData.get("file") as File)?.name ?? "file";
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storagePath = buildStoragePath(session.user.id, filename);

    const supabase = await createSupabaseServerClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_ID)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error("Supabase storage upload failed", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const admin = createSupabaseAdminClient();
    const { data: signed, error: signedError } = await admin.storage
      .from(BUCKET_ID)
      .createSignedUrl(uploadData.path, 60 * 60);

    if (signedError || !signed?.signedUrl) {
      console.error("Failed to create signed URL", signedError);
      return NextResponse.json(
        { error: "Failed to generate access URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: signed.signedUrl,
      storagePath: uploadData.path,
      contentType: file.type,
      name: filename,
    });
  } catch (error) {
    console.error("Failed to process upload", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
