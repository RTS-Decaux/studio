/**
 * Type definitions for fal.ai client integration
 *
 * Based on @fal-ai/client v1.7.2 official SDK
 */

/**
 * Generation status from fal.ai queue
 */
export type FalGenerationStatus =
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/**
 * Result of queue submit operation
 */
export type FalSubmitResult = {
  requestId: string;
  statusUrl?: string;
};

/**
 * Log entry from fal.ai
 */
export type FalLogEntry = {
  message: string;
  level: string;
  timestamp: string;
};

/**
 * Metrics from generation
 */
export type FalMetrics = {
  inference_time?: number;
  [key: string]: number | undefined;
};

/**
 * Queue status response
 */
export type FalStatusResult = {
  status: FalGenerationStatus;
  completedAt?: string;
  startedAt?: string;
  logs?: FalLogEntry[];
  metrics?: FalMetrics;
  position?: number; // Position in queue
  result?: unknown;
  error?: string;
};

/**
 * Common input parameters for image generation
 */
export type FalGenerationInput = {
  prompt: string;
  negative_prompt?: string;
  image_url?: string; // For image-to-image, image-to-video
  image_size?:
    | "square_hd"
    | "square"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  seed?: number;
  enable_safety_checker?: boolean;
  output_format?: "jpeg" | "png";
  sync_mode?: boolean;
  // Video-specific
  duration?: number;
  fps?: number;
  // Model-specific parameters
  [key: string]: unknown;
};

/**
 * Generated image info
 */
export type FalImageInfo = {
  url: string;
  width: number;
  height: number;
  content_type: string;
};

/**
 * Generated video info
 */
export type FalVideoInfo = {
  url: string;
  width: number;
  height: number;
  duration?: number;
  content_type: string;
};

/**
 * Output from fal.ai generation
 */
export type FalGenerationOutput = {
  images?: FalImageInfo[];
  video?: FalVideoInfo;
  timings?: {
    inference: number;
    [key: string]: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
};

/**
 * Options for run method with polling
 */
export type FalRunOptions = {
  onProgress?: (status: FalStatusResult) => void;
  pollInterval?: number;
  timeout?: number;
  webhookUrl?: string;
  logs?: boolean;
};

/**
 * Options for subscribe method
 */
export type FalSubscribeOptions = {
  input: FalGenerationInput;
  logs?: boolean;
  pollInterval?: number;
  timeout?: number;
  webhookUrl?: string;
  onQueueUpdate?: (update: {
    status: FalGenerationStatus;
    position?: number;
    logs?: FalLogEntry[];
    metrics?: FalMetrics;
  }) => void;
};

/**
 * Custom error class for fal.ai operations
 */
export class FalClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "FalClientError";
    Object.setPrototypeOf(this, FalClientError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Result wrapper from fal.ai SDK
 */
export type FalResult<T = unknown> = {
  data: T;
  requestId: string;
};
