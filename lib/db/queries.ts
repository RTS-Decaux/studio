import "server-only";

import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Chat,
  DBMessage,
  DBMessageInsert,
  SuggestionInsert,
  User,
} from "@/lib/supabase/models";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { ChatSDKError } from "../errors";
import type { AppUsage } from "../usage";

type Supabase = ReturnType<typeof createSupabaseServerClient>;

async function getSupabase(): Promise<Supabase> {
  return await createSupabaseServerClient();
}

const STORAGE_BUCKET_ID = "uploads";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

type MessageInsertInput = Omit<
  DBMessageInsert,
  "createdAt" | "parts" | "attachments"
> & {
  createdAt: Date | string;
  parts: unknown;
  attachments: unknown;
};

function normalizeJson(value: unknown): Json {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJson(item)) as Json;
  }

  if (typeof value === "object") {
    const result: Record<string, Json | undefined> = {};

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = normalizeJson(val);
    }

    return result;
  }

  return String(value) as Json;
}

type SuggestionInsertInput = Omit<
  SuggestionInsert,
  "createdAt" | "documentCreatedAt"
> & {
  createdAt: Date | string;
  documentCreatedAt: Date | string;
};

async function withSignedAttachmentUrls(
  messages: DBMessage[]
): Promise<DBMessage[]> {
  if (messages.length === 0) {
    return messages;
  }

  const adminClient = createSupabaseAdminClient();

  const clonedMessages = messages.map((message) => {
    if (Array.isArray(message.parts)) {
      const partsClone = JSON.parse(JSON.stringify(message.parts)) as Record<
        string,
        unknown
      >[];

      return {
        ...message,
        parts: partsClone as unknown as Json,
      };
    }

    return { ...message };
  });

  const fileReferences: Array<{
    messageIndex: number;
    partIndex: number;
    path: string;
  }> = [];

  clonedMessages.forEach((message, messageIndex) => {
    if (!Array.isArray(message.parts)) {
      return;
    }

    (message.parts as unknown as Record<string, unknown>[]).forEach(
      (part, partIndex) => {
        if (
          part &&
          typeof part === "object" &&
          part.type === "file" &&
          typeof part.storagePath === "string"
        ) {
          fileReferences.push({
            messageIndex,
            partIndex,
            path: part.storagePath,
          });
        }
      }
    );
  });

  if (fileReferences.length === 0) {
    return clonedMessages;
  }

  const { data, error } = await adminClient.storage
    .from(STORAGE_BUCKET_ID)
    .createSignedUrls(
      fileReferences.map((reference) => reference.path),
      SIGNED_URL_TTL_SECONDS
    );

  if (error || !data) {
    console.error(
      "Failed to create signed URLs for message attachments",
      error
    );
    return clonedMessages;
  }

  data.forEach((item, index) => {
    const signedUrl = item.signedUrl;
    if (!signedUrl) {
      return;
    }

    const { messageIndex, partIndex } = fileReferences[index];
    const parts = clonedMessages[messageIndex].parts;

    if (Array.isArray(parts)) {
      const part = (parts as unknown as Record<string, unknown>[])[partIndex];
      part.url = signedUrl;
    }
  });

  return clonedMessages;
}

export async function getUser(email: string): Promise<User[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("email", email);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }

  return data ?? [];
}

// Note: User creation is now handled by Supabase Auth
// This function is deprecated and should not be used
export async function createUser(email: string, password: string) {
  throw new ChatSDKError(
    "bad_request:database",
    "User creation is managed by Supabase Auth. Use supabase.auth.signUp() instead."
  );
}

