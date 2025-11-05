"use client";

import { saveChatModelAsCookie, saveProviderAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { chatModels, type ChatModelId } from "@/lib/ai/models";
import {
  getConfiguredProviders,
  getProviderDisplayName,
  type ModelProviderId,
} from "@/lib/ai/providers";
import { cn } from "@/lib/utils";
import type { Session } from "@supabase/supabase-js";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

export function ModelSelector({
  session,
  selectedModelId,
  selectedProviderId = "openai",
  className,
}: {
  session: Session;
  selectedModelId: ChatModelId;
  selectedProviderId?: ModelProviderId;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic<ChatModelId>(selectedModelId);
  const [optimisticProviderId, setOptimisticProviderId] =
    useOptimistic<ModelProviderId>(selectedProviderId);

  const userType: "guest" | "regular" = session.user.is_anonymous ? "guest" : "regular";
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id)
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId
      ),
    [optimisticModelId, availableChatModels]
  );

  const configuredProviders = useMemo(() => getConfiguredProviders(), []);
  const showProviderSelector = configuredProviders.length > 1;

  // Группируем модели по типам как в ChatGPT
  const modelCategories = useMemo(() => {
    return [
      {
        id: "gpt-5",
        label: "GPT-5",
        description: "Решает, как долго думать",
        models: availableChatModels.filter((m) => m.id === "chat-model"),
      },
      {
        id: "instant",
        label: "Instant",
        description: "Отвечает сразу",
        models: availableChatModels.filter((m) => m.id === "chat-model-fast"),
      },
      {
        id: "thinking",
        label: "Thinking",
        description: "Думает дольше, чтобы получить лучшие ответы",
        models: availableChatModels.filter((m) => m.id === "chat-model-reasoning"),
      },
    ].filter((cat) => cat.models.length > 0);
  }, [availableChatModels]);

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="md:h-[34px] md:px-2"
          data-testid="model-selector"
          variant="outline"
        >
          <span className="flex items-center gap-1.5">
            <span className="font-medium">
              {getProviderDisplayName(optimisticProviderId).split(" ")[0]}
            </span>
            <span className="text-muted-foreground">{selectedChatModel?.name}</span>
          </span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[320px] max-w-[90vw] sm:min-w-[340px] p-0"
      >
        {showProviderSelector ? (
          <div className="w-full">
            {/* Tabs для провайдеров */}
            <Tabs
              value={optimisticProviderId}
              onValueChange={(value) => {
                const providerId = value as ModelProviderId;
                startTransition(() => {
                  setOptimisticProviderId(providerId);
                  saveProviderAsCookie(providerId);
                });
              }}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b h-10">
                {configuredProviders.map((providerId) => (
                  <TabsTrigger
                    key={providerId}
                    value={providerId}
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    data-testid={`provider-tab-${providerId}`}
                  >
                    {providerId === "openai" ? "ChatGPT" : "Google"}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Контент для каждого провайдера - один и тот же список моделей */}
              {configuredProviders.map((providerId) => (
                <TabsContent key={providerId} value={providerId} className="m-0 p-2">
                  <div className="flex flex-col gap-1">
                    {modelCategories.map((category) => (
                      <div key={category.id}>
                        {category.models.map((chatModel) => {
                          const { id } = chatModel;
                          const isActive = id === optimisticModelId;

                          return (
                            <DropdownMenuItem
                              key={id}
                              data-active={isActive}
                              data-testid={`model-selector-item-${id}`}
                              onSelect={() => {
                                setOpen(false);
                                startTransition(() => {
                                  setOptimisticModelId(id);
                                  saveChatModelAsCookie(id);
                                });
                              }}
                              className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-accent"
                            >
                              <button
                                className="group/item flex w-full flex-row items-start justify-between gap-3"
                                type="button"
                              >
                                <div className="flex flex-col items-start gap-0.5 flex-1">
                                  <div className="font-medium text-sm leading-tight">
                                    {category.label}
                                  </div>
                                  <div className="text-muted-foreground text-xs leading-tight">
                                    {category.description}
                                  </div>
                                </div>

                                <div className="shrink-0 text-foreground pt-0.5">
                                  {isActive && <CheckCircleFillIcon size={16} />}
                                </div>
                              </button>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Устаревшие модели / дополнительные опции */}
                  <div className="mt-2 pt-2 border-t">
                    <button
                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md flex items-center justify-between"
                      onClick={() => {
                        // TODO: открыть расширенные настройки моделей
                        console.log("Устаревшие модели");
                      }}
                    >
                      <span>Устаревшие модели</span>
                      <span className="rotate-[-90deg]">
                        <ChevronDownIcon size={16} />
                      </span>
                    </button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="p-2">
            <div className="flex flex-col gap-1">
              {modelCategories.map((category) => (
                <div key={category.id}>
                  {category.models.map((chatModel) => {
                    const { id } = chatModel;
                    const isActive = id === optimisticModelId;

                    return (
                      <DropdownMenuItem
                        key={id}
                        data-active={isActive}
                        data-testid={`model-selector-item-${id}`}
                        onSelect={() => {
                          setOpen(false);
                          startTransition(() => {
                            setOptimisticModelId(id);
                            saveChatModelAsCookie(id);
                          });
                        }}
                        className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-accent"
                      >
                        <button
                          className="group/item flex w-full flex-row items-start justify-between gap-3"
                          type="button"
                        >
                          <div className="flex flex-col items-start gap-0.5 flex-1">
                            <div className="font-medium text-sm leading-tight">
                              {category.label}
                            </div>
                            <div className="text-muted-foreground text-xs leading-tight">
                              {category.description}
                            </div>
                          </div>

                          <div className="shrink-0 text-foreground pt-0.5">
                            {isActive && <CheckCircleFillIcon size={16} />}
                          </div>
                        </button>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
