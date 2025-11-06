import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import {
  getDefaultProvider,
  type ProviderId,
  validateProviderConfig,
} from "./provider-selector";

const MODEL_REGISTRY = {
  "chat-model": {
    openai: "gpt-5-mini",
    gemini: "gemini-2.5-flash",
  },
  "chat-model-reasoning": {
    openai: "gpt-5",
    gemini: "gemini-2.5-pro",
  },
  "chat-model-fast": {
    openai: "gpt-5-nano",
    gemini: "gemini-2.5-flash-lite",
  },
  "title-model": {
    openai: "gpt-5-nano",
    gemini: "gemini-2.5-flash-lite",
  },
  "artifact-model": {
    openai: "gpt-5-mini",
    gemini: "gemini-2.5-flash",
  },
} as const;

type ModelId = keyof typeof MODEL_REGISTRY;
const DEFAULT_PROVIDER: ProviderId = getDefaultProvider();

function getOpenAIApiKey() {
  validateProviderConfig("openai");
  return process.env.OPENAI_API_KEY!;
}

function getGeminiApiKey() {
  validateProviderConfig("gemini");
  return process.env.GEMINI_API_KEY!;
}

type OpenAIProviderInstance = ReturnType<typeof createOpenAI>;
type GeminiProviderInstance = ReturnType<typeof createGoogleGenerativeAI>;
type TestProviderInstance = ReturnType<typeof customProvider>;

let openaiProviderSingleton: OpenAIProviderInstance | undefined;
let geminiProviderSingleton: GeminiProviderInstance | undefined;
let testProviderSingleton: TestProviderInstance | undefined;

function getOpenAIProvider() {
  if (!openaiProviderSingleton) {
    openaiProviderSingleton = createOpenAI({
      apiKey: getOpenAIApiKey(),
    });
  }
  return openaiProviderSingleton;
}

function getGeminiProvider() {
  if (!geminiProviderSingleton) {
    geminiProviderSingleton = createGoogleGenerativeAI({
      apiKey: getGeminiApiKey(),
    });
  }
  return geminiProviderSingleton;
}

function getProvider(providerId: ProviderId) {
  return providerId === "gemini" ? getGeminiProvider() : getOpenAIProvider();
}

function resolveModelId(modelId: ModelId, providerId: ProviderId) {
  const mapping = MODEL_REGISTRY[modelId];
  if (!mapping) {
    throw new Error(`Unsupported model id: ${modelId}`);
  }
  const providerModelId = mapping[providerId];
  if (!providerModelId) {
    throw new Error(
      `Model ${modelId} is not available for provider ${providerId}`,
    );
  }
  return providerModelId;
}

export const AVAILABLE_MODEL_PROVIDERS: ProviderId[] = ["openai", "gemini"];

const createLanguageModelResolver = () => {
  return (modelId: ModelId, providerId: ProviderId = DEFAULT_PROVIDER) => {
    const provider = getProvider(providerId);
    const providerModelId = resolveModelId(modelId, providerId);
    return provider.languageModel(providerModelId);
  };
};

if (isTestEnvironment) {
  const {
    artifactModel,
    chatModel,
    fastModel,
    reasoningModel,
    titleModel,
  } = require("./models.mock");

  testProviderSingleton = customProvider({
    languageModels: {
      "chat-model": chatModel,
      "chat-model-reasoning": reasoningModel,
      "chat-model-fast": fastModel,
      "title-model": titleModel,
      "artifact-model": artifactModel,
    },
  });
}

export const openaiProvider = () =>
  (isTestEnvironment ? testProviderSingleton : getOpenAIProvider()) as
    | OpenAIProviderInstance
    | TestProviderInstance;
export const geminiProvider = () =>
  (isTestEnvironment ? testProviderSingleton : getGeminiProvider()) as
    | GeminiProviderInstance
    | TestProviderInstance;

export const myProvider = isTestEnvironment
  ? (testProviderSingleton as ReturnType<typeof customProvider>)
  : {
    languageModel: createLanguageModelResolver(),
    defaultProvider: DEFAULT_PROVIDER,
    resolveProvider(providerId: ProviderId = DEFAULT_PROVIDER) {
      return getProvider(providerId);
    },
  };

export { MODEL_REGISTRY as MODEL_PROVIDER_REGISTRY };
export type { ModelId as RegisteredModelId, ProviderId as ModelProviderId };

// Re-export provider selector utilities for use in components
export {
  AVAILABLE_PROVIDERS,
  getConfiguredProviders,
  getDefaultProvider,
  getProviderDisplayName,
  isProviderConfigured,
  isValidProvider,
  selectProvider,
} from "./provider-selector";
