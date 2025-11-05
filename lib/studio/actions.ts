"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFalClient } from "@/lib/studio/fal-client";
import { getModelById } from "@/lib/studio/model-mapping";
import type {
  FalGenerationInput,
  GenerationRequest,
  GenerationResponse,
} from "@/lib/studio/types";
import { redirect } from "next/navigation";
import {
  createAsset,
  createGeneration,
  createProject,
  deleteAsset,
  deleteProject,
  getAssetsByProjectId,
  getAssetsByUserId,
  getGenerationsByProjectId,
  getGenerationsByUserId,
  getProjectById,
  getProjectsByUserId,
  updateGeneration,
  updateProject,
} from "./queries";

// Helper to get current authenticated user
async function getCurrentUser() {
  // Use secure server helper which calls `supabase.auth.getUser()` under the hood
  // (this verifies the session with the Supabase Auth server) instead of
  // directly reading the session from cookies which can be insecure.
  const { getUser } = await import("@/lib/supabase/server");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// ============================================================================
// Projects
// ============================================================================

export async function getProjectsAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getProjectsByUserId(user.id);
}

export async function getProjectAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProjectById(id);
  if (!project || project.userId !== user.id) {
    throw new Error("Project not found or access denied");
  }

  return project;
}

export async function createProjectAction(title: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await createProject({
    userId: user.id,
    title,
    description: description || null,
    thumbnail: null,
    settings: {
      resolution: { width: 1920, height: 1080 },
      fps: 30,
    },
  });
}

export async function updateProjectAction(
  id: string,
  updates: { title?: string; description?: string; thumbnail?: string }
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProjectById(id);
  if (!project || project.userId !== user.id) {
    throw new Error("Project not found or access denied");
  }

  return await updateProject(id, updates);
}

export async function deleteProjectAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProjectById(id);
  if (!project || project.userId !== user.id) {
    throw new Error("Project not found or access denied");
  }

  await deleteProject(id);
}

// ============================================================================
// Assets
// ============================================================================

export async function getProjectAssetsAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProjectById(projectId);
  if (!project || project.userId !== user.id) {
    throw new Error("Project not found or access denied");
  }

  return await getAssetsByProjectId(projectId);
}

export async function getUserAssetsAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getAssetsByUserId(user.id);
}

export async function deleteAssetAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // TODO: Verify asset ownership
  await deleteAsset(id);
}

// ============================================================================
// Generations
// ============================================================================

export async function getUserGenerationsAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return await getGenerationsByUserId(user.id);
}

export async function getProjectGenerationsAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProjectById(projectId);
  if (!project || project.userId !== user.id) {
    throw new Error("Project not found or access denied");
  }

  return await getGenerationsByProjectId(projectId);
}

/**
 * Запускает генерацию контента через fal.ai
 */
export async function generateAction(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Валидация модели
  const model = getModelById(request.modelId);
  if (!model) {
    throw new Error(`Model not found: ${request.modelId}`);
  }

  // Создаём запись в БД
  const generation = await createGeneration({
    userId: user.id,
    projectId: request.projectId || null,
    modelId: request.modelId,
    generationType: request.generationType,
    status: "pending",
    prompt: request.prompt || null,
    negativePrompt: request.negativePrompt || null,
    referenceImageUrl: request.referenceImageUrl || null,
    firstFrameUrl: request.firstFrameUrl || null,
    lastFrameUrl: request.lastFrameUrl || null,
    referenceVideoUrl: request.referenceVideoUrl || null,
    inputAssetId: request.inputAssetId || null,
    outputAssetId: null,
    parameters: request.parameters || {},
    falRequestId: null,
    falResponse: null,
    error: null,
    cost: null,
    processingTime: null,
  });

  // Запускаем фоновую генерацию
  processGeneration(generation.id, request).catch((error) => {
    console.error("Background generation failed:", error);
  });

  return {
    generationId: generation.id,
    status: "pending",
  };
}

/**
 * Фоновая обработка генерации
 */
async function processGeneration(
  generationId: string,
  request: GenerationRequest
): Promise<void> {
  try {
    // Обновляем статус
    await updateGeneration(generationId, { status: "processing" });

    const falClient = getFalClient();

    // Подготавливаем input для fal.ai
    const input: FalGenerationInput = {
      prompt: request.prompt || "",
      negative_prompt: request.negativePrompt,
      image_url: request.referenceImageUrl,
      first_frame_image_url: request.firstFrameUrl,
      last_frame_image_url: request.lastFrameUrl,
      video_url: request.referenceVideoUrl,
      ...request.parameters,
    };

    // Запускаем генерацию
    const startTime = Date.now();
    const result = await falClient.run(request.modelId, input, {
      onProgress: (status) => {
        console.log(`Generation ${generationId} status:`, status.status);
      },
    });
    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    // Получаем URL результата
    let outputUrl: string | null = null;
    let metadata: any = {};

    if (result.images && result.images.length > 0) {
      outputUrl = result.images[0].url;
      metadata = {
        width: result.images[0].width,
        height: result.images[0].height,
        format: result.images[0].content_type,
      };
    } else if (result.video) {
      outputUrl = result.video.url;
      metadata = {
        width: result.video.width,
        height: result.video.height,
        duration: result.video.duration,
        fps: result.video.fps,
        format: result.video.content_type,
      };
    }

    // Создаём asset с результатом
    let outputAssetId: string | null = null;
    if (outputUrl) {
      const asset = await createAsset({
        projectId: request.projectId || null,
        userId: (await getCurrentUser())!.id,
        type: result.video ? "video" : "image",
        name: `Generated ${result.video ? "video" : "image"}`,
        url: outputUrl,
        thumbnailUrl: result.video ? null : outputUrl,
        metadata,
        sourceType: "generated",
        sourceGenerationId: generationId,
      });
      outputAssetId = asset.id;
    }

    // Обновляем генерацию
    await updateGeneration(generationId, {
      status: "completed",
      outputAssetId,
      falResponse: result,
      processingTime,
      completedAt: new Date(),
    });
  } catch (error: any) {
    console.error(`Generation ${generationId} failed:`, error);
    await updateGeneration(generationId, {
      status: "failed",
      error: error.message || "Unknown error",
    });
  }
}
