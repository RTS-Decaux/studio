export type ReferenceInputKind =
  | "reference-image"
  | "first-frame"
  | "last-frame"
  | "reference-video";

export type ModelSettingOption = {
  label: string;
  value: string | number | boolean;
};

export type SelectModelSetting = {
  type: "select";
  key: string;
  label: string;
  defaultValue: string | number;
  options: ModelSettingOption[];
  helperText?: string;
  required?: boolean;
};

export type ToggleModelSetting = {
  type: "toggle";
  key: string;
  label: string;
  defaultValue: boolean;
  helperText?: string;
  required?: boolean;
};

export type TextModelSetting = {
  type: "text" | "textarea";
  key: string;
  label: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
};

export type ModelSetting =
  | SelectModelSetting
  | ToggleModelSetting
  | TextModelSetting;

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
  requiresPrompt?: boolean;
  settings?: ModelSetting[];
};

const SORA_DURATION_OPTIONS: ModelSettingOption[] = [4, 8, 12].map((value) => ({
  label: `${value} seconds`,
  value,
}));

const SORA_ASPECT_OPTIONS: ModelSettingOption[] = [
  { label: "Auto", value: "auto" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
];

const VEO_DURATION_OPTIONS: ModelSettingOption[] = [
  { label: "4 seconds", value: "4s" },
  { label: "6 seconds", value: "6s" },
  { label: "8 seconds", value: "8s" },
];

const VEO_ASPECT_OPTIONS: ModelSettingOption[] = [
  { label: "16:9 (Landscape)", value: "16:9" },
  { label: "9:16 (Portrait)", value: "9:16" },
  { label: "1:1 (Square)", value: "1:1" },
];

const SEEDREAM_ENHANCE_OPTIONS = [
  { label: "Standard", value: "standard" },
  { label: "Fast", value: "fast" },
];

const SEEDREAM_IMAGE_SIZE_DEFAULT = JSON.stringify({
  width: 2048,
  height: 2048,
});

const SEEDREAM_NUM_IMAGES_OPTIONS: ModelSettingOption[] = Array.from(
  { length: 6 },
  (_, index) => ({
    label: `${index + 1} image${index === 0 ? "" : "s"}`,
    value: index + 1,
  })
);

const REVE_OUTPUT_FORMAT_OPTIONS: ModelSettingOption[] = [
  { label: "PNG", value: "png" },
  { label: "JPEG", value: "jpeg" },
  { label: "WEBP", value: "webp" },
];

const REVE_NUM_IMAGES_OPTIONS: ModelSettingOption[] = [
  { label: "1 image", value: 1 },
  { label: "2 images", value: 2 },
  { label: "3 images", value: 3 },
  { label: "4 images", value: 4 },
];

const FLUX_IMAGE_SIZE_OPTIONS: ModelSettingOption[] = [
  { label: "Square (1024x1024)", value: "square_hd" },
  { label: "Landscape 16:9 (1024x576)", value: "landscape_4_3" },
  { label: "Landscape 3:2 (1152x832)", value: "landscape_16_9" },
  { label: "Portrait 4:3 (832x1152)", value: "portrait_4_3" },
  { label: "Portrait 16:9 (576x1024)", value: "portrait_16_9" },
];

const FLUX_NUM_IMAGES_OPTIONS: ModelSettingOption[] = [
  { label: "1 image", value: 1 },
  { label: "2 images", value: 2 },
  { label: "3 images", value: 3 },
  { label: "4 images", value: 4 },
];

const FLUX_SAFETY_TOLERANCE_OPTIONS: ModelSettingOption[] = [
  { label: "1 (Most Strict)", value: "1" },
  { label: "2 (Strict)", value: "2" },
  { label: "3 (Moderate)", value: "3" },
  { label: "4 (Permissive)", value: "4" },
  { label: "5 (More Permissive)", value: "5" },
  { label: "6 (Most Permissive)", value: "6" },
];

const FLUX_OUTPUT_FORMAT_OPTIONS: ModelSettingOption[] = [
  { label: "JPEG", value: "jpeg" },
  { label: "PNG", value: "png" },
];

const FLUX_ASPECT_RATIO_OPTIONS: ModelSettingOption[] = [
  { label: "1:1 (Square)", value: "1:1" },
  { label: "16:9 (Landscape)", value: "16:9" },
  { label: "9:16 (Portrait)", value: "9:16" },
  { label: "4:3 (Landscape)", value: "4:3" },
  { label: "3:4 (Portrait)", value: "3:4" },
];

export const SORA_MODELS: FalStudioModel[] = [
  {
    id: "fal-ai/sora-2/text-to-video",
    name: "Sora 2 Text-to-Video",
    description:
      "OpenAI's cinematic text-to-video model with natural audio and coherent motion.",
    type: "video",
    provider: "fal",
    creator: "OpenAI",
    quality: "Studio",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "16:9",
        options: SORA_ASPECT_OPTIONS.filter(
          (option) => option.value !== "auto"
        ),
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: 4,
        options: SORA_DURATION_OPTIONS,
      },
    ],
  },
  {
    id: "fal-ai/sora-2/text-to-video/pro",
    name: "Sora 2 Pro Text-to-Video",
    description:
      "Higher fidelity text-to-video generation with 1080p support and richer detail.",
    type: "video",
    provider: "fal",
    creator: "OpenAI",
    quality: "Pro",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "1080p",
        options: [
          { label: "1080p", value: "1080p" },
          { label: "720p", value: "720p" },
        ],
      },
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "16:9",
        options: SORA_ASPECT_OPTIONS.filter(
          (option) => option.value !== "auto"
        ),
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: 4,
        options: SORA_DURATION_OPTIONS,
      },
    ],
  },
  {
    id: "fal-ai/sora-2/image-to-video",
    name: "Sora 2 Image-to-Video",
    description:
      "Animate a single reference frame with OpenAI Sora while preserving camera and composition.",
    type: "video",
    provider: "fal",
    creator: "OpenAI",
    quality: "Studio",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "auto",
        options: [
          { label: "Auto", value: "auto" },
          { label: "720p", value: "720p" },
        ],
      },
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "auto",
        options: SORA_ASPECT_OPTIONS,
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: 4,
        options: SORA_DURATION_OPTIONS,
      },
    ],
  },
  {
    id: "fal-ai/sora-2/image-to-video/pro",
    name: "Sora 2 Pro Image-to-Video",
    description:
      "Premium image-to-video mode with 1080p output and more dynamic motion control.",
    type: "video",
    provider: "fal",
    creator: "OpenAI",
    quality: "Pro",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "auto",
        options: [
          { label: "Auto", value: "auto" },
          { label: "1080p", value: "1080p" },
          { label: "720p", value: "720p" },
        ],
      },
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "auto",
        options: SORA_ASPECT_OPTIONS,
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: 4,
        options: SORA_DURATION_OPTIONS,
      },
    ],
  },
  {
    id: "fal-ai/sora-2/video-to-video/remix",
    name: "Sora 2 Video Remix",
    description:
      "Remix previously generated Sora clips using updated prompts without re-uploading footage.",
    type: "video",
    provider: "fal",
    creator: "OpenAI",
    quality: "Studio",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "text",
        key: "video_id",
        label: "Source Video ID",
        helperText: "Use the video_id returned by an earlier Sora generation.",
        placeholder: "video_123",
        required: true,
        defaultValue: "",
      },
    ],
  },
];

