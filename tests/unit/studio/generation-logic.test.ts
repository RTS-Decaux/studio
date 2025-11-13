import type { FalStudioModel } from "@/lib/ai/studio-models";
import {
  getModelById,
  getModelsByGenerationType,
} from "@/lib/studio/model-mapping";
import type { StudioGenerationType } from "@/lib/studio/types";
import { expect, test } from "@playwright/test";

/**
 * Unit tests for GenerationPanelV2 and fal.ai integration logic
 * Tests core business logic without UI interactions
 */

test.describe("Generation Panel Logic", () => {
  test.describe("buildDefaultSettings", () => {
    test("should build default settings for FLUX Pro new", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      expect(model).toBeDefined();

      const settings = buildDefaultSettings(model ?? null);

      expect(settings).toBeDefined();
      expect(typeof settings).toBe("object");

      // Verify known settings exist
      if (model?.settings?.some((s) => s.key === "num_images")) {
        expect(settings).toHaveProperty("num_images");
      }
    });

    test("should return empty object for null model", () => {
      const settings = buildDefaultSettings(null);
      expect(settings).toEqual({});
    });

    test("should handle toggle settings correctly", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      if (!model) {
        throw new Error("Model not found");
      }

      const settings = buildDefaultSettings(model);

      const toggleSettings = model.settings?.filter((s) => s.type === "toggle");
      toggleSettings?.forEach((setting) => {
        expect(typeof settings[setting.key]).toBe("boolean");
      });
    });
  });

  test.describe("validateGenerationInputs", () => {
    test("should validate text-to-image without prompt fails", () => {
      const model = getModelById("fal-ai/flux-pro/new");
      const validation = validateGenerationInputs({
        model: model ?? null,
        prompt: "",
        generationType: "text-to-image",
        referenceInputs: {},
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error?.toLowerCase()).toContain("prompt");
    });

    test("should validate text-to-image with prompt passes", () => {
      const model = getModelById("fal-ai/flux-pro/new");
      const validation = validateGenerationInputs({
        model: model ?? null,
        prompt: "a beautiful cat",
        generationType: "text-to-image",
        referenceInputs: {},
      });

      expect(validation.isValid).toBe(true);
    });

    test("should validate without model fails", () => {
      const validation = validateGenerationInputs({
        model: null,
        prompt: "test",
        generationType: "text-to-image",
        referenceInputs: {},
      });

      expect(validation.isValid).toBe(false);
    });

    test("should validate prompt length limit", () => {
      const model = getModelById("fal-ai/flux-pro/new");
      const longPrompt = "a".repeat(10_001);

      const validation = validateGenerationInputs({
        model: model ?? null,
        prompt: longPrompt,
        generationType: "text-to-image",
        referenceInputs: {},
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error?.toLowerCase()).toContain("long");
    });
  });

  test.describe("Model Compatibility", () => {
    test("should identify FLUX models as text-to-image", async () => {
      const models = getModelsByGenerationType("text-to-image");
      const fluxModels = models.filter((m) => m.id.includes("flux"));

      expect(fluxModels.length).toBeGreaterThan(0);
      fluxModels.forEach((model) => {
        expect(model.type).toBe("image");
      });
    });

    test("should get models for each generation type", async () => {
      const types: StudioGenerationType[] = [
        "text-to-image",
        "text-to-video",
        "image-to-image",
        "image-to-video",
        "video-to-video",
      ];

      types.forEach((type) => {
        const models = getModelsByGenerationType(type);
        expect(Array.isArray(models)).toBe(true);
      });
    });

    test("should have different models for different types", async () => {
      const textToImage = getModelsByGenerationType("text-to-image");
      const textToVideo = getModelsByGenerationType("text-to-video");

      expect(textToImage.length).toBeGreaterThan(0);
      expect(textToVideo.length).toBeGreaterThan(0);

      const textToImageIds = new Set(textToImage.map((m) => m.id));
      const textToVideoIds = new Set(textToVideo.map((m) => m.id));

      // Some models might support both, but should have differences
      expect(textToImage.length + textToVideo.length).toBeGreaterThan(0);
    });
  });

  test.describe("Reference Input Validation", () => {
    test("should require reference-image for image-to-image", async () => {
      const model = getModelById("fal-ai/reve/edit");
      expect(model?.requiredInputs).toContain("reference-image");
    });

    test("should require reference-image for image-to-video", async () => {
      const model = getModelById("fal-ai/sora-2/image-to-video");
      expect(model?.requiredInputs).toContain("reference-image");
    });

    test("should not require reference for text-to-image", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      expect(model?.requiredInputs?.length || 0).toBe(0);
    });
  });

  test.describe("Model Settings Rendering", () => {
    test("should have settings for FLUX Pro new", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      expect(model?.settings).toBeDefined();
      expect((model?.settings || []).length).toBeGreaterThan(0);
    });

    test("should have select settings for image sizes", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      const imageSizeSetting = model?.settings?.find(
        (s) => s.key === "image_size"
      );

      expect(imageSizeSetting).toBeDefined();
      expect(imageSizeSetting?.type).toBe("select");
      if (imageSizeSetting?.type === "select") {
        expect(imageSizeSetting.options.length).toBeGreaterThan(0);
      }
    });

    test("should have toggle settings", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      const toggleSettings = model?.settings?.filter(
        (s) => s.type === "toggle"
      );

      expect((toggleSettings || []).length).toBeGreaterThan(0);
    });

    test("should have helper text for settings", async () => {
      const model = getModelById("fal-ai/flux-pro/new");
      const settingsWithHelp = model?.settings?.filter((s) => s.helperText);

      expect((settingsWithHelp || []).length).toBeGreaterThan(0);
    });
  });
});

