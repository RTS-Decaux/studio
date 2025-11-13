"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/supabase/models";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import { SparklesIcon } from "./icons";
import { Loader2, Search } from "lucide-react";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
// Message reasoning UI removed: keep only the concise "Thinking..." indicator
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { WebSearchResult } from "./web-search-result";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            // Detailed reasoning steps removed. The UI now uses a single
            // concise "Thinking..." indicator rendered elsewhere.
            if (type === "reasoning") {
              return null;
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "w-fit break-words rounded-2xl px-3 py-2 text-right text-white":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                      style={
                        message.role === "user"
                          ? { backgroundColor: "#006cff" }
                          : undefined
                      }
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-webSearch") {
              const { toolCallId, state } = part;

              // Extract the actual data from wrapped format if needed
              const outputData =
                (part.output as any)?.type === "json" &&
                (part.output as any)?.value
                  ? (part.output as any).value
                  : part.output;

              // Show output in accordion
              if (state === "output-available") {
                return <WebSearchResult key={toolCallId} output={outputData} />;
              }
              return null;
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              // Show output
              if (state === "output-available") {
                return (
                  <div className="my-2" key={toolCallId}>
                    {"error" in part.output ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50">
                        Error: {String(part.output.error)}
                      </div>
                    ) : (
                      <DocumentToolResult
                        isReadonly={isReadonly}
                        result={{
                          ...part.output,
                          kind: part.output.kind as
                            | "text"
                            | "code"
                            | "image"
                            | "sheet",
                        }}
                        type="request-suggestions"
                      />
                    )}
                  </div>
                );
              }
              return null;
            }

            // Handle tool parts - check using startsWith to support dynamic tool types
            if (typeof type === "string" && type.startsWith("tool-")) {
              const toolName = type.replace("tool-", "");

              // @ts-expect-error - TypeScript can't narrow union types properly here
              const { toolCallId, state } = part;

              // Handle getWeather tool
              if (toolName === "getWeather") {
                if (state === "input-available") {
                  return (
                    <div
                      className="relative flex w-full flex-col gap-4 rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-6 shadow-lg"
                      key={toolCallId}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 animate-pulse rounded-full bg-white/30" />
                        <div className="flex-1">
                          <div className="mb-2 h-6 w-32 animate-pulse rounded bg-white/30" />
                          <div className="h-4 w-48 animate-pulse rounded bg-white/20" />
                        </div>
                      </div>
                      <div className="h-24 animate-pulse rounded-xl bg-white/20" />
                      <p className="text-center text-sm text-white/80">
                        Loading weather...
                      </p>
                    </div>
                  );
                }

                if (state === "output-available") {
                  // @ts-expect-error - TypeScript can't narrow union types properly here
                  const output = part.output;

                  if ("error" in output) {
                    return (
                      <div
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                        key={toolCallId}
                      >
                        {output.error}
                      </div>
                    );
                  }

                  return (
                    <div className="relative" key={toolCallId}>
                      <Weather weatherAtLocation={output} />
                    </div>
                  );
                }

                if (state === "output-error") {
                  return (
                    <div
                      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                      key={toolCallId}
                    >
                      Error fetching weather data
                    </div>
                  );
                }

                return null;
              }

              // Handle webSearch tool
              if (toolName === "webSearch") {
                if (state === "input-available") {
                  return (
                    <div
                      className="flex w-full flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4"
                      key={toolCallId}
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                          <Search className="h-4 w-4" />
                          Searching the web...
                        </div>
                      </div>
                    </div>
                  );
                }

                if (state === "output-available") {
                  // @ts-expect-error - TypeScript can't narrow union types properly here
                  const output = part.output;

                  return (
                    <div className="relative" key={toolCallId}>
                      <WebSearchResult output={output} />
                    </div>
                  );
                }

                if (state === "output-error") {
                  return (
                    <div
                      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                      key={toolCallId}
                    >
                      Error performing web search
                    </div>
                  );
                }

                return null;
              }

              // Unknown tool - show generic loading/error states
              if (state === "input-available") {
                return (
                  <div
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3"
                    key={toolCallId}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Processing {toolName}...
                    </span>
                  </div>
                );
              }

              if (state === "output-error") {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error executing {toolName}
                  </div>
                );
              }

              return null;
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }

    return false;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="p-0 text-muted-foreground text-sm">Thinking...</div>
        </div>
      </div>
    </motion.div>
  );
};