const KLING_DURATION_OPTIONS: ModelSettingOption[] = [
  { label: "5 seconds", value: "5" },
  { label: "10 seconds", value: "10" },
];

const KLING_NEGATIVE_PROMPT = "blur, distort, and low quality";

export const VEO_MODELS: FalStudioModel[] = [
  {
    id: "fal-ai/veo3.1",
    name: "Veo 3.1 Text-to-Video",
    description:
      "Google DeepMind's flagship Veo 3.1 model with audio, prompt enhancement, and policy auto-fix.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "SOTA",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "16:9",
        options: VEO_ASPECT_OPTIONS,
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS,
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: false,
        helperText: "Disable to save credits when silent footage is enough.",
      },
      {
        type: "toggle",
        key: "enhance_prompt",
        label: "Enhance Prompt",
        defaultValue: true,
      },
      {
        type: "toggle",
        key: "auto_fix",
        label: "Auto Fix",
        defaultValue: true,
        helperText: "Automatically rewrite prompts that trip policy filters.",
      },
      {
        type: "textarea",
        key: "negative_prompt",
        label: "Negative Prompt",
        helperText: "Describe elements to avoid in the clip.",
        defaultValue: "",
      },
    ],
  },
  {
    id: "fal-ai/veo3.1/fast",
    name: "Veo 3.1 Fast Text-to-Video",
    description:
      "Faster, more affordable Veo 3.1 generation for quick text-to-video iterations.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "Pro",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "16:9",
        options: VEO_ASPECT_OPTIONS,
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS,
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: true,
      },
      {
        type: "toggle",
        key: "enhance_prompt",
        label: "Enhance Prompt",
        defaultValue: true,
      },
      {
        type: "toggle",
        key: "auto_fix",
        label: "Auto Fix",
        defaultValue: true,
      },
      {
        type: "textarea",
        key: "negative_prompt",
        label: "Negative Prompt",
        defaultValue: "",
      },
    ],
  },
  {
    id: "fal-ai/veo3.1/image-to-video",
    name: "Veo 3.1 Image-to-Video",
    description:
      "Animate still frames with Veo 3.1 while preserving subject fidelity and cinematic motion.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "SOTA",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "16:9",
        options: VEO_ASPECT_OPTIONS,
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS,
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: true,
      },
    ],
  },
  {
    id: "fal-ai/veo3.1/fast/image-to-video",
    name: "Veo 3.1 Fast Image-to-Video",
    description:
      "Speed-optimized Veo 3.1 image-to-video with the same subject consistency at lower latency.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "Pro",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "auto",
        options: [{ label: "Auto", value: "auto" }, ...VEO_ASPECT_OPTIONS],
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS,
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: true,
      },
    ],
  },
  {
    id: "fal-ai/veo3.1/first-last-frame-to-video",
    name: "Veo 3.1 First/Last Frame",
    description:
      "Blend two keyframes into a seamless Veo 3.1 shot with policy-aware prompt controls.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "SOTA",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["first-frame", "last-frame"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "auto",
        options: [{ label: "Auto", value: "auto" }, ...VEO_ASPECT_OPTIONS],
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS,
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: true,
      },
    ],
  },
  {
    id: "fal-ai/veo3.1/fast/first-last-frame-to-video",
    name: "Veo 3.1 Fast First/Last",
    description:
      "Rapid first/last frame blending for Veo 3.1 with streamlined credit usage.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "Pro",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["first-frame", "last-frame"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "auto",
        options: [{ label: "Auto", value: "auto" }, ...VEO_ASPECT_OPTIONS],
      },
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS,
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: true,
      },
    ],
  },
  {
    id: "fal-ai/veo3.1/reference-to-video",
    name: "Veo 3.1 Reference-to-Video",
    description:
      "Feed multiple hero stills into Veo 3.1 for consistent subject reenactment and camera work.",
    type: "video",
    provider: "fal",
    creator: "Google DeepMind",
    quality: "SOTA",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "8s",
        options: VEO_DURATION_OPTIONS.filter((option) => option.value === "8s"),
      },
      {
        type: "select",
        key: "resolution",
        label: "Resolution",
        defaultValue: "720p",
        options: [
          { label: "720p", value: "720p" },
          { label: "1080p", value: "1080p" },
        ],
      },
      {
        type: "toggle",
        key: "generate_audio",
        label: "Generate Audio",
        defaultValue: true,
      },
    ],
  },
];