// Note: Guest user creation is now handled by Supabase Auth
// This function is deprecated and should not be used
export async function createGuestUser() {
  throw new ChatSDKError(
    "bad_request:database",
    "Guest user creation is managed by Supabase Auth. Use supabase.auth.signInAnonymously() instead."
  );
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  const supabase = await getSupabase();

  const { error } = await supabase.from("Chat").insert({
    id,
    userId,
    title,
    visibility,
    createdAt: new Date().toISOString(),
  });

  if (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { error: voteError } = await supabase
    .from("Vote_v2")
    .delete()
    .eq("chatId", id);

  if (voteError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }

  const { error: messageError } = await supabase
    .from("Message_v2")
    .delete()
    .eq("chatId", id);

  if (messageError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }

  const { error: streamError } = await supabase
    .from("Stream")
    .delete()
    .eq("chatId", id);

  if (streamError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }

  const { data, error } = await supabase
    .from("Chat")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }

  return data ?? null;
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  const supabase = await getSupabase();

  const { data: userChats, error: chatsError } = await supabase
    .from("Chat")
    .select("id")
    .eq("userId", userId);

  if (chatsError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }

  const chatIds = userChats?.map(({ id }) => id) ?? [];

  if (chatIds.length === 0) {
    return { deletedCount: 0 };
  }

  const { error: voteError } = await supabase
    .from("Vote_v2")
    .delete()
    .in("chatId", chatIds);

  if (voteError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }

  const { error: messageError } = await supabase
    .from("Message_v2")
    .delete()
    .in("chatId", chatIds);

  if (messageError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }

  const { error: streamError } = await supabase
    .from("Stream")
    .delete()
    .in("chatId", chatIds);

  if (streamError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }

  const { data: deletedChats, error: deleteError } = await supabase
    .from("Chat")
    .delete()
    .in("id", chatIds)
    .select("id");

  if (deleteError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }

  return { deletedCount: deletedChats?.length ?? 0 };
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  const supabase = await getSupabase();
  const extendedLimit = limit + 1;

  const buildQuery = () =>
    supabase
      .from("Chat")
      .select("*")
      .eq("userId", id)
      .order("createdAt", { ascending: false })
      .limit(extendedLimit);

  let query = buildQuery();

  if (startingAfter) {
    const { data: selectedChat, error: selectedChatError } = await supabase
      .from("Chat")
      .select("createdAt")
      .eq("id", startingAfter)
      .maybeSingle();

    if (selectedChatError) {
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to get chats by user id"
      );
    }

    if (!selectedChat) {
      throw new ChatSDKError(
        "not_found:database",
        `Chat with id ${startingAfter} not found`
      );
    }

    query = buildQuery().gt("createdAt", selectedChat.createdAt);
  } else if (endingBefore) {
    const { data: selectedChat, error: selectedChatError } = await supabase
      .from("Chat")
      .select("createdAt")
      .eq("id", endingBefore)
      .maybeSingle();

    if (selectedChatError) {
      throw new ChatSDKError(
        "bad_request:database",
        "Failed to get chats by user id"
      );
    }

    if (!selectedChat) {
      throw new ChatSDKError(
        "not_found:database",
        `Chat with id ${endingBefore} not found`
      );
    }

    query = buildQuery().lt("createdAt", selectedChat.createdAt);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to get chats by user id:", error);
    console.error("User ID:", id);
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }

  const chats = (data ?? []) as Chat[];
  const hasMore = chats.length > limit;

  return {
    chats: hasMore ? chats.slice(0, limit) : chats,
    hasMore,
  };
}

