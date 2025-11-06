
import type { QueueStatus } from "@fal-ai/client";
import { fal } from "@fal-ai/client";
import type {
    FalClientError,
    FalGenerationInput,
    FalGenerationOutput,
    FalGenerationStatus,
    FalResult,
    FalRunOptions,
    FalStatusResult,
    FalSubmitResult,
} from "./types";

/**
 * Official fal.ai SDK client wrapper
 *
 * Provides a clean, type-safe interface over @fal-ai/client SDK
 * with consistent error handling and response normalization.
 *
 * @example
 * ```typescript
 * const client = new FalClient();
 * const result = await client.run("fal-ai/flux/schnell", { prompt: "cat" });
 * ```
 */
export class FalClient {
    private readonly apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.FAL_API_KEY || "";

        if (!this.apiKey) {
            throw this.createError(
                "FAL_API_KEY not configured. Set FAL_API_KEY environment variable or pass apiKey to constructor.",
                "MISSING_API_KEY",
            );
        }

        // Configure fal SDK
        fal.config({
            credentials: this.apiKey,
        });
    }

    /**
     * Submit generation to queue (async)
     *
     * Returns immediately with request_id. Use getStatus() or getResult() to poll.
     *
     * @example
     * ```typescript
     * const { requestId } = await client.submit("fal-ai/flux/schnell", {
     *   prompt: "a cat",
     *   num_inference_steps: 4
     * });
     * ```
     */
    async submit(
        modelId: string,
        input: FalGenerationInput,
        webhookUrl?: string,
    ): Promise<FalSubmitResult> {
        try {
            const response = await fal.queue.submit(modelId, {
                input: input as Record<string, unknown>,
                webhookUrl,
            });

            return {
                requestId: response.request_id,
                statusUrl: response.status_url,
            };
        } catch (error) {
            throw this.handleError(error, "submit", { modelId, input });
        }
    }

    /**
     * Get generation status
     *
     * @example
     * ```typescript
     * const status = await client.getStatus("fal-ai/flux/schnell", requestId);
     * console.log(status.status); // "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED"
     * ```
     */
    async getStatus(
        modelId: string,
        requestId: string,
        includeLogs = true,
    ): Promise<FalStatusResult> {
        try {
            const status = await fal.queue.status(modelId, {
                requestId,
                logs: includeLogs,
            });

            return this.normalizeStatus(status);
        } catch (error) {
            throw this.handleError(error, "getStatus", { modelId, requestId });
        }
    }

    /**
     * Get generation result (only when completed)
     *
     * @throws {FalClientError} if generation is not completed yet
     */
    async getResult(
        modelId: string,
        requestId: string,
    ): Promise<FalGenerationOutput> {
        try {
            const result: FalResult<FalGenerationOutput> = await fal.queue
                .result(
                    modelId,
                    { requestId },
                );

            return result.data;
        } catch (error) {
            throw this.handleError(error, "getResult", { modelId, requestId });
        }
    }

    /**
     * Cancel generation
     *
     * Note: SDK doesn't expose cancel() yet, using direct HTTP call
     */
    async cancel(modelId: string, requestId: string): Promise<void> {
        try {
            const response = await fetch(
                `https://queue.fal.run/${modelId}/requests/${requestId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Key ${this.apiKey}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }
        } catch (error) {
            throw this.handleError(error, "cancel", { modelId, requestId });
        }
    }

    /**
     * Run generation with automatic polling (sync)
     *
     * This uses fal.subscribe() which polls automatically until completion.
     * Recommended for most use cases.
     *
     * @example
     * ```typescript
     * const result = await client.run("fal-ai/flux/schnell", {
     *   prompt: "a cat"
     * }, {
     *   onProgress: (status) => console.log(status.status)
     * });
     * ```
     */
    async run(
        modelId: string,
        input: FalGenerationInput,
        options?: FalRunOptions,
    ): Promise<FalGenerationOutput> {
        const {
            onProgress,
            pollInterval = 2000,
            timeout = 600_000,
            webhookUrl,
            logs = true,
        } = options || {};

        try {
            const subscribeOptions: any = {
                input: input as Record<string, unknown>,
                logs,
                pollInterval,
                webhookUrl,
            };

            // Add progress callback if provided
            if (onProgress) {
                subscribeOptions.onQueueUpdate = (update: QueueStatus) => {
                    onProgress(this.normalizeStatus(update));
                };
            }

            const result: FalResult<FalGenerationOutput> = await fal.subscribe(
                modelId,
                subscribeOptions,
            );

            return result.data;
        } catch (error) {
            throw this.handleError(error, "run", { modelId, input });
        }
    }

    /**
     * Upload file to fal.ai storage
     *
     * Returns a URL that can be used in generation requests.
     *
     * @example
     * ```typescript
     * const file = new File(["..."], "image.png");
     * const url = await client.uploadFile(file);
     * // Use url in generation: { image_url: url }
     * ```
     */
    async uploadFile(file: File | Blob): Promise<string> {
        try {
            const url = await fal.storage.upload(file);
            return url;
        } catch (error) {
            throw this.handleError(error, "uploadFile", {
                fileSize: file.size,
            });
        }
    }

    /**
     * Normalize status response from fal SDK to our domain types
     */
    private normalizeStatus(status: any): FalStatusResult {
        return {
            status: this.normalizeStatusString(status.status),
            completedAt: status.completed_at,
            startedAt: status.started_at,
            logs: status.logs || [],
            metrics: status.metrics,
            position: status.position,
            result: status.data,
            error: status.error,
        };
    }

    /**
     * Normalize status string to domain enum
     */
    private normalizeStatusString(status: string): FalGenerationStatus {
        // Map any unknown statuses to closest match
        const upperStatus = status.toUpperCase();

        if (upperStatus.includes("QUEUE")) return "IN_QUEUE";
        if (upperStatus.includes("PROGRESS")) return "IN_PROGRESS";
        if (upperStatus.includes("COMPLETE")) return "COMPLETED";
        if (upperStatus.includes("FAIL")) return "FAILED";
        if (upperStatus.includes("CANCEL")) return "CANCELLED";

        // Default to IN_QUEUE for unknown statuses
        return "IN_QUEUE";
    }

    /**
     * Create a FalClientError
     */
    private createError(
        message: string,
        code: string,
        statusCode?: number,
        details?: unknown,
    ): Error {
        const FalClientError = (
            require("./types") as typeof import("./types")
        ).FalClientError;
        return new FalClientError(message, code, statusCode, details);
    }

    /**
     * Unified error handling
     */
    private handleError(
        error: unknown,
        operation: string,
        context?: Record<string, unknown>,
    ): Error {
        // Already a FalClientError
        if (error instanceof Error && error.name === "FalClientError") {
            return error;
        }

        const err = error as any;
        const message = err.message ||
            err.error?.message ||
            `fal.ai ${operation} operation failed`;
        const code = err.code || `FAL_${operation.toUpperCase()}_ERROR`;
        const statusCode = err.statusCode || err.status || err.response?.status;

        console.error(`[FalClient] ${operation} failed:`, {
            message,
            code,
            statusCode,
            context,
            originalError: err,
        });

        return this.createError(message, code, statusCode, {
            operation,
            context,
            originalError: err.message || String(err),
        });
    }
}
