import type {
  FalGenerationInput,
  FalGenerationOutput,
  FalQueuedResponse,
  FalStatusResponse,
} from "./types";

const FAL_API_KEY = process.env.FAL_API_KEY;
const FAL_API_URL = "https://queue.fal.run";

if (!FAL_API_KEY) {
  console.warn("⚠️  FAL_API_KEY is not set in environment variables");
}

/**
 * Базовый клиент для работы с fal.ai API
 */
class FalClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || FAL_API_KEY || "";
    this.baseUrl = FAL_API_URL;

    if (!this.apiKey) {
      throw new Error("FAL_API_KEY is required to use FalClient");
    }
  }

  /**
   * Отправляет запрос на генерацию в очередь
   */
  async submit(
    modelId: string,
    input: FalGenerationInput
  ): Promise<FalQueuedResponse> {
    const response = await fetch(`${this.baseUrl}/${modelId}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Failed to submit generation: ${response.status} ${error}`
      );
    }

    return response.json();
  }

  /**
   * Проверяет статус генерации
   */
  async getStatus(requestId: string): Promise<FalStatusResponse> {
    const response = await fetch(
      `${this.baseUrl}/requests/${requestId}/status`,
      {
        headers: {
          Authorization: `Key ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get status: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Получает результат генерации
   */
  async getResult(requestId: string): Promise<FalGenerationOutput> {
    const response = await fetch(`${this.baseUrl}/requests/${requestId}`, {
      headers: {
        Authorization: `Key ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get result: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Отменяет генерацию
   */
  async cancel(requestId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/requests/${requestId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Failed to cancel generation: ${response.status} ${error}`
      );
    }
  }

  /**
   * Синхронная генерация (ждёт завершения)
   */
  async run(
    modelId: string,
    input: FalGenerationInput,
    options?: {
      onProgress?: (status: FalStatusResponse) => void;
      pollInterval?: number;
      timeout?: number;
    }
  ): Promise<FalGenerationOutput> {
    const {
      onProgress,
      pollInterval = 2000,
      timeout = 600_000,
    } = options || {};

    // Отправляем в очередь
    const queued = await this.submit(modelId, input);

    const startTime = Date.now();

    // Polling статуса
    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error("Generation timeout");
      }

      const status = await this.getStatus(queued.request_id);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === "COMPLETED") {
        if (!status.response) {
          throw new Error("Generation completed but no response received");
        }
        return status.response;
      }

      if (status.status === "FAILED") {
        throw new Error(
          `Generation failed: ${status.error || "Unknown error"}`
        );
      }

      // Ждём перед следующей проверкой
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Загружает файл в fal.ai storage
   */
  async uploadFile(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://fal.run/storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Key ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload file: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.url;
  }
}

// Singleton instance
let falClientInstance: FalClient | null = null;

export function getFalClient(): FalClient {
  if (!falClientInstance) {
    falClientInstance = new FalClient();
  }
  return falClientInstance;
}

export { FalClient };
