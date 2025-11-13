"use client";

import { useEffect, useState } from "react";

type UseSignedUrlOptions = {
  enabled?: boolean;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "origin" | "webp" | "avif";
    resize?: "cover" | "contain" | "fill";
  };
  download?: boolean | string;
};

/**
 * Hook to generate and cache signed URLs for storage assets
 * Automatically regenerates before expiration
 */
export function useSignedUrl(
  storageUrl: string | null,
  options: UseSignedUrlOptions = {}
) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enabled = options.enabled !== false;

  useEffect(() => {
    if (!storageUrl || !enabled) {
      setSignedUrl(null);
      return;
    }

    // If it's already a full URL, use it directly
    if (storageUrl.startsWith("http://") || storageUrl.startsWith("https://")) {
      setSignedUrl(storageUrl);
      return;
    }

    let cancelled = false;

    async function generateSignedUrl() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/studio/assets/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: storageUrl,
            transform: options.transform,
            expiresIn: 3600, // 1 hour
            download: options.download,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate signed URL");
        }

        const data = await response.json();

        if (!cancelled) {
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          console.error("Failed to generate signed URL:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    generateSignedUrl();

    // Refresh signed URL before expiration (at 50 minutes for 1 hour URLs)
    const refreshInterval = setInterval(
      () => {
        generateSignedUrl();
      },
      50 * 60 * 1000
    ); // 50 minutes

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [storageUrl, enabled, options.transform, options.download]);

  return { signedUrl, loading, error };
}

/**
 * Hook for multiple signed URLs
 */
export function useSignedUrls(
  storageUrls: (string | null)[],
  options: UseSignedUrlOptions = {}
) {
  const [signedUrls, setSignedUrls] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enabled = options.enabled !== false;

  useEffect(() => {
    if (!storageUrls.length || !enabled) {
      setSignedUrls([]);
      return;
    }

    let cancelled = false;

    async function generateSignedUrls() {
      setLoading(true);
      setError(null);

      try {
        // Filter out already-full URLs
        const urlsToSign = storageUrls.map((url) => {
          if (
            url &&
            (url.startsWith("http://") || url.startsWith("https://"))
          ) {
            return null; // Already a full URL
          }
          return url;
        });

        const response = await fetch("/api/studio/assets/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: urlsToSign,
            transform: options.transform,
            expiresIn: 3600,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate signed URLs");
        }

        const data = await response.json();

        if (!cancelled) {
          // Merge signed URLs with original full URLs
          const merged = storageUrls.map((originalUrl, index) => {
            if (
              originalUrl &&
              (originalUrl.startsWith("http://") ||
                originalUrl.startsWith("https://"))
            ) {
              return originalUrl;
            }
            return data.signedUrls[index];
          });
          setSignedUrls(merged);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          console.error("Failed to generate signed URLs:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    generateSignedUrls();

    const refreshInterval = setInterval(
      () => {
        generateSignedUrls();
      },
      50 * 60 * 1000
    );

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [enabled, options.transform, storageUrls.length, storageUrls.map]);

  return { signedUrls, loading, error };
}

/**
 * Hook for asset with appropriate size transformation
 */
export function useAssetSignedUrl(
  asset: {
    url: string;
    thumbnailUrl: string | null;
    type: string;
  } | null,
  size: "small" | "medium" | "large" = "medium"
) {
  const transform = {
    small: {
      width: 200,
      height: 200,
      resize: "cover" as const,
      quality: 75,
      format: "webp" as const,
    },
    medium: {
      width: 400,
      height: 300,
      resize: "cover" as const,
      quality: 80,
      format: "webp" as const,
    },
    large: {
      width: 800,
      height: 600,
      resize: "contain" as const,
      quality: 85,
      format: "webp" as const,
    },
  }[size];

  // For videos, use thumbnail if available
  const urlToSign = asset
    ? asset.type === "video" && asset.thumbnailUrl
      ? asset.thumbnailUrl
      : asset.url
    : null;

  return useSignedUrl(urlToSign, {
    transform: asset?.type === "image" ? transform : undefined,
  });
}
