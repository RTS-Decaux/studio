"use server";

import { ChatSDKError } from "@/lib/errors";
import { getModelById } from "@/lib/studio/model-mapping";
import { getStudioService } from "@/lib/studio/service";
import type { GenerationRequest, GenerationResponse } from "@/lib/studio/types";
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

// Helper to get current authenticated user (requires permanent account)
async function getCurrentUser() {
  // Use secure server helper which calls `supabase.auth.getUser()` under the hood
  // (this verifies the session with the Supabase Auth server) instead of
  // directly reading the session from cookies which can be insecure.
  const { requirePermanentUser } = await import("@/lib/auth");
  const user = await requirePermanentUser();

  return user;
}

// ============================================================================
// Projects
// ============================================================================

export async function getProjectsAction() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return await getProjectsByUserId(user.id);
}

export async function getProjectAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(id);

  if (!project) {
    throw new ChatSDKError("not_found:studio_project");
  }

  if (project.userId !== user.id) {
    throw new ChatSDKError("forbidden:studio_project");
  }

  return project;
}

export async function createProjectAction(title: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!title || title.trim().length === 0) {
    throw new ChatSDKError(
      "bad_request:studio_project",
      "Project title is required"
    );
  }

  if (title.trim().length > 200) {
    throw new ChatSDKError(
      "bad_request:studio_project",
      "Project title is too long (max 200 characters)"
    );
  }

  try {
    return await createProject({
      userId: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      thumbnail: null,
      settings: {
        resolution: { width: 1920, height: 1080 },
        fps: 30,
      },
    });
  } catch (error: any) {
    if (
      error.message?.includes("rate limit") ||
      error.message?.includes("quota")
    ) {
      throw new ChatSDKError("rate_limit:studio_project");
    }
    throw new ChatSDKError("bad_request:studio_project", error.message);
  }
}

export async function updateProjectAction(
  id: string,
  updates: { title?: string; description?: string; thumbnail?: string }
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(id);

  if (!project) {
    throw new ChatSDKError("not_found:studio_project");
  }

  if (project.userId !== user.id) {
    throw new ChatSDKError("forbidden:studio_project");
  }

  if (updates.title !== undefined) {
    if (!updates.title || updates.title.trim().length === 0) {
      throw new ChatSDKError(
        "bad_request:studio_project",
        "Project title cannot be empty"
      );
    }
    if (updates.title.trim().length > 200) {
      throw new ChatSDKError(
        "bad_request:studio_project",
        "Project title is too long (max 200 characters)"
      );
    }
  }

  try {
    return await updateProject(id, updates);
  } catch (error: any) {
    throw new ChatSDKError("bad_request:studio_project", error.message);
  }
}

export async function deleteProjectAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(id);

  if (!project) {
    throw new ChatSDKError("not_found:studio_project");
  }

  if (project.userId !== user.id) {
    throw new ChatSDKError("forbidden:studio_project");
  }

  try {
    await deleteProject(id);
  } catch (error: any) {
    throw new ChatSDKError("bad_request:studio_project", error.message);
  }
}

// ============================================================================
// Assets
// ============================================================================

export async function getProjectAssetsAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(projectId);

  if (!project) {
    throw new ChatSDKError("not_found:studio_project");
  }

  if (project.userId !== user.id) {
    throw new ChatSDKError("forbidden:studio_project");
  }

  try {
    return await getAssetsByProjectId(projectId);
  } catch (error: any) {
    throw new ChatSDKError("bad_request:studio_asset", error.message);
  }
}

export async function getUserAssetsAction() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return await getAssetsByUserId(user.id);
}

export async function deleteAssetAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // TODO: Verify asset ownership before deletion
  try {
    await deleteAsset(id);
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      throw new ChatSDKError("not_found:studio_asset");
    }
    throw new ChatSDKError("bad_request:studio_asset", error.message);
  }
}

// ============================================================================
// Generations
// ============================================================================

export async function getUserGenerationsAction() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return await getGenerationsByUserId(user.id);
}

export async function getProjectGenerationsAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(projectId);

  if (!project) {
    throw new ChatSDKError("not_found:studio_project");
  }

  if (project.userId !== user.id) {
    throw new ChatSDKError("forbidden:studio_project");
  }

  try {
    return await getGenerationsByProjectId(projectId);
  } catch (error: any) {
    throw new ChatSDKError("bad_request:studio_generation", error.message);
  }
}

/**
 * Запускает генерацию контента через fal.ai
 */
