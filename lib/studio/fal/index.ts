/**
 * fal.ai Official SDK Integration
 *
 * Public API for fal.ai client operations
 *
 * @module lib/studio/fal
 */

import { FalClient } from "./client";

// Singleton instance
let clientInstance: FalClient | null = null;

/**
 * Get singleton fal.ai client instance
 *
 * Uses FAL_API_KEY from environment by default.
 *
 * @example
 * ```typescript
 * import { getFalClient } from "@/lib/studio/fal";
 *
 * const client = getFalClient();
 * const result = await client.run("fal-ai/flux/schnell", {
 *   prompt: "a beautiful cat"
 * });
 * ```
 */
export function getFalClient(): FalClient {
  if (!clientInstance) {
    clientInstance = new FalClient();
  }
  return clientInstance;
}

/**
 * Create new client with custom API key
 *
 * Useful for testing or multi-tenant scenarios.
 *
 * @example
 * ```typescript
 * const client = createFalClient("my-custom-key");
 * ```
 */
export function createFalClient(apiKey: string): FalClient {
  return new FalClient(apiKey);
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetFalClient(): void {
  clientInstance = null;
}

// Re-export types
export type {
  FalClientError,
  FalGenerationInput,
  FalGenerationOutput,
  FalGenerationStatus,
  FalImageInfo,
  FalLogEntry,
  FalMetrics,
  FalResult,
  FalRunOptions,
  FalStatusResult,
  FalSubmitResult,
  FalVideoInfo,
} from "./types";

// Re-export client class
export { FalClient } from "./client";
