/**
 * Provider Selector Utility
 *
 * Manages AI provider selection with type-safe validation and fallbacks
 */

export type ProviderId = "openai" | "gemini";

export const AVAILABLE_PROVIDERS: readonly ProviderId[] = [
  "openai",
  "gemini",
] as const;

/**
 * Validates if a provider ID is supported
 */
export function isValidProvider(provider: unknown): provider is ProviderId {
  return (
    typeof provider === "string" &&
    AVAILABLE_PROVIDERS.includes(provider as ProviderId)
  );
}

/**
 * Gets the default provider from environment or fallback
 */
export function getDefaultProvider(): ProviderId {
  const envProvider = process.env.AI_DEFAULT_PROVIDER;

  if (envProvider && isValidProvider(envProvider)) {
    return envProvider;
  }

  return "openai"; // Fallback to OpenAI
}

/**
 * Validates and returns a provider, with fallback to default
 */
export function resolveProvider(
  provider: unknown,
  fallback?: ProviderId,
): ProviderId {
  if (isValidProvider(provider)) {
    return provider;
  }

  return fallback ?? getDefaultProvider();
}

/**
 * Gets provider display name for UI
 */
export function getProviderDisplayName(provider: ProviderId): string {
  const names: Record<ProviderId, string> = {
    openai: "OpenAI",
    gemini: "Google Gemini",
  };

  return names[provider];
}

/**
 * Checks if provider API key is configured
 */
export function isProviderConfigured(provider: ProviderId): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "gemini":
      return !!process.env.GEMINI_API_KEY;
    default:
      return false;
  }
}

/**
 * Gets list of configured providers
 */
export function getConfiguredProviders(): ProviderId[] {
  return AVAILABLE_PROVIDERS.filter(isProviderConfigured);
}

/**
 * Validates provider and throws if not configured
 */
export function validateProviderConfig(provider: ProviderId): void {
  if (!isProviderConfigured(provider)) {
    throw new Error(
      `Provider "${provider}" is not configured. Missing API key: ${
        provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY"
      }`,
    );
  }
}

/**
 * Selects best available provider
 * Prefers the requested provider, falls back to configured ones
 */
export function selectBestProvider(
  preferredProvider?: ProviderId,
): ProviderId {
  // If preferred provider is configured, use it
  if (preferredProvider && isProviderConfigured(preferredProvider)) {
    return preferredProvider;
  }

  // Get all configured providers
  const configured = getConfiguredProviders();

  if (configured.length === 0) {
    throw new Error(
      "No AI providers configured. Please set OPENAI_API_KEY or GEMINI_API_KEY",
    );
  }

  // Return first configured provider (prefer default if available)
  const defaultProvider = getDefaultProvider();
  return configured.includes(defaultProvider) ? defaultProvider : configured[0];
}

/**
 * Provider selection options
 */
export interface ProviderOptions {
  provider?: ProviderId;
  fallback?: boolean;
  validate?: boolean;
}

/**
 * Main provider selection function with options
 */
export function selectProvider(options: ProviderOptions = {}): ProviderId {
  const {
    provider: requestedProvider,
    fallback = true,
    validate = true,
  } = options;

  // If provider specified, validate it
  if (requestedProvider) {
    if (!isValidProvider(requestedProvider)) {
      if (fallback) {
        return getDefaultProvider();
      }
      throw new Error(`Invalid provider: ${requestedProvider}`);
    }

    if (validate) {
      validateProviderConfig(requestedProvider);
    }

    return requestedProvider;
  }

  // No provider specified, select best available
  return selectBestProvider();
}