export async function generateAction(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Валидация модели
  const model = getModelById(request.modelId);
  if (!model) {
    throw new ChatSDKError(
      "not_found:fal_api",
      `Model not found: ${request.modelId}`
    );
  }

  // Валидация prompt для text-to-* моделей
  if (request.generationType.startsWith("text-to")) {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ChatSDKError(
        "bad_request:studio_generation",
        "Prompt is required for text-to-* generations"
      );
    }
    if (request.prompt.trim().length > 10_000) {
      throw new ChatSDKError(
        "bad_request:studio_generation",
        "Prompt is too long (max 10000 characters)"
      );
    }
  }

  // Валидация проекта если указан
  if (request.projectId) {
    const project = await getProjectById(request.projectId);
    if (!project) {
      throw new ChatSDKError("not_found:studio_project");
    }
    if (project.userId !== user.id) {
      throw new ChatSDKError("forbidden:studio_project");
    }
  }

  try {
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
  } catch (error: any) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    if (
      error.message?.includes("rate limit") ||
      error.message?.includes("quota")
    ) {
      throw new ChatSDKError("rate_limit:studio_generation");
    }
    throw new ChatSDKError("bad_request:studio_generation", error.message);
  }
}

/**
 * Cancel generation
 */
export async function cancelGenerationAction(generationId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const generations = await getGenerationsByUserId(user.id);
    const generation = generations.find((g) => g.id === generationId);

    if (!generation) {
      throw new ChatSDKError("not_found:studio_generation");
    }

    if (generation.userId !== user.id) {
      throw new ChatSDKError("forbidden:studio_generation");
    }

    // Can only cancel pending or processing generations
    if (generation.status !== "pending" && generation.status !== "processing") {
      throw new ChatSDKError(
        "bad_request:studio_generation",
        "Generation cannot be cancelled in current state"
      );
    }

    // Cancel in fal.ai if we have request_id
    if (generation.falRequestId) {
      const service = getStudioService();
      try {
        await service.cancelGeneration(
          generation.modelId,
          generation.falRequestId
        );
      } catch (error: any) {
        console.error("Failed to cancel in fal.ai:", error);
        // Continue to update DB even if fal.ai cancel fails
      }
    }

    // Update DB status
    await updateGeneration(generationId, {
      status: "cancelled",
      error: "Cancelled by user",
    });

    return { success: true };
  } catch (error: any) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError("bad_request:studio_generation", error.message);
  }
}

/**
 * Retry failed generation
 */
export async function retryGenerationAction(generationId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const generations = await getGenerationsByUserId(user.id);
    const generation = generations.find((g) => g.id === generationId);

    if (!generation) {
      throw new ChatSDKError("not_found:studio_generation");
    }

    if (generation.userId !== user.id) {
      throw new ChatSDKError("forbidden:studio_generation");
    }

    // Can only retry failed generations
    if (generation.status !== "failed") {
      throw new ChatSDKError(
        "bad_request:studio_generation",
        "Only failed generations can be retried"
      );
    }

    // Create new generation with same parameters
    const request: GenerationRequest = {
      modelId: generation.modelId,
      projectId: generation.projectId || undefined,
      generationType: generation.generationType,
      prompt: generation.prompt || undefined,
      negativePrompt: generation.negativePrompt || undefined,
      referenceImageUrl: generation.referenceImageUrl || undefined,
      firstFrameUrl: generation.firstFrameUrl || undefined,
      lastFrameUrl: generation.lastFrameUrl || undefined,
      referenceVideoUrl: generation.referenceVideoUrl || undefined,
      inputAssetId: generation.inputAssetId || undefined,
      parameters: generation.parameters as any,
    };

    return await generateAction(request);
  } catch (error: any) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError("bad_request:studio_generation", error.message);
  }
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

    const service = getStudioService();

    // Запускаем генерацию через новый StudioService
    const startTime = Date.now();
    let result: any;

    try {
      result = await service.runGeneration(request, {
        onProgress: (status) => {
          console.log(`Generation ${generationId} status:`, status.status);
        },
        pollInterval: 2000,
        timeout: 600_000, // 10 minutes
        logs: true,
      });
    } catch (falError: any) {
      // Обрабатываем специфичные ошибки fal.ai
      let errorMessage = falError.message || "Unknown fal.ai error";

      if (falError.message?.includes("timeout")) {
        errorMessage =
          "Generation timeout - the AI service took too long to respond";
      } else if (falError.message?.includes("rate limit")) {
        errorMessage =
          "AI service rate limit exceeded - please try again later";
      } else if (
        falError.message?.includes("authentication") ||
        falError.message?.includes("unauthorized")
      ) {
        errorMessage =
          "AI service authentication failed - please contact support";
      } else if (
        falError.message?.includes("invalid") ||
        falError.message?.includes("bad request")
      ) {
        errorMessage =
          "Invalid generation parameters - please check your inputs";
      } else if (falError.message?.includes("not found")) {
        errorMessage = "AI model not found or deprecated";
      } else if (
        falError.message?.includes("unavailable") ||
        falError.message?.includes("offline")
      ) {
        errorMessage = "AI service temporarily unavailable";
      }

      throw new Error(errorMessage);
    }

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
      try {
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
      } catch (assetError: any) {
        console.error(
          `Failed to create asset for generation ${generationId}:`,
          assetError
        );
        // Продолжаем даже если не удалось создать asset
      }
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

    // Формируем понятное сообщение об ошибке
    const errorMessage =
      error.message || "Unknown error occurred during generation";

    await updateGeneration(generationId, {
      status: "failed",
      error: errorMessage,
    });
  }
}
