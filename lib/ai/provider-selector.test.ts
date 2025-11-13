import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AVAILABLE_PROVIDERS,
  getConfiguredProviders,
  getDefaultProvider,
  getProviderDisplayName,
  isProviderConfigured,
  isValidProvider,
  type ProviderId,
  resolveProvider,
  selectBestProvider,
  selectProvider,
  validateProviderConfig,
} from "./provider-selector";

describe("Provider Selector", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore env after each test
    process.env = originalEnv;
  });

  describe("isValidProvider", () => {
    it("should validate openai provider", () => {
      expect(isValidProvider("openai")).toBe(true);
    });

    it("should validate gemini provider", () => {
      expect(isValidProvider("gemini")).toBe(true);
    });

    it("should reject invalid provider", () => {
      expect(isValidProvider("invalid")).toBe(false);
    });

    it("should reject non-string values", () => {
      expect(isValidProvider(123)).toBe(false);
      expect(isValidProvider(null)).toBe(false);
      expect(isValidProvider(undefined)).toBe(false);
      expect(isValidProvider({})).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidProvider("")).toBe(false);
    });
  });

  describe("getDefaultProvider", () => {
    it("should return openai as default fallback", () => {
      process.env.AI_DEFAULT_PROVIDER = undefined;
      expect(getDefaultProvider()).toBe("openai");
    });

    it("should return gemini from env", () => {
      process.env.AI_DEFAULT_PROVIDER = "gemini";
      expect(getDefaultProvider()).toBe("gemini");
    });

    it("should return openai from env", () => {
      process.env.AI_DEFAULT_PROVIDER = "openai";
      expect(getDefaultProvider()).toBe("openai");
    });

    it("should fallback to openai if env has invalid value", () => {
      process.env.AI_DEFAULT_PROVIDER = "invalid";
      expect(getDefaultProvider()).toBe("openai");
    });

    it("should handle empty string in env", () => {
      process.env.AI_DEFAULT_PROVIDER = "";
      expect(getDefaultProvider()).toBe("openai");
    });
  });

  describe("resolveProvider", () => {
    it("should return valid provider", () => {
      expect(resolveProvider("openai")).toBe("openai");
      expect(resolveProvider("gemini")).toBe("gemini");
    });

    it("should use custom fallback for invalid provider", () => {
      expect(resolveProvider("invalid", "gemini")).toBe("gemini");
    });

    it("should use default provider when no fallback specified", () => {
      process.env.AI_DEFAULT_PROVIDER = undefined;
      expect(resolveProvider("invalid")).toBe("openai");
    });

    it("should use env default when no fallback specified", () => {
      process.env.AI_DEFAULT_PROVIDER = "gemini";
      expect(resolveProvider("invalid")).toBe("gemini");
    });

    it("should handle null/undefined", () => {
      expect(resolveProvider(null)).toBe("openai");
      expect(resolveProvider(undefined)).toBe("openai");
    });
  });

  describe("getProviderDisplayName", () => {
    it("should return display names", () => {
      expect(getProviderDisplayName("openai")).toBe("OpenAI");
      expect(getProviderDisplayName("gemini")).toBe("Google Gemini");
    });
  });

  describe("isProviderConfigured", () => {
    it("should detect openai configuration", () => {
      process.env.OPENAI_API_KEY = "test-key";
      expect(isProviderConfigured("openai")).toBe(true);
    });

    it("should detect gemini configuration", () => {
      process.env.GEMINI_API_KEY = "test-key";
      expect(isProviderConfigured("gemini")).toBe(true);
    });

    it("should return false when not configured", () => {
      process.env.OPENAI_API_KEY = undefined;
      expect(isProviderConfigured("openai")).toBe(false);
    });

    it("should handle empty string as not configured", () => {
      process.env.OPENAI_API_KEY = "";
      expect(isProviderConfigured("openai")).toBe(false);
    });
  });

  describe("getConfiguredProviders", () => {
    it("should return empty array when none configured", () => {
      process.env.OPENAI_API_KEY = undefined;
      process.env.GEMINI_API_KEY = undefined;
      expect(getConfiguredProviders()).toEqual([]);
    });

    it("should return only openai when configured", () => {
      process.env.OPENAI_API_KEY = "test-key";
      process.env.GEMINI_API_KEY = undefined;
      expect(getConfiguredProviders()).toEqual(["openai"]);
    });

    it("should return only gemini when configured", () => {
      process.env.OPENAI_API_KEY = undefined;
      process.env.GEMINI_API_KEY = "test-key";
      expect(getConfiguredProviders()).toEqual(["gemini"]);
    });

    it("should return both when both configured", () => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
      expect(getConfiguredProviders()).toEqual(["openai", "gemini"]);
    });
  });

  describe("validateProviderConfig", () => {
    it("should not throw when provider is configured", () => {
      process.env.OPENAI_API_KEY = "test-key";
      expect(() => validateProviderConfig("openai")).not.toThrow();
    });

    it("should throw when openai not configured", () => {
      process.env.OPENAI_API_KEY = undefined;
      expect(() => validateProviderConfig("openai")).toThrow(
        'Provider "openai" is not configured. Missing API key: OPENAI_API_KEY'
      );
    });

    it("should throw when gemini not configured", () => {
      process.env.GEMINI_API_KEY = undefined;
      expect(() => validateProviderConfig("gemini")).toThrow(
        'Provider "gemini" is not configured. Missing API key: GEMINI_API_KEY'
      );
    });
  });

  describe("selectBestProvider", () => {
    it("should return preferred provider when configured", () => {
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
      expect(selectBestProvider("gemini")).toBe("gemini");
    });

    it("should fallback when preferred not configured", () => {
      process.env.OPENAI_API_KEY = "test-key";
      process.env.GEMINI_API_KEY = undefined;
      expect(selectBestProvider("gemini")).toBe("openai");
    });

    it("should use default provider when no preference", () => {
      process.env.AI_DEFAULT_PROVIDER = "gemini";
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
      expect(selectBestProvider()).toBe("gemini");
    });

    it("should use first configured when default not available", () => {
      process.env.AI_DEFAULT_PROVIDER = undefined;
      process.env.OPENAI_API_KEY = undefined;
      process.env.GEMINI_API_KEY = "test-key";
      expect(selectBestProvider()).toBe("gemini");
    });

    it("should throw when no providers configured", () => {
      process.env.OPENAI_API_KEY = undefined;
      process.env.GEMINI_API_KEY = undefined;
      expect(() => selectBestProvider()).toThrow("No AI providers configured");
    });
  });

  describe("selectProvider", () => {
    beforeEach(() => {
      // Default setup: both providers configured
      process.env.OPENAI_API_KEY = "test-key-1";
      process.env.GEMINI_API_KEY = "test-key-2";
    });

    it("should select specified valid provider", () => {
      expect(selectProvider({ provider: "gemini" })).toBe("gemini");
    });

    it("should validate provider by default", () => {
      process.env.GEMINI_API_KEY = undefined;
      expect(() => selectProvider({ provider: "gemini" })).toThrow(
        "not configured"
      );
    });

    it("should skip validation when disabled", () => {
      process.env.GEMINI_API_KEY = undefined;
      expect(selectProvider({ provider: "gemini", validate: false })).toBe(
        "gemini"
      );
    });

    it("should fallback on invalid provider with fallback=true", () => {
      expect(
        selectProvider({ provider: "invalid" as ProviderId, fallback: true })
      ).toBe("openai");
    });

    it("should throw on invalid provider with fallback=false", () => {
      expect(() =>
        selectProvider({ provider: "invalid" as ProviderId, fallback: false })
      ).toThrow("Invalid provider: invalid");
    });

    it("should select best provider when no provider specified", () => {
      process.env.AI_DEFAULT_PROVIDER = "gemini";
      expect(selectProvider()).toBe("gemini");
    });

    it("should work with empty options", () => {
      process.env.AI_DEFAULT_PROVIDER = "openai";
      expect(selectProvider({})).toBe("openai");
    });

    it("should work without options parameter", () => {
      expect(() => selectProvider()).not.toThrow();
    });

    it("should respect validate:false with invalid config", () => {
      process.env.OPENAI_API_KEY = undefined;
      expect(selectProvider({ provider: "openai", validate: false })).toBe(
        "openai"
      );
    });
  });

  describe("AVAILABLE_PROVIDERS constant", () => {
    it("should contain openai and gemini", () => {
      expect(AVAILABLE_PROVIDERS).toContain("openai");
      expect(AVAILABLE_PROVIDERS).toContain("gemini");
    });

    it("should have exactly 2 providers", () => {
      expect(AVAILABLE_PROVIDERS).toHaveLength(2);
    });
  });
});
