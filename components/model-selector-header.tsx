"use client";

import { saveChatModelAsCookie, saveProviderAsCookie } from "@/app/(chat)/actions";
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
import { ChevronDownIcon } from "lucide-react";
import { memo, startTransition, useEffect, useMemo, useState } from "react";

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
  const version = MODEL_DISPLAY_NAMES[providerId]["chat-model-reasoning"].version;
  return providerId === "openai" ? `GPT-${version}` : `Gemini ${version}`;
}

interface ModelSelectorHeaderProps {
  selectedModelId: ChatModelId;
  selectedProviderId?: ModelProviderId;
  onModelChange?: (modelId: ChatModelId) => void;
  onProviderChange?: (providerId: ModelProviderId) => void;
  className?: string;
}

function PureModelSelectorHeader({
  selectedModelId,
  selectedProviderId = "openai",
  onModelChange,
  onProviderChange,
  className,
}: ModelSelectorHeaderProps) {
  const [optimisticModelId, setOptimisticModelId] = useState<ChatModelId>(selectedModelId);
  const [optimisticProviderId, setOptimisticProviderId] = useState<ModelProviderId>(selectedProviderId);

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
    const modelInfo = MODEL_DISPLAY_NAMES[optimisticProviderId][optimisticModelId];
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
          variant="ghost"
          className={`h-9 px-3 gap-2 font-medium text-sm ${className || ""}`}
        >
          {buttonText}
          <ChevronDownIcon size={16} className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[280px] p-0">
        <div className="flex flex-col">
          {/* Секция провайдеров (если > 1) */}
          {showProviderSelector && (
            <>
              <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Провайдер
              </div>
              <DropdownMenuGroup className="p-1">
                {configuredProviders.map((providerId) => {
                  const isActive = providerId === optimisticProviderId;
                  return (
                    <DropdownMenuItem
                      key={providerId}
                      className="cursor-pointer py-2.5"
                      onSelect={() => handleProviderChange(providerId)}
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex flex-col gap-0.5">
                          <div className="font-medium text-sm">
                            {getProviderShortName(providerId)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {providerId === "openai" ? "GPT модели" : "Gemini модели"}
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-sm text-primary font-bold">✓</span>
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
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            {getModelGroupName(optimisticProviderId)}
          </div>
          <DropdownMenuGroup className="p-1">
            {modelOrder.map((modelId) => {
              const modelInfo = MODEL_DISPLAY_NAMES[optimisticProviderId][modelId];
              const isActive = modelId === optimisticModelId;

              return (
                <DropdownMenuItem
                  key={modelId}
                  className="cursor-pointer py-2.5"
                  onSelect={() => handleModelChange(modelId)}
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="font-medium text-sm">{modelInfo.label}</div>
                      <div className="text-xs text-muted-foreground leading-snug">
                        {modelInfo.description}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-sm text-primary font-bold pt-0.5">✓</span>
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
