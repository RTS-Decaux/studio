import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import {
  chatModels,
  DEFAULT_CHAT_MODEL,
  type ChatModelId,
} from "@/lib/ai/models";
import { getSession } from "@/lib/supabase/server";
import { generateUUID } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const cookieModelValue = modelIdFromCookie?.value;
  const isValidChatModel = (value: string | undefined): value is ChatModelId =>
    Boolean(value && chatModels.some((model) => model.id === value));
  const resolvedChatModel: ChatModelId = isValidChatModel(cookieModelValue)
    ? cookieModelValue
    : DEFAULT_CHAT_MODEL;

  if (!modelIdFromCookie || !isValidChatModel(cookieModelValue)) {
    return (
      <>
        <Chat
          autoResume={false}
          id={id}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialMessages={[]}
          initialVisibilityType="private"
          isReadonly={false}
          key={id}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={resolvedChatModel}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
      />
      <DataStreamHandler />
    </>
  );
}
