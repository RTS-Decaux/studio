export type ReferenceInputKind =
  | "reference-image"
  | "first-frame"
  | "last-frame"
  | "reference-video";

export type FalStudioModel = {
  id: string;
  name: string;
  description: string;
  type: "image" | "video";
  provider: "fal";
  creator: string;
  quality?: string;
  supportsImageInput?: boolean;
  supportsVideoInput?: boolean;
  requiresReferenceImage?: boolean;
  requiredInputs: ReferenceInputKind[];
  optionalInputs: ReferenceInputKind[];
};

export const FAL_MODEL_GROUPS: Array<{
  creator: string;
  models: FalStudioModel[];
}> = [
  {
    creator: "Google",
    models: [
      {
        id: "fal-ai/gemini-25-flash-image",
        name: "Gemini 2.5 Flash Image",
        description:
          "Google's state-of-the-art image generation and editing model with advanced features, creative control, and multimodal capabilities including text-to-image and image-to-image editing.",
        type: "image",
        provider: "fal",
        creator: "Google",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
      {
        id: "fal-ai/veo3.1",
        name: "Veo 3.1 Text-to-Video",
        description:
          "The latest state-of-the-art video generation model from Google DeepMind, capable of generating high-fidelity videos from text prompts with sound, focusing on narrative coherence and cinematic quality.",
        type: "video",
        provider: "fal",
        creator: "Google",
        quality: "SOTA",
        supportsImageInput: false,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: [],
      },
      {
        id: "fal-ai/veo3.1/image-to-video",
        name: "Veo 3.1 Image-to-Video",
        description:
          "Variant of Google's Veo 3.1 specialized for transforming static images into high-fidelity videos with realistic motion, sound, and prompt precision.",
        type: "video",
        provider: "fal",
        creator: "Google",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: ["first-frame", "last-frame"],
      },
      {
        id: "fal-ai/veo3.1/fast/image-to-video",
        name: "Veo 3.1 Fast Image-to-Video",
        description:
          "Fast variant of Veo 3.1 for quick image-to-video generation, maintaining high quality with optimized speed for iterative workflows.",
        type: "video",
        provider: "fal",
        creator: "Google",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
      {
        id: "fal-ai/veo3.1/reference-to-video",
        name: "Veo 3.1 Reference-to-Video",
        description:
          "Advanced variant of Veo 3.1 for video editing and generation using reference videos, enabling style transfer, remixing, and consistent motion across clips.",
        type: "video",
        provider: "fal",
        creator: "Google",
        quality: "SOTA",
        supportsImageInput: false,
        supportsVideoInput: true,
        requiresReferenceImage: false,
        requiredInputs: ["reference-video"],
        optionalInputs: ["first-frame", "last-frame"],
      },
      {
        id: "fal-ai/veo2/image-to-video",
        name: "Veo 2 Image-to-Video",
        description:
          "Google's Veo 2 variant for converting images to videos with realistic motion and high-quality output, supporting up to 8-second clips and commercial use.",
        type: "video",
        provider: "fal",
        creator: "Google",
        quality: "High-quality",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "Black Forest Labs",
    models: [
      {
        id: "fal-ai/flux/1.1-pro",
        name: "Flux 1.1 Pro",
        description:
          "Advanced Flux model for photorealistic image generation with precise inpainting, batch production, and superior prompt adherence.",
        type: "image",
        provider: "fal",
        creator: "Black Forest Labs",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
      {
        id: "fal-ai/flux/dev",
        name: "Flux 1 Dev",
        description:
          "Open-weights Flux model for high-fidelity text-to-image generation, offering detailed outputs and flexibility for custom fine-tuning.",
        type: "image",
        provider: "fal",
        creator: "Black Forest Labs",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
      {
        id: "fal-ai/flux/schnell",
        name: "Flux 1 Schnell",
        description:
          "Fast variant of Flux for rapid text-to-image generation, balancing speed and quality for quick iterations.",
        type: "image",
        provider: "fal",
        creator: "Black Forest Labs",
        quality: "High-quality",
        supportsImageInput: false,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: [],
      },
      {
        id: "fal-ai/flux/kontext-dev",
        name: "Flux 1 Kontext Dev",
        description:
          "Specialized Flux variant for image editing based on text instructions, ensuring robust consistency and detailed modifications using reference images.",
        type: "image",
        provider: "fal",
        creator: "Black Forest Labs",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
      {
        id: "fal-ai/flux/lora",
        name: "Flux LoRA",
        description:
          "LoRA-adapted Flux model for customized image generation, supporting fine-tuned styles and subjects with optional reference inputs.",
        type: "image",
        provider: "fal",
        creator: "Black Forest Labs",
        quality: "High-quality",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
    ],
  },
  {
    creator: "Bria",
    models: [
      {
        id: "fal-ai/bria/fibo",
        name: "Bria Fibo",
        description:
          "SOTA open source model trained on licensed data for precise, high-quality AI image generation with strong prompt adherence.",
        type: "image",
        provider: "fal",
        creator: "Bria",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
    ],
  },
  {
    creator: "ByteDance",
    models: [
      {
        id: "fal-ai/seedream/4.0",
        name: "Seedream 4.0",
        description:
          "ByteDance's new-generation image creation model integrating generation and editing in one architecture, supporting text-to-image and image-to-image.",
        type: "image",
        provider: "fal",
        creator: "ByteDance",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
    ],
  },
  {
    creator: "Recraft",
    models: [
      {
        id: "fal-ai/recraft/v3",
        name: "Recraft V3",
        description:
          "SOTA text-to-image model for generating long texts, vector art, brand styles, and supporting image editing.",
        type: "image",
        provider: "fal",
        creator: "Recraft",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
    ],
  },
  {
    creator: "Kling",
    models: [
      {
        id: "fal-ai/kling/2.5-turbo-pro",
        name: "Kling 2.5 Turbo Pro",
        description:
          "Top-tier image-to-video generation with motion fluidity, cinematic visuals, prompt precision, and support for stylized transformations.",
        type: "video",
        provider: "fal",
        creator: "Kling",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: ["first-frame", "last-frame"],
      },
    ],
  },
  {
    creator: "Minimax",
    models: [
      {
        id: "fal-ai/minimax/hailuo",
        name: "Minimax Hailuo AI",
        description:
          "Advanced AI video model for generating coherent narrative videos from text or images, with multimodal inputs.",
        type: "video",
        provider: "fal",
        creator: "Minimax",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
    ],
  },
  {
    creator: "Luma",
    models: [
      {
        id: "fal-ai/luma/dream-machine",
        name: "Luma Dream Machine",
        description:
          "High-fidelity video generation model for creating realistic footage from text or images, with optional frame controls.",
        type: "video",
        provider: "fal",
        creator: "Luma",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image", "first-frame", "last-frame"],
      },
    ],
  },
  {
    creator: "Mochi",
    models: [
      {
        id: "fal-ai/mochi/1",
        name: "Mochi 1",
        description:
          "State-of-the-art video generation model for dynamic content creation, supporting text and image inputs.",
        type: "video",
        provider: "fal",
        creator: "Mochi",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
    ],
  },
  {
    creator: "Wan",
    models: [
      {
        id: "fal-ai/wan/pro",
        name: "Wan Pro",
        description:
          "Best open source image-to-video model with high-quality output, sound support, and optional frame references.",
        type: "video",
        provider: "fal",
        creator: "Wan",
        quality: "SOTA",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: ["first-frame", "last-frame"],
      },
    ],
  },
  {
    creator: "OpenAI",
    models: [
      {
        id: "fal-ai/sora/2",
        name: "Sora 2",
        description:
          "Advanced video-to-video remix model from OpenAI for editing and generating videos using reference clips.",
        type: "video",
        provider: "fal",
        creator: "OpenAI",
        quality: "SOTA",
        supportsImageInput: false,
        supportsVideoInput: true,
        requiresReferenceImage: false,
        requiredInputs: ["reference-video"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "Runway",
    models: [
      {
        id: "fal-ai/runway-gen3/turbo",
        name: "Runway Gen-3 Turbo",
        description: "Text-to-video powerhouse for 5s cinematic clips.",
        type: "video",
        provider: "fal",
        creator: "Runway",
        quality: "High",
        supportsImageInput: false,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: ["reference-image"],
      },
      {
        id: "fal-ai/runway-gen3/turbo/image-to-video",
        name: "Runway Gen-3 Turbo Image-to-Video",
        description: "Animate a still frame via Runway's Gen-3 Turbo.",
        type: "video",
        provider: "fal",
        creator: "Runway",
        quality: "High",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "PixVerse",
    models: [
      {
        id: "fal-ai/pixverse/v5/image-to-video",
        name: "PixVerse v5 Image-to-Video",
        description: "PixVerse v5 animated image-to-video.",
        type: "video",
        provider: "fal",
        creator: "PixVerse",
        quality: "High",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "Creatify",
    models: [
      {
        id: "fal-ai/creatify/lipsync",
        name: "Creatify Lipsync",
        description: "Creatify lipsync animation from reference video.",
        type: "video",
        provider: "fal",
        creator: "Creatify",
        quality: "High",
        supportsImageInput: false,
        supportsVideoInput: true,
        requiresReferenceImage: false,
        requiredInputs: ["reference-video"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "MiniMax",
    models: [
      {
        id: "fal-ai/minimax/lipsync",
        name: "MiniMax Lipsync",
        description: "MiniMax lipsync diffusion for talking avatars.",
        type: "video",
        provider: "fal",
        creator: "MiniMax",
        quality: "High",
        supportsImageInput: false,
        supportsVideoInput: true,
        requiresReferenceImage: false,
        requiredInputs: ["reference-video"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "OmniHuman (ByteDance)",
    models: [
      {
        id: "fal-ai/bytedance/omnihuman/v1.5/image-to-video",
        name: "OmniHuman v1.5 Image-to-Video",
        description: "ByteDance OmniHuman character animation.",
        type: "video",
        provider: "fal",
        creator: "OmniHuman (ByteDance)",
        quality: "High",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "LTXV",
    models: [
      {
        id: "fal-ai/ltxv-13b-098-distilled/image-to-video",
        name: "LTXV 13B Distilled Image-to-Video",
        description: "Distilled LTXV 13B for image driven video.",
        type: "video",
        provider: "fal",
        creator: "LTXV",
        quality: "High",
        supportsImageInput: true,
        supportsVideoInput: false,
        requiresReferenceImage: true,
        requiredInputs: ["reference-image"],
        optionalInputs: [],
      },
    ],
  },
  {
    creator: "fal.ai (Experimental)",
    models: [
      {
        id: "fal-ai/nano-banana",
        name: "Nano Banana",
        description: "Lightweight creative video generator.",
        type: "video",
        provider: "fal",
        creator: "fal.ai (Experimental)",
        quality: "Balanced",
        supportsImageInput: false,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: [],
      },
      {
        id: "fal-ai/longcat-video-distilled",
        name: "Longcat Video Distilled",
        description: "Longcat distilled model for extended video scenes.",
        type: "video",
        provider: "fal",
        creator: "fal.ai (Experimental)",
        quality: "Balanced",
        supportsImageInput: false,
        supportsVideoInput: false,
        requiresReferenceImage: false,
        requiredInputs: [],
        optionalInputs: [],
      },
    ],
  },
];

// 🚀 Единый массив всех моделей
export const ALL_FAL_MODELS: FalStudioModel[] = FAL_MODEL_GROUPS.flatMap(
  (group) => group.models,
);
