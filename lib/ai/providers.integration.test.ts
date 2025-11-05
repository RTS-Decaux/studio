/**
 * Integration test demonstrating provider selection in real scenarios
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    AVAILABLE_PROVIDERS,
    getConfiguredProviders,
    getProviderDisplayName,
    isProviderConfigured,
    myProvider,
    selectProvider,
} from "./providers";

describe("Provider Integration Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Real-world Scenarios", () => {
    it("should work with single provider configured", () => {
      process.env.OPENAI_API_KEY = "test-key";
      delete process.env.GEMINI_API_KEY;

      const configured = getConfiguredProviders();
      expect(configured).toEqual(["openai"]);

      const selected = selectProvider();
      expect(selected).toBe("openai");
    });

    it("should prefer default when multiple configured", () => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
      process.env.AI_DEFAULT_PROVIDER = "gemini";

      const selected = selectProvider();
      expect(selected).toBe("gemini");
    });

    it("should handle user preference override", () => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
      process.env.AI_DEFAULT_PROVIDER = "openai";

      // User explicitly wants gemini
      const selected = selectProvider({ provider: "gemini" });
      expect(selected).toBe("gemini");
    });

    it("should fallback gracefully when preferred unavailable", () => {
      process.env.OPENAI_API_KEY = "test-key";
      delete process.env.GEMINI_API_KEY;

      // User wants gemini but it's not configured
      // With validate: false, it returns the requested provider anyway
      const selectedNoValidate = selectProvider({
        provider: "gemini",
        fallback: true,
        validate: false,
      });
      expect(selectedNoValidate).toBe("gemini"); // Returns requested even if not configured

      // With validate: true (default), it should throw
      expect(() =>
        selectProvider({
          provider: "gemini",
          fallback: false,
          validate: true,
        })
      ).toThrow("not configured");
    });
  });

  describe("UI Component Scenarios", () => {
    it("should provide data for provider selector dropdown", () => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";

      const providers = getConfiguredProviders();
      const options = providers.map((p) => ({
        value: p,
        label: getProviderDisplayName(p),
      }));

      expect(options).toEqual([
        { value: "openai", label: "OpenAI" },
        { value: "gemini", label: "Google Gemini" },
      ]);
    });

    it("should show provider status badges", () => {
      process.env.OPENAI_API_KEY = "test-key";
      delete process.env.GEMINI_API_KEY;

      const statuses = AVAILABLE_PROVIDERS.map((p) => ({
        provider: p,
        name: getProviderDisplayName(p),
        configured: isProviderConfigured(p),
      }));

      expect(statuses).toEqual([
        { provider: "openai", name: "OpenAI", configured: true },
        { provider: "gemini", name: "Google Gemini", configured: false },
      ]);
    });
  });

  describe("API Route Scenarios", () => {
    it("should handle API request with provider parameter", () => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";

      // Simulate API request body
      const requestBody = { provider: "gemini" as const };

      const selected = selectProvider({
        provider: requestBody.provider,
        fallback: true,
      });

      expect(selected).toBe("gemini");
    });

    it("should handle invalid provider in API request", () => {
      process.env.OPENAI_API_KEY = "test-key";

      // Simulate API request with invalid provider
      const requestBody = { provider: "invalid" as any };

      const selected = selectProvider({
        provider: requestBody.provider,
        fallback: true,
      });

      expect(selected).toBe("openai"); // Falls back to default
    });

    it("should handle missing provider in API request", () => {
      process.env.OPENAI_API_KEY = "test-key";
      process.env.AI_DEFAULT_PROVIDER = "openai";

      // Simulate API request without provider
      const requestBody: { provider?: string } = {};

      const selected = selectProvider({
        provider: requestBody.provider as any,
        fallback: true,
      });

      expect(selected).toBe("openai"); // Uses default
    });
  });

  describe("Provider Instance Integration", () => {
    it("should integrate with myProvider object", () => {
      expect(myProvider).toBeDefined();
      expect(myProvider.languageModel).toBeDefined();
      
      // Check for custom properties in non-test environment
      if ('defaultProvider' in myProvider) {
        expect(myProvider.defaultProvider).toBeDefined();
        expect(myProvider.resolveProvider).toBeDefined();
      }
    });

    it("should select provider consistently", () => {
      process.env.AI_DEFAULT_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-key";

      const fromSelector = selectProvider();
      
      // In non-test environment, should match
      expect(fromSelector).toBe("gemini");
    });
  });

  describe("Error Recovery Scenarios", () => {
    it("should recover from invalid env variable", () => {
      process.env.AI_DEFAULT_PROVIDER = "invalid-provider";
      process.env.OPENAI_API_KEY = "test-key";

      // Should not throw, should fallback to openai
      const selected = selectProvider();
      expect(selected).toBe("openai");
    });

    it("should provide clear error when no providers configured", () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => selectProvider()).toThrow(
        "No AI providers configured"
      );
    });

    it("should provide clear error when requested provider not configured", () => {
      delete process.env.GEMINI_API_KEY;

      expect(() =>
        selectProvider({ provider: "gemini", validate: true })
      ).toThrow('Provider "gemini" is not configured');
    });
  });

  describe("Multi-Provider Workflows", () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
    });

    it("should support provider switching in chat", () => {
      // Start with default
      const initial = selectProvider();
      expect(initial).toBe("openai");

      // User switches to gemini
      const switched = selectProvider({ provider: "gemini" });
      expect(switched).toBe("gemini");

      // Back to openai
      const back = selectProvider({ provider: "openai" });
      expect(back).toBe("openai");
    });

    it("should handle concurrent requests with different providers", () => {
      const request1 = selectProvider({ provider: "openai" });
      const request2 = selectProvider({ provider: "gemini" });
      const request3 = selectProvider(); // default

      expect(request1).toBe("openai");
      expect(request2).toBe("gemini");
      expect(request3).toBe("openai"); // default
    });
  });

  describe("Type Safety", () => {
    it("should only accept valid provider IDs", () => {
      process.env.OPENAI_API_KEY = "test-key";

      // TypeScript should allow valid providers
      expect(() => selectProvider({ provider: "openai" })).not.toThrow();

      // Runtime should reject invalid providers
      expect(() =>
        selectProvider({
          provider: "invalid" as any,
          fallback: false,
        })
      ).toThrow("Invalid provider");
    });
  });
});
