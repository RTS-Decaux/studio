import type { StudioGenerationType } from "./types";

// ============================================================================
// Prompt Templates
// ============================================================================

export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  category: "photography" | "art" | "cinematic" | "anime" | "3d" | "abstract" | "product";
  prompt: string;
  negativePrompt: string;
  generationType: StudioGenerationType[];
  tags: string[];
  thumbnail?: string;
  examples?: string[];
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Photography
  {
    id: "photo-portrait",
    name: "Professional Portrait",
    description: "High-quality professional portrait photography",
    category: "photography",
    prompt: "Professional headshot portrait of [subject], studio lighting, shallow depth of field, neutral background, sharp focus, Canon EOS R5, 85mm f/1.4, bokeh effect, high detail, 8K quality",
    negativePrompt: "blurry, distorted, low quality, overexposed, underexposed, noisy, amateur, snapshot, bad lighting, cluttered background",
    generationType: ["text-to-image", "image-to-image"],
    tags: ["portrait", "professional", "studio", "photography"],
    examples: ["business person", "actor", "model"],
  },
  {
    id: "photo-landscape",
    name: "Landscape Photography",
    description: "Stunning landscape photography with dramatic lighting",
    category: "photography",
    prompt: "[location] landscape at golden hour, dramatic clouds, vivid colors, wide angle, professional photography, HDR, award-winning composition, foreground interest, leading lines, rule of thirds, 8K resolution",
    negativePrompt: "people, buildings, cars, urban, overprocessed, oversaturated, fake, cartoon, low quality, blurry",
    generationType: ["text-to-image"],
    tags: ["landscape", "nature", "scenic", "photography"],
    examples: ["mountain range", "ocean sunset", "forest"],
  },
  {
    id: "photo-product",
    name: "Product Photography",
    description: "Clean professional product shots",
    category: "product",
    prompt: "[product] on white background, studio lighting, professional product photography, high resolution, sharp focus, clean shadows, commercial quality, minimalist composition, perfect lighting, 8K",
    negativePrompt: "cluttered, messy background, poor lighting, blurry, distorted, reflections, low quality, amateur",
    generationType: ["text-to-image", "image-to-image"],
    tags: ["product", "commercial", "e-commerce", "clean"],
    examples: ["luxury watch", "smartphone", "perfume bottle"],
  },

  // Cinematic
  {
    id: "cinematic-scene",
    name: "Cinematic Scene",
    description: "Movie-quality cinematic composition",
    category: "cinematic",
    prompt: "[scene description], cinematic composition, dramatic lighting, film grain, anamorphic lens, color grading, depth of field, atmospheric, movie still, ARRI Alexa, 2.39:1 aspect ratio, professional cinematography",
    negativePrompt: "flat lighting, amateur, snapshot, poor composition, oversaturated, low quality, blurry, distorted",
    generationType: ["text-to-image", "text-to-video", "image-to-video"],
    tags: ["cinematic", "movie", "dramatic", "film"],
    examples: ["dystopian city", "spaceship interior", "ancient temple"],
  },
  {
    id: "cinematic-character",
    name: "Cinematic Character",
    description: "Epic character portrait in cinematic style",
    category: "cinematic",
    prompt: "Epic [character] portrait, cinematic lighting, dramatic atmosphere, heroic pose, detailed costume, photorealistic, movie poster quality, rim lighting, volumetric fog, 8K, professional",
    negativePrompt: "cartoon, anime, low quality, blurry, amateur, flat lighting, bad anatomy, distorted",
    generationType: ["text-to-image"],
    tags: ["character", "portrait", "epic", "heroic"],
    examples: ["warrior", "wizard", "cyberpunk hacker"],
  },

  // Art Styles
  {
    id: "art-oil-painting",
    name: "Oil Painting",
    description: "Classical oil painting style",
    category: "art",
    prompt: "[subject], oil painting, classical art style, rich colors, visible brush strokes, Renaissance inspired, museum quality, masterpiece, detailed, warm color palette, artistic lighting",
    negativePrompt: "photograph, digital, modern, flat, cartoon, low detail, amateur, blurry",
    generationType: ["text-to-image", "image-to-image"],
    tags: ["painting", "classical", "art", "traditional"],
    examples: ["still life", "landscape", "portrait"],
  },
  {
    id: "art-watercolor",
    name: "Watercolor Art",
    description: "Delicate watercolor painting style",
    category: "art",
    prompt: "[subject], watercolor painting, soft edges, flowing colors, artistic, delicate, light and airy, paper texture, translucent layers, organic, painterly style",
    negativePrompt: "photograph, digital, harsh, solid colors, sharp edges, low quality",
    generationType: ["text-to-image", "image-to-image"],
    tags: ["watercolor", "painting", "soft", "artistic"],
    examples: ["flowers", "landscape", "animals"],
  },
  {
    id: "art-impressionist",
    name: "Impressionist",
    description: "Impressionist painting style",
    category: "art",
    prompt: "[subject], impressionist painting style, loose brushwork, visible strokes, emphasis on light, vibrant colors, outdoor scene, Monet inspired, artistic interpretation, atmospheric",
    negativePrompt: "photograph, realistic, detailed, sharp, digital, modern, low quality",
    generationType: ["text-to-image", "image-to-image"],
    tags: ["impressionist", "painting", "artistic", "monet"],
    examples: ["garden", "water lilies", "sunset"],
  },

  // Anime & Manga
  {
    id: "anime-character",
    name: "Anime Character",
    description: "High-quality anime character art",
    category: "anime",
    prompt: "[character description], anime style, detailed eyes, cel shading, vibrant colors, clean lines, professional anime art, dynamic pose, detailed clothing, manga style, high quality",
    negativePrompt: "realistic, photograph, western cartoon, low quality, blurry, distorted anatomy, bad proportions",
    generationType: ["text-to-image", "image-to-image"],
    tags: ["anime", "manga", "character", "japanese"],
    examples: ["warrior", "magical girl", "school student"],
  },
  {
    id: "anime-scene",
    name: "Anime Scene",
    description: "Beautiful anime background and scene",
    category: "anime",
    prompt: "[scene description], anime background art, detailed scenery, vibrant colors, Studio Ghibli inspired, atmospheric lighting, beautiful composition, high quality anime art, detailed environment",
    negativePrompt: "realistic, photograph, low detail, blurry, poor composition, dull colors",
    generationType: ["text-to-image"],
    tags: ["anime", "background", "scenery", "ghibli"],
    examples: ["fantasy forest", "city street", "magical library"],
  },

  // 3D & CGI
  {
    id: "3d-render",
    name: "3D Render",
    description: "Professional 3D render quality",
    category: "3d",
    prompt: "[subject], professional 3D render, octane render, ray tracing, photorealistic materials, perfect lighting, clean composition, high detail, 8K resolution, studio setup, realistic textures",
    negativePrompt: "2D, flat, cartoon, low poly, low quality, blurry, amateur, bad materials",
    generationType: ["text-to-image"],
    tags: ["3d", "render", "cgi", "octane"],
    examples: ["product", "character", "architecture"],
  },
  {
    id: "3d-stylized",
    name: "Stylized 3D",
    description: "Colorful stylized 3D art",
    category: "3d",
    prompt: "[subject], stylized 3D art, vibrant colors, clean shapes, playful design, smooth surfaces, ambient occlusion, cartoon-like but detailed, professional 3D illustration, appealing aesthetics",
    negativePrompt: "realistic, photograph, low quality, messy, dark, gritty, complex",
    generationType: ["text-to-image"],
    tags: ["3d", "stylized", "colorful", "cartoon"],
    examples: ["character", "scene", "object"],
  },

  // Abstract & Artistic
  {
    id: "abstract-modern",
    name: "Modern Abstract",
    description: "Contemporary abstract art",
    category: "abstract",
    prompt: "[concept], abstract art, modern, vibrant colors, geometric shapes, fluid forms, contemporary design, artistic composition, bold colors, creative, expressive",
    negativePrompt: "realistic, photograph, representational, low quality, muddy colors, cluttered",
    generationType: ["text-to-image"],
    tags: ["abstract", "modern", "artistic", "contemporary"],
    examples: ["emotion", "concept", "pattern"],
  },

  // Video specific
  {
    id: "video-smooth-motion",
    name: "Smooth Camera Motion",
    description: "Cinematic camera movements",
    category: "cinematic",
    prompt: "[scene], smooth camera movement, cinematic shot, professional cinematography, steady cam, fluid motion, dynamic angle, establishing shot, film quality",
    negativePrompt: "shaky, jerky, amateur, poor framing, unstable, low quality",
    generationType: ["text-to-video", "image-to-video"],
    tags: ["video", "camera", "motion", "cinematic"],
    examples: ["flyover", "dolly shot", "crane shot"],
  },
  {
    id: "video-time-lapse",
    name: "Time Lapse Effect",
    description: "Accelerated time passage",
    category: "cinematic",
    prompt: "[scene] time lapse, clouds moving fast, light changing, dynamic transformation, smooth acceleration, professional time lapse photography, dramatic sky",
    negativePrompt: "static, still, no motion, jerky, low quality, amateur",
    generationType: ["text-to-video", "image-to-video"],
    tags: ["video", "timelapse", "motion", "transformation"],
    examples: ["sunset", "cityscape", "flowers blooming"],
  },
];