export const SEEDREAM_MODELS: FalStudioModel[] = [
  {
    id: "fal-ai/bytedance/seedream/v4/edit",
    name: "Seedream v4 Edit",
    description:
      "Seedream 4 Edit from ByteDance combines image generation and editing into a single workflow.",
    type: "image",
    provider: "fal",
    creator: "ByteDance",
    quality: "SOTA",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "text",
        key: "image_size",
        label: "Image Size",
        helperText: "JSON object {height, width}. Minimum area 921600 px.",
        defaultValue: SEEDREAM_IMAGE_SIZE_DEFAULT,
        required: true,
      },
      {
        type: "select",
        key: "num_images",
        label: "Generations",
        defaultValue: 1,
        options: SEEDREAM_NUM_IMAGES_OPTIONS,
      },
      {
        type: "select",
        key: "max_images",
        label: "Max images per generation",
        defaultValue: 1,
        options: SEEDREAM_NUM_IMAGES_OPTIONS,
      },
      {
        type: "text",
        key: "seed",
        label: "Seed",
        helperText: "Optional integer for deterministic outputs.",
        defaultValue: "",
      },
      {
        type: "toggle",
        key: "sync_mode",
        label: "Sync Mode",
        helperText: "Enable to receive data URI outputs.",
        defaultValue: false,
      },
      {
        type: "toggle",
        key: "enable_safety_checker",
        label: "Safety Checker",
        defaultValue: true,
      },
      {
        type: "select",
        key: "enhance_prompt_mode",
        label: "Prompt Enhancement",
        defaultValue: "standard",
        options: SEEDREAM_ENHANCE_OPTIONS,
      },
      {
        type: "textarea",
        key: "negative_prompt",
        label: "Negative Prompt",
        helperText: "Default: blur, distort, and low quality",
        defaultValue: "blur, distort, and low quality",
      },
    ],
  },
];