export async function getChatById({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Chat")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }

  return data ?? null;
}

export async function saveMessages({
  messages,
}: {
  messages: MessageInsertInput[];
}) {
  const supabase = await getSupabase();
  const payload: DBMessageInsert[] = messages.map((message) => ({
    id: message.id,
    chatId: message.chatId,
    role: message.role,
    parts: normalizeJson(message.parts) as DBMessageInsert["parts"],
    attachments: normalizeJson(
      message.attachments
    ) as DBMessageInsert["attachments"],
    createdAt: toIsoString(message.createdAt),
  }));

  const { error } = await supabase.from("Message_v2").insert(payload);

  if (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Message_v2")
    .select("*")
    .eq("chatId", id)
    .order("createdAt", { ascending: true });

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }

  const messages = (data ?? []) as DBMessage[];
  return withSignedAttachmentUrls(messages);
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  const supabase = await getSupabase();

  const { data: existingVote, error: existingVoteError } = await supabase
    .from("Vote_v2")
    .select("*")
    .eq("chatId", chatId)
    .eq("messageId", messageId)
    .maybeSingle();

  if (existingVoteError) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }

  if (existingVote) {
    const { error } = await supabase
      .from("Vote_v2")
      .update({ isUpvoted: type === "up" })
      .eq("chatId", chatId)
      .eq("messageId", messageId);

    if (error) {
      throw new ChatSDKError("bad_request:database", "Failed to vote message");
    }

    return;
  }

  const { error } = await supabase
    .from("Vote_v2")
    .insert({ chatId, messageId, isUpvoted: type === "up" });

  if (error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Vote_v2")
    .select("*")
    .eq("chatId", id);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }

  return data ?? [];
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Document")
    .insert({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }

  return data ?? [];
}

export async function getDocumentsById({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Document")
    .select("*")
    .eq("id", id)
    .order("createdAt", { ascending: true });

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }

  return data ?? [];
}

export async function getDocumentById({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Document")
    .select("*")
    .eq("id", id)
    .order("createdAt", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }

  return data ?? null;
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date | string;
}) {
  const supabase = await getSupabase();
  const timestampIso = toIsoString(timestamp);

  const { error: suggestionError } = await supabase
    .from("Suggestion")
    .delete()
    .eq("documentId", id)
    .gt("documentCreatedAt", timestampIso);

  if (suggestionError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }

  const { data, error } = await supabase
    .from("Document")
    .delete()
    .eq("id", id)
    .gt("createdAt", timestampIso)
    .select();

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }

  return data ?? [];
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: SuggestionInsertInput[];
}) {
  const supabase = await getSupabase();
  const payload = suggestions.map((suggestion) => ({
    ...suggestion,
    createdAt: toIsoString(suggestion.createdAt),
    documentCreatedAt: toIsoString(suggestion.documentCreatedAt),
  }));

  const { error } = await supabase.from("Suggestion").insert(payload);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Suggestion")
    .select("*")
    .eq("documentId", documentId);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }

  return data ?? [];
}

export async function getMessageById({ id }: { id: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Message_v2")
    .select("*")
    .eq("id", id);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }

  return data ?? [];
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date | string;
}) {
  const supabase = await getSupabase();
  const timestampIso = toIsoString(timestamp);

  const { data: messagesToDelete, error } = await supabase
    .from("Message_v2")
    .select("id")
    .eq("chatId", chatId)
    .gte("createdAt", timestampIso);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }

  const messageIds = messagesToDelete?.map(({ id }) => id) ?? [];

  if (messageIds.length === 0) {
    return;
  }

  const { error: voteError } = await supabase
    .from("Vote_v2")
    .delete()
    .eq("chatId", chatId)
    .in("messageId", messageIds);

  if (voteError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }

  const { error: deleteError } = await supabase
    .from("Message_v2")
    .delete()
    .eq("chatId", chatId)
    .in("id", messageIds);

  if (deleteError) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("Chat")
    .update({ visibility })
    .eq("id", chatId);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  // Store merged server-enriched usage object
  context: AppUsage;
}) {
  try {
    const supabase = await getSupabase();

    const { error } = await supabase
      .from("Chat")
      .update({ lastContext: context })
      .eq("id", chatId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  const supabase = await getSupabase();
  const startTime = new Date(
    Date.now() - differenceInHours * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase.rpc("get_message_stats", {
    user_id: id,
    start_time: startTime,
  });

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }

  return data ?? 0;
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("Stream")
    .insert({ id: streamId, chatId, createdAt: new Date().toISOString() });

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("Stream")
    .select("id")
    .eq("chatId", chatId)
    .order("createdAt", { ascending: true });

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }

  return (data ?? []).map(({ id }) => id);
}
