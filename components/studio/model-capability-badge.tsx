"use client";

import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FalStudioModel, ReferenceInputKind } from "@/lib/ai/studio-models";
import { getModelGenerationTypes } from "@/lib/studio/model-mapping";
import type { StudioGenerationType } from "@/lib/studio/types";
import {
    Film,
    Image,
    ImagePlus,
    Layers,
    Sparkles,
    Video,
    Wand2
} from "lucide-react";

const GENERATION_TYPE_CONFIG: Record<
  StudioGenerationType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  "text-to-image": {
    label: "Text → Image",
    icon: Image,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  "text-to-video": {
    label: "Text → Video",
    icon: Video,
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  "image-to-image": {
    label: "Image → Image",
    icon: ImagePlus,
    color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  "image-to-video": {
    label: "Image → Video",
    icon: Film,
    color: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  },
  "video-to-video": {
    label: "Video → Video",
    icon: Layers,
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
  inpaint: {
    label: "Inpaint",
    icon: Wand2,
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  lipsync: {
    label: "Lipsync",
    icon: Sparkles,
    color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
};

const INPUT_REQUIREMENT_LABELS: Record<ReferenceInputKind, string> = {
  "reference-image": "Reference Image",
  "first-frame": "First Frame",
  "last-frame": "Last Frame",
  "reference-video": "Reference Video",
};

interface ModelCapabilityBadgeProps {
  model: FalStudioModel;
  showAll?: boolean;
}

export function ModelCapabilityBadge({ model, showAll = false }: ModelCapabilityBadgeProps) {
  const generationTypes = getModelGenerationTypes(model.id);
  const primaryType = generationTypes[0];

  if (!primaryType) return null;

  const config = GENERATION_TYPE_CONFIG[primaryType];
  const Icon = config.icon;

  if (showAll && generationTypes.length > 1) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 flex-wrap">
              {generationTypes.map((type) => {
                const typeConfig = GENERATION_TYPE_CONFIG[type];
                const TypeIcon = typeConfig.icon;
                return (
                  <Badge
                    key={type}
                    variant="outline"
                    className={`text-xs px-2 py-0.5 font-medium ${typeConfig.color}`}
                  >
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                );
              })}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              This model supports {generationTypes.length} generation types
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-0.5 font-medium ${config.color}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

interface ModelRequirementsBadgesProps {
  model: FalStudioModel;
}

export function ModelRequirementsBadges({ model }: ModelRequirementsBadgesProps) {
  const requiredInputs = model.requiredInputs || [];
  const optionalInputs = model.optionalInputs || [];

  if (requiredInputs.length === 0 && optionalInputs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {requiredInputs.map((input) => (
        <Badge
          key={input}
          variant="outline"
          className="text-xs px-2 py-0.5 font-medium bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
        >
          {INPUT_REQUIREMENT_LABELS[input]} (Required)
        </Badge>
      ))}
      {optionalInputs.map((input) => (
        <Badge
          key={input}
          variant="outline"
          className="text-xs px-2 py-0.5 font-medium bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
        >
          {INPUT_REQUIREMENT_LABELS[input]} (Optional)
        </Badge>
      ))}
    </div>
  );
}