export const REVE_MODELS: FalStudioModel[] = [
  {
    id: "fal-ai/reve/edit",
    name: "Reve Edit",
    description:
      "Reve edit model for stylized image transformations using a text prompt.",
    type: "image",
    provider: "fal",
    creator: "Reve",
    quality: "High",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "num_images",
        label: "Generations",
        defaultValue: 1,
        options: REVE_NUM_IMAGES_OPTIONS,
      },
      {
        type: "select",
        key: "output_format",
        label: "Output Format",
        defaultValue: "png",
        options: REVE_OUTPUT_FORMAT_OPTIONS,
      },
      {
        type: "toggle",
        key: "sync_mode",
        label: "Sync Mode",
        helperText: "Returns data URI and skips history",
        defaultValue: false,
      },
    ],
  },
  {
    id: "fal-ai/reve/fast/edit",
    name: "Reve Fast Edit",
    description:
      "Reve fast edit for quicker image refinements with the same controls.",
    type: "image",
    provider: "fal",
    creator: "Reve",
    quality: "Fast",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "num_images",
        label: "Generations",
        defaultValue: 1,
        options: REVE_NUM_IMAGES_OPTIONS,
      },
      {
        type: "select",
        key: "output_format",
        label: "Output Format",
        defaultValue: "png",
        options: REVE_OUTPUT_FORMAT_OPTIONS,
      },
      {
        type: "toggle",
        key: "sync_mode",
        label: "Sync Mode",
        helperText: "Returns data URI and skips history",
        defaultValue: false,
      },
    ],
  },
];

export const KLING_MODELS: FalStudioModel[] = [
  {
    id: "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
    name: "Kling 2.5 Turbo Standard",
    description:
      "Stylized Kling 2.5 Turbo image-to-video that emphasizes cinematic motion and clean visuals.",
    type: "video",
    provider: "fal",
    creator: "Kling",
    quality: "SOTA",
    supportsImageInput: true,
    supportsVideoInput: false,
    requiresReferenceImage: true,
    requiredInputs: ["reference-image"],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "duration",
        label: "Duration",
        defaultValue: "5",
        options: KLING_DURATION_OPTIONS,
      },
      {
        type: "text",
        key: "negative_prompt",
        label: "Negative Prompt",
        helperText: "Examples: blur, distort, and low quality",
        defaultValue: KLING_NEGATIVE_PROMPT,
      },
      {
        type: "text",
        key: "cfg_scale",
        label: "CFG Scale",
        helperText: "0 = creative, 1 = faithful",
        placeholder: "0.5",
        defaultValue: "0.5",
      },
    ],
  },
];

