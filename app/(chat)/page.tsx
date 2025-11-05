import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import {
  chatModels,
  DEFAULT_CHAT_MODEL,
  type ChatModelId,
} from "@/lib/ai/models";
import {
  getDefaultProvider,
  isValidProvider,
  type ModelProviderId,
} from "@/lib/ai/providers";
import { getUser } from "@/lib/supabase/server";
import { generateUUID } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const providerIdFromCookie = cookieStore.get("ai-provider");
  
  const cookieModelValue = modelIdFromCookie?.value;
  const cookieProviderValue = providerIdFromCookie?.value;
  
  const isValidChatModel = (value: string | undefined): value is ChatModelId =>
    Boolean(value && chatModels.some((model) => model.id === value));
  
  const resolvedChatModel: ChatModelId = isValidChatModel(cookieModelValue)
    ? cookieModelValue
    : DEFAULT_CHAT_MODEL;
  
  const resolvedProvider: ModelProviderId = isValidProvider(cookieProviderValue)
    ? cookieProviderValue
    : getDefaultProvider();

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Guest";

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={resolvedChatModel}
        initialProvider={resolvedProvider}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
        userName={userName}
      />
      <DataStreamHandler />
    </>
  );
}