// ============================================================================
// Project Templates
// ============================================================================

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  category: "photography" | "animation" | "marketing" | "art" | "social-media";
  icon: string;
  generationType: StudioGenerationType;
  modelId: string;
  defaultSettings: {
    imageSize?: string;
    duration?: number;
    fps?: number;
    steps?: number;
    guidance?: number;
  };
  promptTemplate?: string;
  negativePromptTemplate?: string;
  tags: string[];
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Photography templates
  {
    id: "portrait-session",
    name: "Portrait Session",
    description: "Professional portrait photography setup",
    category: "photography",
    icon: "👤",
    generationType: "text-to-image",
    modelId: "fal-ai/flux/realism",
    defaultSettings: {
      imageSize: "portrait_4_3",
      steps: 35,
      guidance: 8,
    },
    promptTemplate:
      "Professional portrait of [subject], studio lighting, neutral background, sharp focus, high detail",
    negativePromptTemplate: "blurry, distorted, low quality, bad lighting",
    tags: ["portrait", "photography", "professional"],
  },
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "E-commerce product photography",
    category: "photography",
    icon: "📦",
    generationType: "text-to-image",
    modelId: "fal-ai/flux/dev",
    defaultSettings: {
      imageSize: "square_hd",
      steps: 30,
      guidance: 7.5,
    },
    promptTemplate:
      "[product] on white background, studio lighting, professional product photography, clean, high resolution",
    negativePromptTemplate: "cluttered, messy, poor lighting, shadows",
    tags: ["product", "ecommerce", "commercial"],
  },

  // Animation templates
  {
    id: "social-media-video",
    name: "Social Media Clip",
    description: "Short engaging video for social media",
    category: "social-media",
    icon: "📱",
    generationType: "text-to-video",
    modelId: "fal-ai/runway-gen3/turbo",
    defaultSettings: {
      duration: 5,
      fps: 30,
      steps: 25,
      guidance: 7,
    },
    promptTemplate:
      "[dynamic scene], eye-catching, vibrant colors, fast-paced, engaging content, trending style",
    negativePromptTemplate: "slow, boring, dull, static",
    tags: ["social", "short", "viral", "engaging"],
  },
  {
    id: "logo-animation",
    name: "Logo Animation",
    description: "Animated logo reveal",
    category: "marketing",
    icon: "✨",
    generationType: "image-to-video",
    modelId: "veo3.1/image-to-video",
    defaultSettings: {
      duration: 3,
      fps: 30,
      steps: 28,
      guidance: 8,
    },
    promptTemplate:
      "Logo reveal animation, smooth motion, professional, elegant, premium feel",
    negativePromptTemplate: "jerky, amateur, low quality",
    tags: ["logo", "branding", "animation", "intro"],
  },
  {
    id: "character-animation",
    name: "Character Animation",
    description: "Bring characters to life",
    category: "animation",
    icon: "🎭",
    generationType: "image-to-video",
    modelId: "veo3.1/image-to-video",
    defaultSettings: {
      duration: 5,
      fps: 24,
      steps: 30,
      guidance: 8.5,
    },
    promptTemplate:
      "Character animation, natural movement, expressive, smooth motion, lifelike",
    negativePromptTemplate: "stiff, robotic, unnatural, distorted",
    tags: ["character", "animation", "motion"],
  },

  // Marketing templates
  {
    id: "instagram-story",
    name: "Instagram Story",
    description: "Vertical video for Instagram stories",
    category: "social-media",
    icon: "📸",
    generationType: "text-to-video",
    modelId: "fal-ai/runway-gen3/turbo",
    defaultSettings: {
      duration: 5,
      fps: 30,
      steps: 25,
      guidance: 7,
    },
    promptTemplate:
      "[content], vertical format, mobile-optimized, eye-catching, trending style, story-friendly",
    negativePromptTemplate: "horizontal, landscape, static, boring",
    tags: ["instagram", "story", "vertical", "mobile"],
  },
  {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail",
    description: "Click-worthy YouTube thumbnail",
    category: "marketing",
    icon: "🎬",
    generationType: "text-to-image",
    modelId: "fal-ai/flux/ultra",
    defaultSettings: {
      imageSize: "landscape_16_9",
      steps: 40,
      guidance: 9,
    },
    promptTemplate:
      "[topic], bold text, eye-catching, high contrast, vibrant colors, clickable thumbnail design, expressive face",
    negativePromptTemplate: "subtle, boring, low contrast, dull, small text",
    tags: ["youtube", "thumbnail", "clickbait", "marketing"],
  },

  // Art templates
  {
    id: "concept-art",
    name: "Concept Art",
    description: "Game or film concept art",
    category: "art",
    icon: "🎨",
    generationType: "text-to-image",
    modelId: "fal-ai/flux/dev",
    defaultSettings: {
      imageSize: "landscape_16_9",
      steps: 35,
      guidance: 8,
    },
    promptTemplate:
      "[subject] concept art, detailed environment, atmospheric, professional game art, painterly style, concept design",
    negativePromptTemplate: "photograph, realistic, low detail, amateur",
    tags: ["concept", "art", "game", "design"],
  },
  {
    id: "digital-painting",
    name: "Digital Painting",
    description: "Artistic digital painting",
    category: "art",
    icon: "🖼️",
    generationType: "text-to-image",
    modelId: "fal-ai/flux/dev",
    defaultSettings: {
      imageSize: "square_hd",
      steps: 40,
      guidance: 8.5,
    },
    promptTemplate:
      "[subject], digital painting, artistic, painterly style, beautiful colors, detailed brushwork, masterpiece quality",
    negativePromptTemplate: "photograph, realistic, flat, low quality",
    tags: ["painting", "art", "digital", "artistic"],
  },

  // Experimental
  {
    id: "ai-experiment",
    name: "AI Experiment",
    description: "Creative AI experimentation",
    category: "art",
    icon: "🔬",
    generationType: "text-to-image",
    modelId: "fal-ai/flux/dev",
    defaultSettings: {
      imageSize: "square_hd",
      steps: 28,
      guidance: 6,
    },
    promptTemplate: "[creative concept], experimental, unique, innovative, artistic interpretation",
    negativePromptTemplate: "conventional, boring, standard, typical",
    tags: ["experimental", "creative", "unique", "ai"],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id);
}

export function getProjectTemplatesByCategory(category: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter((t) => t.category === category);
}

export function getProjectTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}

export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplatesByGenerationType(
  generationType: StudioGenerationType
): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.generationType.includes(generationType));
}

// Template categories for UI
export const TEMPLATE_CATEGORIES = [
  { id: "photography", name: "Photography", icon: "📷", count: 3 },
  { id: "art", name: "Art Styles", icon: "🎨", count: 4 },
  { id: "cinematic", name: "Cinematic", icon: "🎬", count: 4 },
  { id: "anime", name: "Anime & Manga", icon: "🎌", count: 2 },
  { id: "3d", name: "3D & CGI", icon: "🎲", count: 2 },
  { id: "abstract", name: "Abstract", icon: "🌈", count: 1 },
  { id: "product", name: "Product", icon: "📦", count: 1 },
] as const;

export const PROJECT_TEMPLATE_CATEGORIES = [
  { id: "photography", name: "Photography", icon: "📷" },
  { id: "animation", name: "Animation", icon: "🎬" },
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "social-media", name: "Social Media", icon: "📱" },
] as const;