export const FLUX_MODELS: FalStudioModel[] = [
  {
    id: "fal-ai/flux-pro/new",
    name: "FLUX.1 [pro] new",
    description:
      "Accelerated version of FLUX.1 [pro], maintaining professional-grade image quality while delivering significantly faster generation speeds.",
    type: "image",
    provider: "fal",
    creator: "Black Forest Labs",
    quality: "Pro",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "image_size",
        label: "Image Size",
        defaultValue: "landscape_4_3",
        options: FLUX_IMAGE_SIZE_OPTIONS,
      },
      {
        type: "select",
        key: "num_images",
        label: "Number of Images",
        defaultValue: 1,
        options: FLUX_NUM_IMAGES_OPTIONS,
      },
      {
        type: "select",
        key: "output_format",
        label: "Output Format",
        defaultValue: "jpeg",
        options: FLUX_OUTPUT_FORMAT_OPTIONS,
      },
      {
        type: "select",
        key: "num_inference_steps",
        label: "Inference Steps",
        defaultValue: 28,
        options: [
          { label: "Fast (10 steps)", value: 10 },
          { label: "Balanced (28 steps)", value: 28 },
          { label: "Quality (50 steps)", value: 50 },
        ],
        helperText: "More steps = better quality but slower",
      },
      {
        type: "select",
        key: "guidance_scale",
        label: "Guidance Scale",
        defaultValue: 3.5,
        options: [
          { label: "1.0 (Creative)", value: 1.0 },
          { label: "2.0", value: 2.0 },
          { label: "3.5 (Balanced)", value: 3.5 },
          { label: "5.0", value: 5.0 },
          { label: "10.0", value: 10.0 },
          { label: "20.0 (Strict)", value: 20.0 },
        ],
        helperText: "How closely to follow the prompt",
      },
      {
        type: "select",
        key: "safety_tolerance",
        label: "Safety Tolerance",
        defaultValue: "2",
        options: FLUX_SAFETY_TOLERANCE_OPTIONS,
        helperText: "1 = Most strict, 6 = Most permissive",
      },
      {
        type: "toggle",
        key: "enhance_prompt",
        label: "Enhance Prompt",
        defaultValue: false,
        helperText: "AI enhancement of your prompt for better results",
      },
      {
        type: "toggle",
        key: "sync_mode",
        label: "Sync Mode",
        defaultValue: false,
        helperText: "Returns data URI and skips history",
      },
    ],
  },
  {
    id: "fal-ai/flux-pro/v1.1-ultra",
    name: "FLUX.1 [pro] v1.1 Ultra",
    description:
      "Premium FLUX.1 [pro] variant with enhanced detail, richness, and fidelity for professional-grade image generation.",
    type: "image",
    provider: "fal",
    creator: "Black Forest Labs",
    quality: "Ultra",
    supportsImageInput: false,
    supportsVideoInput: false,
    requiresReferenceImage: false,
    requiredInputs: [],
    optionalInputs: [],
    settings: [
      {
        type: "select",
        key: "num_images",
        label: "Number of Images",
        defaultValue: 1,
        options: FLUX_NUM_IMAGES_OPTIONS,
      },
      {
        type: "select",
        key: "output_format",
        label: "Output Format",
        defaultValue: "jpeg",
        options: FLUX_OUTPUT_FORMAT_OPTIONS,
      },
      {
        type: "select",
        key: "safety_tolerance",
        label: "Safety Tolerance",
        defaultValue: "2",
        options: FLUX_SAFETY_TOLERANCE_OPTIONS,
        helperText: "1 = Most strict, 6 = Most permissive",
      },
      {
        type: "select",
        key: "aspect_ratio",
        label: "Aspect Ratio",
        defaultValue: "1:1",
        options: FLUX_ASPECT_RATIO_OPTIONS,
      },
      {
        type: "toggle",
        key: "enable_safety_checker",
        label: "Safety Checker",
        defaultValue: true,
        helperText: "Detect and filter unsafe content",
      },
      {
        type: "toggle",
        key: "raw",
        label: "Raw Mode",
        defaultValue: false,
        helperText: "Generate less processed, more natural-looking images",
      },
      {
        type: "toggle",
        key: "sync_mode",
        label: "Sync Mode",
        defaultValue: false,
        helperText: "Returns data URI and skips history",
      },
    ],
  },
];

export const FAL_MODEL_GROUPS: Array<{
  creator: string;
  models: FalStudioModel[];
}> = [
  {
    creator: "OpenAI",
    models: SORA_MODELS,
  },
  {
    creator: "Google DeepMind",
    models: VEO_MODELS,
  },
  {
    creator: "ByteDance",
    models: SEEDREAM_MODELS,
  },
  {
    creator: "Reve",
    models: REVE_MODELS,
  },
  {
    creator: "Kling",
    models: KLING_MODELS,
  },
  {
    creator: "Black Forest Labs",
    models: FLUX_MODELS,
  },
];

export const ALL_FAL_MODELS: FalStudioModel[] = FAL_MODEL_GROUPS.flatMap(
  (group) => group.models
);
