"use client";

import { ChevronDownIcon } from "lucide-react";
import { memo, startTransition, useEffect, useMemo, useState } from "react";
import {
  saveChatModelAsCookie,
  saveProviderAsCookie,
} from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatModelId } from "@/lib/ai/models";
import { getConfiguredProviders } from "@/lib/ai/provider-selector";
import type { ModelProviderId } from "@/lib/ai/providers";

// Маппинг моделей на красивые названия для разных провайдеров
const MODEL_DISPLAY_NAMES: Record<
  ModelProviderId,
  Record<ChatModelId, { label: string; description: string; version?: string }>
> = {
  openai: {
    "chat-model": {
      label: "Auto",
      description: "Решает, как долго думать",
      version: "5",
    },
    "chat-model-fast": {
      label: "Instant",
      description: "Отвечает сразу",
      version: "5",
    },
    "chat-model-reasoning": {
      label: "Thinking",
      description: "Думает дольше, чтобы получить лучшие ответы",
      version: "5",
    },
  },
  gemini: {
    "chat-model": {
      label: "Auto",
      description: "Решает, как долго думать",
      version: "2.5",
    },
    "chat-model-fast": {
      label: "Instant",
      description: "Отвечает сразу",
      version: "2.5",
    },
    "chat-model-reasoning": {
      label: "Thinking",
      description: "Думает дольше, чтобы получить лучшие ответы",
      version: "2.5",
    },
  },
};

// Получить краткое название провайдера для кнопки
function getProviderShortName(providerId: ModelProviderId): string {
  return providerId === "openai" ? "ChatGPT" : "Google";
}

// Получить название группы моделей
function getModelGroupName(providerId: ModelProviderId): string {
  const version =
    MODEL_DISPLAY_NAMES[providerId]["chat-model-reasoning"].version;
  return providerId === "openai" ? `GPT-${version}` : `Gemini ${version}`;
}

type ModelSelectorHeaderProps = {
  selectedModelId: ChatModelId;
  selectedProviderId?: ModelProviderId;
  onModelChange?: (modelId: ChatModelId) => void;
  onProviderChange?: (providerId: ModelProviderId) => void;
  className?: string;
};

function PureModelSelectorHeader({
  selectedModelId,
  selectedProviderId = "openai",
  onModelChange,
  onProviderChange,
  className,
}: ModelSelectorHeaderProps) {
  const [optimisticModelId, setOptimisticModelId] =
    useState<ChatModelId>(selectedModelId);
  const [optimisticProviderId, setOptimisticProviderId] =
    useState<ModelProviderId>(selectedProviderId);

  useEffect(() => {
    setOptimisticModelId(selectedModelId);
  }, [selectedModelId]);

  useEffect(() => {
    setOptimisticProviderId(selectedProviderId);
  }, [selectedProviderId]);

  const configuredProviders = useMemo(() => getConfiguredProviders(), []);
  const showProviderSelector = configuredProviders.length > 1;

  // Получить текст для кнопки
  const buttonText = useMemo(() => {
    const providerShortName = getProviderShortName(optimisticProviderId);
    const modelInfo =
      MODEL_DISPLAY_NAMES[optimisticProviderId][optimisticModelId];
    const version = modelInfo?.version || "";

    // Формат: "ChatGPT 5" или "Google 2.5"
    return `${providerShortName} ${version}`;
  }, [optimisticModelId, optimisticProviderId]);

  const handleProviderChange = (providerId: ModelProviderId) => {
    setOptimisticProviderId(providerId);
    onProviderChange?.(providerId);
    startTransition(() => {
      saveProviderAsCookie(providerId);
    });
  };

  const handleModelChange = (modelId: ChatModelId) => {
    setOptimisticModelId(modelId);
    onModelChange?.(modelId);
    startTransition(() => {
      saveChatModelAsCookie(modelId);
    });
  };

  // Все модели в правильном порядке
  const modelOrder: ChatModelId[] = [
    "chat-model",
    "chat-model-fast",
    "chat-model-reasoning",
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`h-9 gap-2 px-3 font-medium text-sm ${className || ""}`}
          variant="ghost"
        >
          {buttonText}
          <ChevronDownIcon className="opacity-50" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[280px] p-0">
        <div className="flex flex-col">
          {/* Секция провайдеров (если > 1) */}
          {showProviderSelector && (
            <>
              <div className="px-3 pt-2 pb-1.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
                Провайдер
              </div>
              <DropdownMenuGroup className="p-1">
                {configuredProviders.map((providerId) => {
                  const isActive = providerId === optimisticProviderId;
                  return (
                    <DropdownMenuItem
                      className="cursor-pointer py-2.5"
                      key={providerId}
                      onSelect={() => handleProviderChange(providerId)}
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="font-medium text-sm">
                            {getProviderShortName(providerId)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {providerId === "openai"
                              ? "GPT модели"
                              : "Gemini модели"}
                          </div>
                        </div>
                        {isActive && (
                          <span className="font-bold text-primary text-sm">
                            ✓
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-0" />
            </>
          )}

          {/* Секция моделей */}
          <div className="px-3 pt-2 pb-1.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
            {getModelGroupName(optimisticProviderId)}
          </div>
          <DropdownMenuGroup className="p-1">
            {modelOrder.map((modelId) => {
              const modelInfo =
                MODEL_DISPLAY_NAMES[optimisticProviderId][modelId];
              const isActive = modelId === optimisticModelId;

              return (
                <DropdownMenuItem
                  className="cursor-pointer py-2.5"
                  key={modelId}
                  onSelect={() => handleModelChange(modelId)}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="font-medium text-sm">
                        {modelInfo.label}
                      </div>
                      <div className="text-muted-foreground text-xs leading-snug">
                        {modelInfo.description}
                      </div>
                    </div>
                    {isActive && (
                      <span className="pt-0.5 font-bold text-primary text-sm">
                        ✓
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ModelSelectorHeader = memo(
  PureModelSelectorHeader,
  (prevProps, nextProps) => {
    return (
      prevProps.selectedModelId === nextProps.selectedModelId &&
      prevProps.selectedProviderId === nextProps.selectedProviderId
    );
  }
);
