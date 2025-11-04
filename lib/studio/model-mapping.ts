import { ALL_FAL_MODELS, type FalStudioModel } from "@/lib/ai/studio-models";
import type { ModelModalityMapping, StudioGenerationType } from "./types";

/**
 * Определяет тип генерации на основе характеристик модели
 */
export function inferGenerationType(model: FalStudioModel): StudioGenerationType[] {
  const types: StudioGenerationType[] = [];

  // Проверяем поддержку различных модальностей
  const modelId = model.id.toLowerCase();
  const description = model.description.toLowerCase();
  const hasImageInput = model.supportsImageInput || model.requiresReferenceImage;
  const hasVideoInput = model.supportsVideoInput;
  const requiresFirstLastFrame = model.requiredInputs?.includes("first-frame");
  const requiresReferenceVideo = model.requiredInputs?.includes("reference-video");

  // Text-to-Image
  if (
    model.type === "image" &&
    !hasImageInput &&
    !hasVideoInput &&
    (modelId.includes("text-to-image") || modelId.includes("flux") || modelId.includes("sdxl"))
  ) {
    types.push("text-to-image");
  }

  // Text-to-Video
  if (
    model.type === "video" &&
    !hasImageInput &&
    !hasVideoInput &&
    !requiresFirstLastFrame &&
    !requiresReferenceVideo &&
    (modelId.includes("text-to-video") || description.includes("text-to-video") || !model.requiresReferenceImage)
  ) {
    types.push("text-to-video");
  }

  // Image-to-Image
  if (
    model.type === "image" &&
    hasImageInput &&
    (modelId.includes("image-to-image") || modelId.includes("inpaint"))
  ) {
    if (modelId.includes("inpaint")) {
      types.push("inpaint");
    }
    types.push("image-to-image");
  }

  // Image-to-Video
  if (
    model.type === "video" &&
    hasImageInput &&
    !requiresFirstLastFrame &&
    !requiresReferenceVideo &&
    (modelId.includes("image-to-video") || description.includes("animate"))
  ) {
    types.push("image-to-video");
  }

  // Video-to-Video
  if (
    model.type === "video" &&
    (hasVideoInput || requiresReferenceVideo) &&
    (modelId.includes("video-to-video") || modelId.includes("remix") || description.includes("video-to-video"))
  ) {
    types.push("video-to-video");
  }

  // Lipsync
  if (
    model.type === "video" &&
    hasVideoInput &&
    (modelId.includes("lipsync") || description.includes("lipsync"))
  ) {
    types.push("lipsync");
  }

  // Если ничего не подошло, определяем дефолт
  if (types.length === 0) {
    if (model.type === "image") {
      types.push("text-to-image");
    } else if (model.type === "video") {
      types.push("text-to-video");
    }
  }

  return types;
}

/**
 * Создаёт mapping моделей по модальностям
 */
export function createModelModalityMapping(): ModelModalityMapping {
  const mapping: ModelModalityMapping = {
    "text-to-image": [],
    "text-to-video": [],
    "image-to-image": [],
    "image-to-video": [],
    "video-to-video": [],
    inpaint: [],
    lipsync: [],
  };

  for (const model of ALL_FAL_MODELS) {
    const types = inferGenerationType(model);
    for (const type of types) {
      if (!mapping[type].find((m) => m.id === model.id)) {
        mapping[type].push(model);
      }
    }
  }

  return mapping;
}

/**
 * Получает модели для конкретного типа генерации
 */
export function getModelsByGenerationType(type: StudioGenerationType): FalStudioModel[] {
  const mapping = createModelModalityMapping();
  return mapping[type] || [];
}

/**
 * Находит модель по ID
 */
export function getModelById(modelId: string): FalStudioModel | undefined {
  return ALL_FAL_MODELS.find((model) => model.id === modelId);
}

/**
 * Получает рекомендуемые модели для типа генерации
 */
export function getRecommendedModels(type: StudioGenerationType, limit = 5): FalStudioModel[] {
  const models = getModelsByGenerationType(type);

  // Приоритеты для рекомендаций
  const priorities = {
    "text-to-image": ["fal-ai/flux/dev", "fal-ai/flux/ultra", "fal-ai/flux/realism"],
    "text-to-video": [
      "veo3.1",
      "sora-2/text-to-video",
      "fal-ai/runway-gen3/turbo",
      "fal-ai/mochi/mochi-1",
    ],
    "image-to-image": ["flux-kontext-lora/image-to-image", "flux-pro/kontext/image-to-image"],
    "image-to-video": [
      "veo3.1/image-to-video",
      "sora-2/image-to-video",
      "fal-ai/runway-gen3/turbo/image-to-video",
    ],
    "video-to-video": ["sora-2/video-to-video/remix", "reve-edit"],
    inpaint: ["flux-kontext-lora/inpaint"],
    lipsync: ["creatify/lipsync", "minimax/lipsync", "pixverse/lipsync"],
  };

  const priorityIds = priorities[type] || [];

  // Сортируем: сначала приоритетные, потом остальные
  const priorityModels = priorityIds
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is FalStudioModel => m !== undefined);

  const otherModels = models.filter((m) => !priorityIds.includes(m.id));

  return [...priorityModels, ...otherModels].slice(0, limit);
}

/**
 * Получает все типы генерации, которые поддерживает модель
 */
export function getModelGenerationTypes(modelId: string): StudioGenerationType[] {
  const model = getModelById(modelId);
  if (!model) return [];
  return inferGenerationType(model);
}

/**
 * Проверяет, поддерживает ли модель определённый тип генерации
 */
export function modelSupportsGenerationType(
  modelId: string,
  type: StudioGenerationType
): boolean {
  const types = getModelGenerationTypes(modelId);
  return types.includes(type);
}

// Экспортируем готовый mapping
export const MODEL_MODALITY_MAPPING = createModelModalityMapping();
