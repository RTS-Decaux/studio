/**
 * Supabase Storage Signed URLs Utilities
 * 
 * Generates temporary signed URLs for private storage buckets.
 * Signed URLs expire after a set time for security.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

interface SignedUrlOptions {
  expiresIn?: number; // Seconds until expiration (default: 1 hour)
  download?: boolean | string; // Force download with optional filename
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "origin" | "webp" | "avif";
    resize?: "cover" | "contain" | "fill";
  };
}

/**
 * Parse internal storage URL format: supabase://storage/{bucket}/{path}
 */
function parseStorageUrl(url: string): {
  bucket: string;
  path: string;
} | null {
  if (!url.startsWith("supabase://storage/")) {
    return null;
  }

  const withoutProtocol = url.replace("supabase://storage/", "");
  const firstSlash = withoutProtocol.indexOf("/");
  
  if (firstSlash === -1) {
    return null;
  }

  const bucket = withoutProtocol.substring(0, firstSlash);
  const path = withoutProtocol.substring(firstSlash + 1);

  return { bucket, path };
}

/**
 * Generate a signed URL for a private storage object
 * 
 * @param storageUrl - Internal storage URL (supabase://storage/{bucket}/{path}) or storage path
 * @param options - URL generation options
 * @returns Signed URL with temporary access
 */
export async function getSignedStorageUrl(
  storageUrl: string | null,
  options: SignedUrlOptions = {}
): Promise<string | null> {
  if (!storageUrl) {
    return null;
  }

  // If it's already a full URL (http/https), return as-is (for backward compatibility)
  if (storageUrl.startsWith("http://") || storageUrl.startsWith("https://")) {
    return storageUrl;
  }

  // Parse internal storage URL
  const parsed = parseStorageUrl(storageUrl);
  if (!parsed) {
    console.warn("Invalid storage URL format:", storageUrl);
    return null;
  }

  const { bucket, path } = parsed;
  const expiresIn = options.expiresIn || 3600; // Default: 1 hour

  try {
    const supabase = await createSupabaseServerClient();

    // Build transform options for images
    const transformOptions: any = {};
    if (options.transform) {
      if (options.transform.width) transformOptions.width = options.transform.width;
      if (options.transform.height) transformOptions.height = options.transform.height;
      if (options.transform.quality) transformOptions.quality = options.transform.quality;
      if (options.transform.format) transformOptions.format = options.transform.format;
      if (options.transform.resize) transformOptions.resize = options.transform.resize;
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn, {
        download: options.download,
        transform: Object.keys(transformOptions).length > 0 ? transformOptions : undefined,
      });

    if (error) {
      console.error("Failed to create signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
}

/**
 * Generate signed URLs for multiple storage paths in parallel
 */
export async function getSignedStorageUrls(
  storageUrls: (string | null)[],
  options: SignedUrlOptions = {}
): Promise<(string | null)[]> {
  return Promise.all(
    storageUrls.map((url) => getSignedStorageUrl(url, options))
  );
}

/**
 * Predefined presets for signed URLs with transformations
 */
export const SignedUrlPresets = {
  // Small thumbnail with 1 hour expiration
  thumbnailSmall: async (url: string | null) =>
    getSignedStorageUrl(url, {
      expiresIn: 3600,
      transform: {
        width: 200,
        height: 200,
        resize: "cover",
        quality: 75,
        format: "webp",
      },
    }),

  // Medium thumbnail with 1 hour expiration
  thumbnailMedium: async (url: string | null) =>
    getSignedStorageUrl(url, {
      expiresIn: 3600,
      transform: {
        width: 400,
        height: 300,
        resize: "cover",
        quality: 80,
        format: "webp",
      },
    }),

  // Large preview with 2 hour expiration
  previewLarge: async (url: string | null) =>
    getSignedStorageUrl(url, {
      expiresIn: 7200,
      transform: {
        width: 800,
        height: 600,
        resize: "contain",
        quality: 85,
        format: "webp",
      },
    }),

  // Full size with 1 hour expiration
  fullOptimized: async (url: string | null) =>
    getSignedStorageUrl(url, {
      expiresIn: 3600,
      transform: {
        width: 1920,
        height: 1080,
        resize: "contain",
        quality: 90,
        format: "webp",
      },
    }),

  // Download with original filename
  download: async (url: string | null, filename?: string) =>
    getSignedStorageUrl(url, {
      expiresIn: 300, // 5 minutes for downloads
      download: filename || true,
    }),
};

/**
 * Helper to get appropriate signed URL based on asset type and size
 */
export async function getAssetSignedUrl(
  asset: {
    url: string;
    thumbnailUrl: string | null;
    type: string;
  },
  size: "small" | "medium" | "large" = "medium"
): Promise<string | null> {
  // For videos, use thumbnail if available
  if (asset.type === "video") {
    if (asset.thumbnailUrl) {
      return size === "small"
        ? SignedUrlPresets.thumbnailSmall(asset.thumbnailUrl)
        : size === "medium"
          ? SignedUrlPresets.thumbnailMedium(asset.thumbnailUrl)
          : SignedUrlPresets.previewLarge(asset.thumbnailUrl);
    }
    // For videos without thumbnails, return signed URL for video file
    return getSignedStorageUrl(asset.url, { expiresIn: 7200 });
  }

  // For images, transform the main URL
  const previewUrl = asset.thumbnailUrl || asset.url;

  return size === "small"
    ? SignedUrlPresets.thumbnailSmall(previewUrl)
    : size === "medium"
      ? SignedUrlPresets.thumbnailMedium(previewUrl)
      : SignedUrlPresets.previewLarge(previewUrl);
}

/**
 * Check if a URL needs a signed URL (is internal storage URL)
 */
export function isStorageUrl(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith("supabase://storage/");
}

/**
 * Batch process assets to add signed URLs
 * Useful for server-side rendering
 */
export async function enrichAssetsWithSignedUrls<T extends {
  url: string;
  thumbnailUrl: string | null;
}>(
  assets: T[],
  options: SignedUrlOptions = {}
): Promise<(T & { signedUrl: string | null; signedThumbnailUrl: string | null })[]> {
  const urls = assets.map((asset) => asset.url);
  const thumbnailUrls = assets.map((asset) => asset.thumbnailUrl);

  const [signedUrls, signedThumbnailUrls] = await Promise.all([
    getSignedStorageUrls(urls, options),
    getSignedStorageUrls(thumbnailUrls, options),
  ]);

  return assets.map((asset, index) => ({
    ...asset,
    signedUrl: signedUrls[index],
    signedThumbnailUrl: signedThumbnailUrls[index],
  }));
}