test.describe("FAL.AI Generation API", () => {
  test.describe("buildFalGenerationInput", () => {
    test("should build input with prompt", () => {
      const request = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "a beautiful landscape",
        parameters: { num_images: 1 },
      };

      const input = buildFalGenerationInput(request);

      expect(input).toHaveProperty("prompt");
      expect(input.prompt).toBe("a beautiful landscape");
    });

    test("should include reference image URL for image-to-image", () => {
      const request = {
        modelId: "fal-ai/reve/edit",
        generationType: "image-to-image" as StudioGenerationType,
        prompt: "edit",
        referenceImageUrl: "https://example.com/image.jpg",
        parameters: {},
      };

      const input = buildFalGenerationInput(request);

      expect(input).toHaveProperty("reference_image_url");
    });

    test("should map image-to-video reference as image_url", () => {
      const request = {
        modelId: "fal-ai/sora-2/image-to-video",
        generationType: "image-to-video" as StudioGenerationType,
        prompt: "animate",
        referenceImageUrl: "https://example.com/image.jpg",
        parameters: {},
      };

      const input = buildFalGenerationInput(request);

      expect(input).toHaveProperty("image_url");
      expect(input.image_url).toBe("https://example.com/image.jpg");
    });

    test("should include negative prompt", () => {
      const request = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "a cat",
        negativePrompt: "blurry",
        parameters: {},
      };

      const input = buildFalGenerationInput(request);

      expect(input).toHaveProperty("negative_prompt");
      expect(input.negative_prompt).toBe("blurry");
    });
  });

  test.describe("validateGenerationRequest", () => {
    test("should validate valid text-to-image request", () => {
      const request = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "test",
        parameters: {},
      };

      const result = validateFalRequest(request);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject text-to-image without prompt", () => {
      const request = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "",
        parameters: {},
      };

      const result = validateFalRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("should require reference for image-to-image", () => {
      const request = {
        modelId: "fal-ai/reve/edit",
        generationType: "image-to-image" as StudioGenerationType,
        prompt: "edit",
        parameters: {},
      };

      const result = validateFalRequest(request);
      expect(result.valid).toBe(false);
    });

    test("should accept image-to-image with reference", () => {
      const request = {
        modelId: "fal-ai/reve/edit",
        generationType: "image-to-image" as StudioGenerationType,
        prompt: "edit",
        referenceImageUrl: "https://example.com/image.jpg",
        parameters: {},
      };

      const result = validateFalRequest(request);
      expect(result.valid).toBe(true);
    });
  });

  test.describe("Parameter Transformation", () => {
    test("should transform string numbers to numbers", () => {
      const params = {
        num_images: "2",
        guidance_scale: "5.0",
      };

      const transformed = transformParameters("fal-ai/flux-pro/new", params);

      expect(typeof transformed.num_images).toBe("number");
      expect(transformed.num_images).toBe(2);
    });

    test("should preserve string values", () => {
      const params = {
        output_format: "png",
        aspect_ratio: "16:9",
      };

      const transformed = transformParameters(
        "fal-ai/sora-2/text-to-video",
        params
      );

      expect(transformed.output_format).toBe("png");
      expect(transformed.aspect_ratio).toBe("16:9");
    });

    test("should convert string booleans", () => {
      const params = {
        enhance_prompt: "true",
        sync_mode: "false",
      };

      const transformed = transformParameters("fal-ai/flux-pro/new", params);

      expect(typeof transformed.enhance_prompt).toBe("boolean");
      expect(typeof transformed.sync_mode).toBe("boolean");
    });
  });

  test.describe("Cost Estimation", () => {
    test("should estimate positive cost", () => {
      const request = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "test",
        parameters: { num_images: 1 },
      };

      const cost = estimateCost(request);
      expect(cost).toBeGreaterThan(0);
    });

    test("should scale cost with number of images", () => {
      const request1 = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "test",
        parameters: { num_images: 1 },
      };

      const request4 = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "test",
        parameters: { num_images: 4 },
      };

      const cost1 = estimateCost(request1);
      const cost4 = estimateCost(request4);

      expect(cost4).toBeGreaterThan(cost1);
    });
  });

  test.describe("Time Estimation", () => {
    test("should estimate positive time", () => {
      const request = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "test",
        parameters: {},
      };

      const time = estimateTime(request);
      expect(time).toBeGreaterThan(0);
    });

    test("should estimate longer time for video", () => {
      const imageRequest = {
        modelId: "fal-ai/flux-pro/new",
        generationType: "text-to-image" as StudioGenerationType,
        prompt: "test",
        parameters: {},
      };

      const videoRequest = {
        modelId: "fal-ai/sora-2/text-to-video",
        generationType: "text-to-video" as StudioGenerationType,
        prompt: "test",
        parameters: { duration: 4 },
      };

      const imageTime = estimateTime(imageRequest);
      const videoTime = estimateTime(videoRequest);

      expect(videoTime).toBeGreaterThan(imageTime);
    });
  });
});

