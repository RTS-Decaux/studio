export const chatModels = [
  {
    id: "chat-model",
    name: "Chat — Balanced",
    description: "Multimodal, high-quality responses suitable for most tasks",
  },
  {
    id: "chat-model-reasoning",
    name: "Chat — Reasoning",
    description: "Enhanced chain-of-thought for complex or analytical prompts",
  },
  {
    id: "chat-model-fast",
    name: "Chat — Fast",
    description:
      "Lower-latency model tuned for quick replies and iterative workflows",
  },
] as const;

export type ChatModel = (typeof chatModels)[number];
export type ChatModelId = ChatModel["id"];

export const DEFAULT_CHAT_MODEL: ChatModelId = "chat-model";
