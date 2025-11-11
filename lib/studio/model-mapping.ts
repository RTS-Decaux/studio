import { ALL_FAL_MODELS, type FalStudioModel } from "@/lib/ai/studio-models";
import type { ModelModalityMapping, StudioGenerationType } from "./types";

const GENERATION_TYPES: StudioGenerationType[] = [
  "text-to-image",
  "text-to-video",
  "image-to-image",
  "image-to-video",
  "video-to-video",
  "inpaint",
  "lipsync",
];

const MODEL_TYPE_RULES: Record<
  StudioGenerationType,
  (model: FalStudioModel) => boolean
> = {
  "text-to-image": (m) =>
    m.type === "image" &&
    !(m.supportsImageInput ?? false) &&
    !(m.supportsVideoInput ?? false) &&
    !(m.requiresReferenceImage ?? false),

  "text-to-video": (m) =>
    m.type === "video" &&
    !(m.supportsImageInput ?? false) &&
    !(m.supportsVideoInput ?? false) &&
    !(m.requiresReferenceImage ?? false) &&
    !(m.requiredInputs?.includes("first-frame") ?? false) &&
    !(m.requiredInputs?.includes("reference-video") ?? false),

  "image-to-image": (m) =>
    m.type === "image" &&
    ((m.supportsImageInput ?? false) || (m.requiresReferenceImage ?? false)),

  inpaint: (m) =>
    m.type === "image" &&
    ((m.supportsImageInput ?? false) || (m.requiresReferenceImage ?? false)) &&
    m.id.toLowerCase().includes("inpaint"),

  "image-to-video": (m) =>
    m.type === "video" &&
    ((m.supportsImageInput ?? false) || (m.requiresReferenceImage ?? false)) &&
    !(m.requiredInputs?.includes("reference-video") ?? false),

  "video-to-video": (m) =>
    m.type === "video" &&
    ((m.supportsVideoInput ?? false) ||
      (m.requiredInputs?.includes("reference-video") ?? false)),

  lipsync: (m) =>
    m.type === "video" &&
    (m.supportsVideoInput ?? false) &&
    m.id.toLowerCase().includes("lipsync"),
};

const PRIORITY_MODELS: Record<StudioGenerationType, string[]> = {
  "text-to-image": [],
  "text-to-video": [
    "fal-ai/sora-2/text-to-video",
    "fal-ai/sora-2/text-to-video/pro",
    "fal-ai/veo3.1",
    "fal-ai/veo3.1/fast",
  ],
  "image-to-image": [],
  "image-to-video": [
    "fal-ai/sora-2/image-to-video",
    "fal-ai/sora-2/image-to-video/pro",
    "fal-ai/veo3.1/image-to-video",
    "fal-ai/veo3.1/fast/image-to-video",
  ],
  "video-to-video": [],
  inpaint: [],
  lipsync: [],
};

let cachedMapping: ModelModalityMapping | null = null;
const modelCache = new Map<string, FalStudioModel>();

function buildCache() {
  for (const m of ALL_FAL_MODELS) {
    modelCache.set(m.id, m);
  }
}

function buildMapping(): ModelModalityMapping {
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
    for (const type of GENERATION_TYPES) {
      if (MODEL_TYPE_RULES[type](model)) {
        mapping[type].push(model);
      }
    }
  }

  return mapping;
}

function getMapping(): ModelModalityMapping {
  if (!cachedMapping) {
    cachedMapping = buildMapping();
  }
  return cachedMapping;
}

export function getModelById(modelId: string): FalStudioModel | undefined {
  if (modelCache.size === 0) {
    buildCache();
  }
  return modelCache.get(modelId);
}

export function getModelsByGenerationType(
  type: StudioGenerationType
): FalStudioModel[] {
  return getMapping()[type] || [];
}

export function getRecommendedModels(
  type: StudioGenerationType,
  limit = 5
): FalStudioModel[] {
  const models = getModelsByGenerationType(type);
  const priorities = PRIORITY_MODELS[type] || [];

  const prioritized = priorities
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is FalStudioModel => m !== undefined);

  const others = models.filter((m) => !priorities.includes(m.id));

  return [...prioritized, ...others].slice(0, limit);
}

export function getModelGenerationTypes(
  modelId: string
): StudioGenerationType[] {
  const model = getModelById(modelId);
  if (!model) {
    return [];
  }

  return GENERATION_TYPES.filter((type) => MODEL_TYPE_RULES[type](model));
}

export function modelSupportsGenerationType(
  modelId: string,
  type: StudioGenerationType
): boolean {
  const model = getModelById(modelId);
  return model ? MODEL_TYPE_RULES[type](model) : false;
}

export const MODEL_MODALITY_MAPPING = getMapping();
