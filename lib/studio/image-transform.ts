/**
 * Supabase Storage Image Transformation Utilities
 *
 * Uses Supabase's built-in image transformation API to generate
 * optimized thumbnails and previews on-the-fly.
 *
 * Documentation: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 20-100
  format?: "origin" | "webp" | "avif";
  resize?: "cover" | "contain" | "fill";
}

/**
 * Extracts bucket name and file path from a Supabase Storage URL
 */
function parseSupabaseStorageUrl(url: string): {
  bucket: string;
  path: string;
  baseUrl: string;
} | null {
  try {
    const urlObj = new URL(url);

    // Handle both public and authenticated storage URLs
    // Format: https://{project}.supabase.co/storage/v1/object/{public|authenticated}/{bucket}/{path}
    const match = urlObj.pathname.match(
      /^\/storage\/v1\/object\/(public|authenticated|sign)\/([^/]+)\/(.+)$/
    );

    if (!match) {
      return null;
    }

    const [, accessType, bucket, path] = match;
    const baseUrl = `${urlObj.origin}/storage/v1`;

    return {
      bucket,
      path,
      baseUrl,
    };
  } catch (error) {
    console.error("Failed to parse Supabase storage URL:", error);
    return null;
  }
}

/**
 * Generates a transformed image URL using Supabase's image transformation API
 *
 * @param originalUrl - Original Supabase Storage URL
 * @param options - Transformation options
 * @returns Transformed image URL or original URL if transformation is not possible
 */
export function getTransformedImageUrl(
  originalUrl: string | null,
  options: ImageTransformOptions = {}
): string | null {
  if (!originalUrl) {
    return null;
  }

  // Only transform Supabase storage URLs
  if (!originalUrl.includes("supabase.co/storage")) {
    return originalUrl;
  }

  const parsed = parseSupabaseStorageUrl(originalUrl);
  if (!parsed) {
    return originalUrl;
  }

  const { bucket, path, baseUrl } = parsed;

  // Build transformation parameters
  const params = new URLSearchParams();

  if (options.width) {
    params.append("width", options.width.toString());
  }

  if (options.height) {
    params.append("height", options.height.toString());
  }

  if (options.quality) {
    params.append(
      "quality",
      Math.max(20, Math.min(100, options.quality)).toString()
    );
  }

  if (options.format) {
    params.append("format", options.format);
  }

  if (options.resize) {
    params.append("resize", options.resize);
  }

  const queryString = params.toString();
  const transformPath = queryString
    ? `${baseUrl}/render/image/public/${bucket}/${path}?${queryString}`
    : originalUrl;

  return transformPath;
}

/**
 * Predefined transformation presets for common use cases
 */
export const ImagePresets = {
  // Small thumbnail for grid views (200x200)
  thumbnailSmall: (url: string | null) =>
    getTransformedImageUrl(url, {
      width: 200,
      height: 200,
      resize: "cover",
      quality: 75,
      format: "webp",
    }),

  // Medium thumbnail for list views (400x300)
  thumbnailMedium: (url: string | null) =>
    getTransformedImageUrl(url, {
      width: 400,
      height: 300,
      resize: "cover",
      quality: 80,
      format: "webp",
    }),

  // Large preview for detail views (800x600)
  previewLarge: (url: string | null) =>
    getTransformedImageUrl(url, {
      width: 800,
      height: 600,
      resize: "contain",
      quality: 85,
      format: "webp",
    }),

  // Full size optimized (max 1920x1080)
  fullOptimized: (url: string | null) =>
    getTransformedImageUrl(url, {
      width: 1920,
      height: 1080,
      resize: "contain",
      quality: 90,
      format: "webp",
    }),

  // Avatar/profile pictures (100x100)
  avatar: (url: string | null) =>
    getTransformedImageUrl(url, {
      width: 100,
      height: 100,
      resize: "cover",
      quality: 80,
      format: "webp",
    }),

  // Card thumbnails for gallery (300x300)
  cardThumbnail: (url: string | null) =>
    getTransformedImageUrl(url, {
      width: 300,
      height: 300,
      resize: "cover",
      quality: 75,
      format: "webp",
    }),
};

/**
 * Generate srcSet for responsive images
 */
export function getResponsiveSrcSet(url: string | null): string | undefined {
  if (!url) {
    return;
  }

  const sizes = [400, 800, 1200, 1600];
  const srcSet = sizes
    .map((width) => {
      const transformedUrl = getTransformedImageUrl(url, {
        width,
        quality: 85,
        format: "webp",
      });
      return `${transformedUrl} ${width}w`;
    })
    .join(", ");

  return srcSet;
}

/**
 * Helper to check if a URL is a video
 */
export function isVideoUrl(url: string | null): boolean {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}

/**
 * Get appropriate preview URL based on asset type
 */
export function getAssetPreviewUrl(
  asset: { url: string; thumbnailUrl: string | null; type: string },
  size: "small" | "medium" | "large" = "medium"
): string {
  // For videos, use thumbnailUrl if available, otherwise return video URL
  if (asset.type === "video") {
    if (asset.thumbnailUrl) {
      return size === "small"
        ? ImagePresets.thumbnailSmall(asset.thumbnailUrl) || asset.thumbnailUrl
        : size === "medium"
          ? ImagePresets.thumbnailMedium(asset.thumbnailUrl) ||
            asset.thumbnailUrl
          : ImagePresets.previewLarge(asset.thumbnailUrl) || asset.thumbnailUrl;
    }
    return asset.url;
  }

  // For images, transform the main URL
  const previewUrl = asset.thumbnailUrl || asset.url;

  return size === "small"
    ? ImagePresets.thumbnailSmall(previewUrl) || previewUrl
    : size === "medium"
      ? ImagePresets.thumbnailMedium(previewUrl) || previewUrl
      : ImagePresets.previewLarge(previewUrl) || previewUrl;
}