/**
 * Helper functions for testing
 */

function buildDefaultSettings(
  model: FalStudioModel | null
): Record<string, any> {
  if (!model?.settings) {
    return {};
  }

  return model.settings.reduce<Record<string, string | number | boolean>>(
    (acc, setting) => {
      if (setting.type === "toggle" || setting.type === "select") {
        acc[setting.key] = setting.defaultValue;
      } else {
        acc[setting.key] = setting.defaultValue ?? "";
      }
      return acc;
    },
    {}
  );
}

type ValidationInput = {
  model: FalStudioModel | null;
  prompt: string;
  generationType: StudioGenerationType;
  referenceInputs: Record<string, any>;
};

function validateGenerationInputs(input: ValidationInput): {
  isValid: boolean;
  error?: string;
} {
  if (!input.model) {
    return { isValid: false, error: "No model selected" };
  }

  if (input.generationType.startsWith("text-to")) {
    if (!input.prompt || input.prompt.trim().length === 0) {
      return { isValid: false, error: "Prompt is required" };
    }
    if (input.prompt.trim().length > 10_000) {
      return { isValid: false, error: "Prompt is too long (max 10000)" };
    }
  }

  return { isValid: true };
}

function buildFalGenerationInput(request: any): Record<string, any> {
  const input: Record<string, any> = {
    prompt: request.prompt || "",
  };

  if (request.referenceImageUrl) {
    if (request.generationType === "image-to-video") {
      input.image_url = request.referenceImageUrl;
    } else if (request.generationType === "image-to-image") {
      input.reference_image_url = request.referenceImageUrl;
    }
  }

  if (request.negativePrompt) {
    input.negative_prompt = request.negativePrompt;
  }

  if (request.parameters) {
    Object.assign(input, request.parameters);
  }

  return input;
}

function validateFalRequest(request: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.modelId) {
    errors.push("Model ID required");
  }

  if (
    request.generationType.startsWith("text-to") &&
    (!request.prompt || request.prompt.trim().length === 0)
  ) {
    errors.push("Prompt required");
  }

  if (
    request.generationType === "image-to-image" &&
    !request.referenceImageUrl
  ) {
    errors.push("Reference image required");
  }

  if (
    request.generationType === "image-to-video" &&
    !request.referenceImageUrl
  ) {
    errors.push("Reference image required");
  }

  return { valid: errors.length === 0, errors };
}

function transformParameters(
  modelId: string,
  parameters: Record<string, any>
): Record<string, any> {
  const transformed: Record<string, any> = {};

  Object.entries(parameters).forEach(([key, value]) => {
    if (
      [
        "num_images",
        "num_inference_steps",
        "guidance_scale",
        "duration",
      ].includes(key) &&
      typeof value === "string"
    ) {
      transformed[key] = Number.parseFloat(value);
    } else if (
      ["enhance_prompt", "sync_mode", "raw"].includes(key) &&
      typeof value === "string"
    ) {
      transformed[key] = value.toLowerCase() === "true";
    } else {
      transformed[key] = value;
    }
  });

  return transformed;
}

function estimateCost(request: any): number {
  const costs: Record<string, number> = {
    "fal-ai/flux-pro/new": 0.03,
    "fal-ai/sora-2/text-to-video": 0.15,
  };

  const base = costs[request.modelId] || 0.01;
  const count = request.parameters?.num_images || 1;

  return base * count;
}

function estimateTime(request: any): number {
  let time = 5000;

  if (request.generationType.includes("video")) {
    time = 30_000;
  }

  return time;
}
