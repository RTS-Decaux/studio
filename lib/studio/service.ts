import "server-only";

import { getFalClient } from "./fal";
import type {
  FalGenerationInput,
  FalGenerationOutput,
  FalRunOptions,
} from "./fal/types";
import { getModelById } from "./model-mapping";
import type { GenerationRequest, StudioGenerationType } from "./types";

/**
 * Studio generation service
 *
 * High-level service that bridges Studio domain concepts with fal.ai SDK.
 *
 * Responsibilities:
 * - Map Studio model IDs to fal.ai model IDs
 * - Transform GenerationRequest to FalGenerationInput
 * - Handle model-specific parameter transformations
 * - Provide simplified API for Studio features
 *
 * @example
 * ```typescript
 * const service = getStudioService();
 * const result = await service.runGeneration({
 *   modelId: "flux-schnell",
 *   prompt: "a beautiful cat",
 *   generationType: "text-to-image"
 * });
 * ```
 */
export class StudioService {
  private readonly client = getFalClient();

  /**
   * Submit generation to queue (async)
   *
   * Returns immediately with request_id. Use checkStatus() or getResult() to poll.
   */
  async submitGeneration(request: GenerationRequest) {
    const model = this.resolveModel(request.modelId);
    const input = this.buildInput(request);

    const result = await this.client.submit(model.id, input);

    return {
      requestId: result.requestId,
      statusUrl: result.statusUrl,
      modelId: request.modelId,
      falModelId: model.id,
    };
  }

  /**
   * Check generation status
   */
  async checkStatus(modelId: string, requestId: string) {
    const model = this.resolveModel(modelId);
    return this.client.getStatus(model.id, requestId);
  }

  /**
   * Get generation result (when completed)
   */
  async getResult(modelId: string, requestId: string) {
    const model = this.resolveModel(modelId);
    return this.client.getResult(model.id, requestId);
  }

  /**
   * Run generation synchronously with automatic polling
   *
   * Recommended for most use cases. Polls until completion.
   */
  async runGeneration(
    request: GenerationRequest,
    options?: FalRunOptions
  ): Promise<FalGenerationOutput> {
    const model = this.resolveModel(request.modelId);
    const input = this.buildInput(request);

    return this.client.run(model.id, input, options);
  }

  /**
   * Cancel generation
   */
  async cancelGeneration(modelId: string, requestId: string) {
    const model = this.resolveModel(modelId);
    return this.client.cancel(model.id, requestId);
  }

  /**
   * Upload reference image to fal.ai storage
   *
   * Returns URL that can be used in generation requests.
   */
  async uploadReferenceImage(file: File | Blob): Promise<string> {
    return this.client.uploadFile(file);
  }

  /**
   * Resolve Studio model ID to fal.ai model
   *
   * In our architecture, the Studio model ID *is* the fal.ai model ID.
   * This method validates the model exists and returns it.
   *
   * @throws {Error} if model not found
   */
  private resolveModel(studioModelId: string) {
    const model = getModelById(studioModelId);

    if (!model) {
      throw new Error(
        `Unknown Studio model: ${studioModelId}. Check studio-models.ts`
      );
    }

    return model;
  }

  /**
   * Build fal.ai input from GenerationRequest
   *
   * Transforms Studio domain request to fal.ai SDK input format.
   * Applies model-specific parameters (defaults and fixed).
   */
  private buildInput(request: GenerationRequest): FalGenerationInput {
    const model = this.resolveModel(request.modelId);

    const input: FalGenerationInput = {
      prompt: request.prompt || "",
    };

    // Common parameters
    if (request.negativePrompt) {
      input.negative_prompt = request.negativePrompt;
    }

    // Image/Video inputs based on generation type
    if (request.referenceImageUrl) {
      input.image_url = request.referenceImageUrl;
    }

    if (request.firstFrameUrl) {
      input.first_frame_image_url = request.firstFrameUrl;
    }

    if (request.lastFrameUrl) {
      input.last_frame_image_url = request.lastFrameUrl;
    }

    if (request.referenceVideoUrl) {
      input.video_url = request.referenceVideoUrl;
    }

    // Sora 2 video_id for remix
    if (request.videoId) {
      input.video_id = request.videoId;
    }

    // Parameters from request (override defaults)
    if (request.parameters) {
      const params = request.parameters;
      const handledKeys = new Set<string>();

      // Map common Studio parameters to fal.ai format
      if (params.imageSize) {
        input.image_size = params.imageSize as any;
        handledKeys.add("imageSize");
      }
      if (params.numInferenceSteps) {
        input.num_inference_steps = params.numInferenceSteps as number;
        handledKeys.add("numInferenceSteps");
      }
      if (params.guidanceScale) {
        input.guidance_scale = params.guidanceScale as number;
        handledKeys.add("guidanceScale");
      }
      if (params.fps) {
        input.fps = params.fps as number;
        handledKeys.add("fps");
      }
      if (params.seed !== undefined) {
        input.seed = params.seed as number;
        handledKeys.add("seed");
      }

      for (const [key, value] of Object.entries(params)) {
        if (handledKeys.has(key) || value === undefined) {
          continue;
        }
        input[key] = value as never;
      }
    }

    if (model.id.includes("reference-to-video") && request.referenceImageUrl) {
      input.image_urls = [request.referenceImageUrl];
    }

    return input;
  }

  /**
   * Infer generation type from model capabilities
   *
   * Helper for UI components
   */
  inferGenerationType(modelId: string): StudioGenerationType | null {
    try {
      const model = this.resolveModel(modelId);

      // Return primary generation type based on model type and capabilities
      if (model.type === "image") {
        return model.supportsImageInput ? "image-to-image" : "text-to-image";
      }

      if (model.type === "video") {
        if (model.supportsVideoInput) {
          return "video-to-video";
        }
        if (model.supportsImageInput) {
          return "image-to-video";
        }
        return "text-to-video";
      }

      return null;
    } catch {
      return null;
    }
  }
}

// Singleton instance
let serviceInstance: StudioService | null = null;

/**
 * Get singleton Studio service instance
 *
 * @example
 * ```typescript
 * import { getStudioService } from "@/lib/studio/service";
 *
 * const service = getStudioService();
 * const result = await service.runGeneration(request);
 * ```
 */
export function getStudioService(): StudioService {
  if (!serviceInstance) {
    serviceInstance = new StudioService();
  }
  return serviceInstance;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetStudioService(): void {
  serviceInstance = null;
}
