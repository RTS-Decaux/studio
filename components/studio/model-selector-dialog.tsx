"use client";

import { Check, Filter, Image, Search, Sparkles, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FalStudioModel } from "@/lib/ai/studio-models";
import { getModelsByGenerationType } from "@/lib/studio/model-mapping";
import type { StudioGenerationType } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import {
  ModelCapabilityBadge,
  ModelRequirementsBadges,
} from "./model-capability-badge";

const GENERATION_TYPE_LABELS: Record<StudioGenerationType, string> = {
  "text-to-image": "Текст в изображение",
  "text-to-video": "Текст в видео",
  "image-to-image": "Изображение в изображение",
  "image-to-video": "Изображение в видео",
  "video-to-video": "Видео в видео",
  inpaint: "Редактирование",
  lipsync: "Синхронизация губ",
};

interface ModelSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: FalStudioModel) => void;
  currentModel: FalStudioModel | null;
  generationType: StudioGenerationType;
}

export function ModelSelectorDialog({
  open,
  onOpenChange,
  onSelectModel,
  currentModel,
  generationType,
}: ModelSelectorDialogProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "groups">("groups");

  const models = getModelsByGenerationType(generationType);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const searchLower = search.toLowerCase();
      return (
        model.name.toLowerCase().includes(searchLower) ||
        model.description.toLowerCase().includes(searchLower) ||
        model.creator.toLowerCase().includes(searchLower)
      );
    });
  }, [models, search]);

  // Group models by creator
  const groupedModels = useMemo(() => {
    const groups: Record<string, FalStudioModel[]> = {};

    filteredModels.forEach((model) => {
      if (!groups[model.creator]) {
        groups[model.creator] = [];
      }
      groups[model.creator].push(model);
    });

    return Object.entries(groups).map(([creator, models]) => ({
      creator,
      models,
    }));
  }, [filteredModels]);

  const handleSelect = (model: FalStudioModel) => {
    onSelectModel(model);
    onOpenChange(false);
  };

  const ModelCard = ({ model }: { model: FalStudioModel }) => {
    const isSelected = currentModel?.id === model.id;

    return (
      <button
        className={cn(
          "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
          isSelected
            ? "border-purple-500 bg-purple-500/5 shadow-purple-500/10 shadow-sm"
            : "border-border bg-card hover:border-purple-500/50 hover:bg-card/80"
        )}
        onClick={() => handleSelect(model)}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all",
            isSelected
              ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
              : model.type === "video"
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          )}
        >
          {model.type === "video" ? (
            <Video className="h-5 w-5" />
          ) : (
            <Image className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{model.name}</h4>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs">
                {model.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="bg-muted/50 px-2 py-0.5 text-xs"
              variant="outline"
            >
              {model.creator}
            </Badge>
            {model.quality && (
              <Badge
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-2 py-0.5 text-xs"
                variant="secondary"
              >
                {model.quality}
              </Badge>
            )}
            <ModelCapabilityBadge model={model} />
          </div>

          <ModelRequirementsBadges model={model} />
        </div>
      </button>
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] max-w-4xl border border-border bg-card shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-bold text-transparent text-xl">
                Выберите модель
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground text-sm">
                Выберите модель для{" "}
                <Badge className="ml-1" variant="outline">
                  {GENERATION_TYPE_LABELS[generationType]}
                </Badge>
              </DialogDescription>
            </div>
            <Badge className="text-xs" variant="secondary">
              {filteredModels.length} моделей
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск моделей по названию, создателю или описанию..."
              type="search"
              value={search}
            />
          </div>

          <Tabs
            onValueChange={(v) => setViewMode(v as "all" | "groups")}
            value={viewMode}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="text-xs" value="groups">
                <Filter className="mr-1 h-3 w-3" />
                По создателю
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="all">
                <Sparkles className="mr-1 h-3 w-3" />
                Все модели
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Models List */}
        <ScrollArea className="h-[450px] pr-4">
          {viewMode === "groups" ? (
            <div className="space-y-6">
              {groupedModels.map((group) => (
                <div className="space-y-3" key={group.creator}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">
                      {group.creator}
                    </h3>
                    <Badge className="text-xs" variant="secondary">
                      {group.models.length}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {group.models.map((model) => (
                      <ModelCard key={model.id} model={model} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}

          {filteredModels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                Модели, соответствующие "{search}", не найдены
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
