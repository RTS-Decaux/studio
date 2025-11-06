"use server";

import { generateText, type LanguageModel, type UIMessage } from "ai";
import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import type { ChatModelId } from "@/lib/ai/models";
import { titlePrompt } from "@/lib/ai/prompts";
import { type ModelProviderId, myProvider } from "@/lib/ai/providers";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
} from "@/lib/db/queries";
import { getTextFromMessage } from "@/lib/utils";

export async function saveChatModelAsCookie(model: ChatModelId) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function saveProviderAsCookie(provider: ModelProviderId) {
  const cookieStore = await cookies();
  cookieStore.set("ai-provider", provider);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const model = myProvider.languageModel("title-model") as LanguageModel;

  const { text: title } = await generateText({
    model,
    system: titlePrompt,
    prompt: getTextFromMessage(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
