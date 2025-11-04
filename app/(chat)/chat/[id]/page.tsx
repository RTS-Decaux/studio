import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import type { VisibilityType } from "@/components/visibility-selector";
import {
  chatModels,
  DEFAULT_CHAT_MODEL,
  type ChatModelId,
} from "@/lib/ai/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { getUser } from "@/lib/supabase/server";
import type { AppUsage } from "@/lib/usage";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const user = await getUser();

  if (!user) {
    redirect("/api/auth/guest");
  }

  if (chat.visibility === "private") {
    if (!user) {
      return notFound();
    }

    if (user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  const cookieModelValue = chatModelFromCookie?.value;
  const isValidChatModel = (value: string | undefined): value is ChatModelId =>
    Boolean(value && chatModels.some((model) => model.id === value));
  const resolvedChatModel: ChatModelId = isValidChatModel(cookieModelValue)
    ? cookieModelValue
    : DEFAULT_CHAT_MODEL;

  if (!chatModelFromCookie || !isValidChatModel(cookieModelValue)) {
    return (
      <>
        <Chat
          autoResume={true}
          id={chat.id}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialLastContext={
            chat.lastContext ? (chat.lastContext as AppUsage) : undefined
          }
          initialMessages={uiMessages}
          initialVisibilityType={chat.visibility as VisibilityType}
          isReadonly={user?.id !== chat.userId}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={resolvedChatModel}
        initialLastContext={
          chat.lastContext ? (chat.lastContext as AppUsage) : undefined
        }
        initialMessages={uiMessages}
        initialVisibilityType={chat.visibility as VisibilityType}
        isReadonly={user?.id !== chat.userId}
      />
      <DataStreamHandler />
    </>
  );
}
