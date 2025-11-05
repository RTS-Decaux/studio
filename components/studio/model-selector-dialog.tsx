"use client";

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
import { type FalStudioModel } from "@/lib/ai/studio-models";
import { getModelsByGenerationType } from "@/lib/studio/model-mapping";
import type { StudioGenerationType } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { Check, Filter, Image, Search, Sparkles, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { ModelCapabilityBadge, ModelRequirementsBadges } from "./model-capability-badge";

const GENERATION_TYPE_LABELS: Record<StudioGenerationType, string> = {
  "text-to-image": "Text to Image",
  "text-to-video": "Text to Video",
  "image-to-image": "Image to Image",
  "image-to-video": "Image to Video",
  "video-to-video": "Video to Video",
  inpaint: "Inpainting",
  lipsync: "Lip Sync",
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
        onClick={() => handleSelect(model)}
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl border text-left transition-all group",
          isSelected
            ? "border-purple-500 bg-purple-500/5 shadow-sm shadow-purple-500/10"
            : "border-border bg-card hover:border-purple-500/50 hover:bg-card/80"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-all",
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
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{model.name}</h4>
                {isSelected && (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {model.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 bg-muted/50"
            >
              {model.creator}
            </Badge>
            {model.quality && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-card border border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Select Model
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Choose a model for{" "}
                <Badge variant="outline" className="ml-1">
                  {GENERATION_TYPE_LABELS[generationType]}
                </Badge>
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredModels.length} models
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search models by name, creator, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "all" | "groups")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                By Creator
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                All Models
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Models List */}
        <ScrollArea className="h-[450px] pr-4">
          {viewMode === "groups" ? (
            <div className="space-y-6">
              {groupedModels.map((group) => (
                <div key={group.creator} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {group.creator}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
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
              <Sparkles className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No models found matching "{search}"
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
