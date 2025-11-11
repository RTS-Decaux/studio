// ============================================================================
// Database Types
// ============================================================================

import type { FalStudioModel } from "../ai/studio-models";

export type StudioProject = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  settings: {
    resolution?: { width: number; height: number };
    fps?: number;
    duration?: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type StudioAssetType = "image" | "video" | "audio";
export type StudioAssetSourceType = "upload" | "generated" | "imported";

export type StudioAsset = {
  id: string;
  projectId: string | null;
  userId: string;
  type: StudioAssetType;
  name: string;
  url: string;
  thumbnailUrl: string | null;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    size?: number;
    fps?: number;
  };
  sourceType: StudioAssetSourceType | null;
  sourceGenerationId: string | null;
  createdAt: Date;
};

export type StudioGenerationType =
  | "text-to-image"
  | "text-to-video"
  | "image-to-image"
  | "image-to-video"
  | "video-to-video"
  | "inpaint"
  | "lipsync";

export type StudioGenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type StudioGeneration = {
  id: string;
  projectId: string | null;
  userId: string;
  modelId: string;
  generationType: StudioGenerationType;
  status: StudioGenerationStatus;
  prompt: string | null;
  negativePrompt: string | null;
  referenceImageUrl: string | null;
  firstFrameUrl: string | null;
  lastFrameUrl: string | null;
  referenceVideoUrl: string | null;
  inputAssetId: string | null;
  outputAssetId: string | null;
  parameters: Record<string, unknown>;
  falRequestId: string | null;
  falResponse: Record<string, unknown> | null;
  error: string | null;
  cost: number | null;
  processingTime: number | null;
  createdAt: Date;
  completedAt: Date | null;
};

export type StudioTemplateType = "project" | "prompt" | "style";

export type StudioTemplate = {
  id: string;
  userId: string | null;
  type: StudioTemplateType;
  name: string;
  description: string | null;
  thumbnail: string | null;
  modelId: string | null;
  config: Record<string, unknown>;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
};

// ============================================================================
// fal.ai API Types
// ============================================================================

export type FalGenerationInput = {
  prompt: string;
  negative_prompt?: string;
  image_url?: string;
  video_url?: string;
  first_frame_image_url?: string;
  last_frame_image_url?: string;
  reference_image_url?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  image_size?:
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  fps?: number;
  duration?: number;
  seed?: number;
  [key: string]: unknown;
};

export type FalImageOutput = {
  url: string;
  width: number;
  height: number;
  content_type: string;
};

export type FalVideoOutput = {
  url: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  content_type: string;
};

export type FalGenerationOutput = {
  images?: FalImageOutput[];
  video?: FalVideoOutput;
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
  timings?: {
    inference: number;
  };
};

export type FalQueuedResponse = {
  request_id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_url?: string;
  status_url: string;
};

export type FalStatusResponse = {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  completed_at?: string;
  started_at?: string;
  logs?: Array<{ message: string; level: string; timestamp: string }>;
  metrics?: {
    inference_time?: number;
  };
  response?: FalGenerationOutput;
  error?: string;
};

// ============================================================================
// Generation Request Types
// ============================================================================

export type GenerationRequest = {
  modelId: string;
  projectId?: string;
  generationType: StudioGenerationType;
  prompt?: string;
  negativePrompt?: string;
  referenceImageUrl?: string;
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  referenceVideoUrl?: string;
  inputAssetId?: string;
  videoId?: string; // For Sora 2 video-to-video remix
  parameters?: {
    imageSize?: string;
    numInferenceSteps?: number;
    guidanceScale?: number;
    duration?: number;
    fps?: number;
    seed?: number;
    [key: string]: unknown;
  };
};

export type GenerationResponse = {
  generationId: string;
  status: StudioGenerationStatus;
  requestId?: string;
};

// ============================================================================
// Model Mapping Types
// ============================================================================

export type ModelModalityMapping = {
  "text-to-image": FalStudioModel[];
  "text-to-video": FalStudioModel[];
  "image-to-image": FalStudioModel[];
  "image-to-video": FalStudioModel[];
  "video-to-video": FalStudioModel[];
  inpaint: FalStudioModel[];
  lipsync: FalStudioModel[];
};

// ============================================================================
// UI Component Types
// ============================================================================

export type GenerationPanelState = {
  selectedModel: FalStudioModel | null;
  generationType: StudioGenerationType;
  prompt: string;
  negativePrompt: string;
  referenceImage: File | string | null;
  firstFrame: File | string | null;
  lastFrame: File | string | null;
  referenceVideo: File | string | null;
  parameters: Record<string, unknown>;
};

export type ProjectViewMode = "grid" | "list";

export type AssetLibraryFilter = {
  type?: StudioAssetType;
  sourceType?: StudioAssetSourceType;
  search?: string;
};
