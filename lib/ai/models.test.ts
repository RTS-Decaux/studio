import { getResponseChunksByPrompt } from "@/tests/prompts/utils";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";

export const chatModel = new MockLanguageModelV3({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: "Hello, world!" }],
    warnings: [],
  }),
  doStream: async ({ prompt }: any) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: getResponseChunksByPrompt(prompt),
    }) as any,
    request: { body: null },
    response: { headers: {} },
  }),
});

export const reasoningModel = new MockLanguageModelV3({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: "Hello, world!" }],
    warnings: [],
  }),
  doStream: async ({ prompt }: any) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: getResponseChunksByPrompt(prompt, true),
    }) as any,
    request: { body: null },
    response: { headers: {} },
  }),
});

export const titleModel = new MockLanguageModelV3({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: "This is a test title" }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: [
        { id: "1", type: "text-start" },
        { id: "1", type: "text-delta", delta: "This is a test title" },
        { id: "1", type: "text-end" },
        {
          type: "finish",
          finishReason: "stop",
          usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
        },
      ],
    }) as any,
    request: { body: null },
    response: { headers: {} },
  }),
});

export const artifactModel = new MockLanguageModelV3({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: "Hello, world!" }],
    warnings: [],
  }),
  doStream: async ({ prompt }: any) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 50,
      initialDelayInMs: 100,
      chunks: getResponseChunksByPrompt(prompt),
    }) as any,
    request: { body: null },
    response: { headers: {} },
  }),
});
