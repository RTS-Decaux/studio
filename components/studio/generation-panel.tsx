"use client";

import {
  AlertCircle,
  ChevronRight,
  Image as ImageIcon,
  Info,
  Loader2,
  Settings2,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type {
  FalStudioModel,
  ReferenceInputKind,
} from "@/lib/ai/studio-models";
import { generateAction } from "@/lib/studio/actions";
import { getModelById, getRecommendedModels } from "@/lib/studio/model-mapping";
import type { StudioGenerationType } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { ModelCapabilityBadge } from "./model-capability-badge";
import { ModelSelectorDialog } from "./model-selector-dialog";
import { ReferenceInputManager } from "./reference-input-manager";

interface GenerationPanelProps {
  projectId?: string;
  onGenerationStart?: (generationId: string) => void;
  onGenerationComplete?: () => void;
}

const GENERATION_TYPES: Array<{
  value: StudioGenerationType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: "text-to-image",
    label: "Text to Image",
    icon: ImageIcon,
    description: "Generate images from text descriptions",
  },
  {
    value: "text-to-video",
    label: "Text to Video",
    icon: Video,
    description: "Create videos from text prompts",
  },
  {
    value: "image-to-video",
    label: "Image to Video",
    icon: Video,
    description: "Animate images into videos",
  },
  {
    value: "image-to-image",
    label: "Image to Image",
    icon: ImageIcon,
    description: "Transform images with AI",
  },
];

export function GenerationPanel({
  projectId,
  onGenerationStart,
  onGenerationComplete,
}: GenerationPanelProps) {
  const [generationType, setGenerationType] =
    useState<StudioGenerationType>("text-to-image");
  const [selectedModel, setSelectedModel] = useState<FalStudioModel | null>(
    () => getRecommendedModels(generationType)[0] || null
  );
  const [modelDialogOpen, setModelDialogOpen] = useState(false);

  // Generation parameters
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageSize, setImageSize] = useState("landscape_16_9");
  const [steps, setSteps] = useState([28]);
  const [guidanceScale, setGuidanceScale] = useState([7.5]);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [randomSeed, setRandomSeed] = useState(true);
  const [duration, setDuration] = useState([5]);
  const [fps, setFps] = useState([24]);

  // Reference inputs (images/videos) - unified state
  const [referenceInputs, setReferenceInputs] = useState<
    Record<ReferenceInputKind, File | null>
  >({
    "reference-image": null,
    "first-frame": null,
    "last-frame": null,
    "reference-video": null,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Compute required and optional inputs based on selected model
  const modelRequirements = useMemo(() => {
    if (!selectedModel) {
      return { required: [], optional: [] };
    }
    return {
      required: selectedModel.requiredInputs || [],
      optional: selectedModel.optionalInputs || [],
    };
  }, [selectedModel]);

  // Check if all required inputs are provided
  const hasAllRequiredInputs = useMemo(() => {
    return modelRequirements.required.every(
      (inputType) => referenceInputs[inputType] !== null
    );
  }, [modelRequirements.required, referenceInputs]);

  // Check if prompt is needed
  const needsPrompt = useMemo(() => {
    if (!generationType) return false;
    return generationType.startsWith("text-to");
  }, [generationType]);

  // Update model when generation type changes
  const handleGenerationTypeChange = useCallback((type: StudioGenerationType) => {
    setGenerationType(type);
    const recommended = getRecommendedModels(type);
    setSelectedModel(recommended[0] || null);

    // Reset reference inputs when changing generation type
    setReferenceInputs({
      "reference-image": null,
      "first-frame": null,
      "last-frame": null,
      "reference-video": null,
    });
  }, []);

  // Handle reference input change
  const handleReferenceInputChange = useCallback(
    (inputType: ReferenceInputKind, file: File | null) => {
      setReferenceInputs((prev) => ({
        ...prev,
        [inputType]: file,
      }));
    },
    []
  );

  // Update requirements when model changes
  useEffect(() => {
    // Clear any reference inputs that are no longer needed
    if (selectedModel) {
      const allRequiredAndOptional = [
        ...(selectedModel.requiredInputs || []),
        ...(selectedModel.optionalInputs || []),
      ];

      setReferenceInputs((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (!allRequiredAndOptional.includes(key as ReferenceInputKind)) {
            updated[key as ReferenceInputKind] = null;
          }
        });
        return updated;
      });
    }
  }, [selectedModel]);

  const handleGenerate = async () => {
    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    if (needsPrompt && !prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!hasAllRequiredInputs) {
      toast.error("Please provide all required inputs for this model");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await generateAction({
        modelId: selectedModel.id,
        projectId,
        generationType,
        prompt: prompt || undefined,
        negativePrompt: negativePrompt || undefined,
        referenceImageUrl: referenceInputs["reference-image"] ? undefined : undefined, // Will be handled by upload
        firstFrameUrl: referenceInputs["first-frame"] ? undefined : undefined,
        lastFrameUrl: referenceInputs["last-frame"] ? undefined : undefined,
        referenceVideoUrl: referenceInputs["reference-video"] ? undefined : undefined,
        parameters: {
          imageSize: selectedModel.type === "image" ? imageSize : undefined,
          numInferenceSteps: steps[0],
          guidanceScale: guidanceScale[0],
          seed: randomSeed ? undefined : seed,
          duration: selectedModel.type === "video" ? duration[0] : undefined,
          fps: selectedModel.type === "video" ? fps[0] : undefined,
        },
      });

      toast.success("Generation started!");
      onGenerationStart?.(response.generationId);

      // Reset form
      setPrompt("");
      setNegativePrompt("");
      setReferenceInputs({
        "reference-image": null,
        "first-frame": null,
        "last-frame": null,
        "reference-video": null,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to start generation");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = useMemo(() => {
    if (!selectedModel) return false;
    if (needsPrompt && !prompt.trim()) return false;
    if (!hasAllRequiredInputs) return false;
    return true;
  }, [selectedModel, needsPrompt, prompt, hasAllRequiredInputs]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-bold text-2xl text-transparent tracking-tight">
            Generate Content
          </h2>
          <p className="text-muted-foreground text-sm">
            Choose your generation type, select a model, and configure parameters
          </p>
        </div>

        <Separator />

        {/* Generation Type Selector */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Generation Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {GENERATION_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = generationType === type.value;

              return (
                <button
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    isActive
                      ? "border-purple-500 bg-purple-500/5 shadow-purple-500/10 shadow-sm"
                      : "border-border bg-background hover:border-purple-500/50 hover:bg-accent/50"
                  )}
                  key={type.value}
                  onClick={() => handleGenerationTypeChange(type.value)}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-0.5 font-medium text-sm">{type.label}</h4>
                    <p className="line-clamp-2 text-muted-foreground/80 text-xs">
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      {/* Model Selector */}
      <div className="space-y-3">
        <Label className="font-medium text-sm">Model</Label>
        <button
          className="flex w-full items-center justify-between rounded-xl border-border border-thin bg-background p-3 text-left shadow-xs transition-bg-background hover:border-foreground/50"
          onClick={() => setModelDialogOpen(true)}
        >
          {selectedModel ? (
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <span className="truncate font-medium text-sm">
                  {selectedModel.name}
                </span>
                {selectedModel.quality && (
                  <Badge className="px-1.5 py-0 text-xs" variant="secondary">
                    {selectedModel.quality}
                  </Badge>
                )}
              </div>
              <p className="line-clamp-1 text-muted-foreground/80 text-xs">
                {selectedModel.description}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground/70 text-sm">Select model...</span>
          )}
          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground/60" />
        </button>
      </div>

      {/* Reference Inputs (images/videos) */}
      {modelRequirements.required.length > 0 && (
        <div className="space-y-3">
          <Label className="font-medium text-sm">Required Inputs</Label>
          <div className="space-y-3">
            {modelRequirements.required.map((inputType) => (
              <ReferenceInputManager
                key={inputType}
                label={inputType
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
                onChange={(file) => handleReferenceInputChange(inputType, file)}
                required
                type={inputType}
                value={referenceInputs[inputType]}
              />
            ))}
          </div>
        </div>
      )}

      {modelRequirements.optional.length > 0 && (
        <div className="space-y-3">
          <Label className="font-medium text-sm">Optional Inputs</Label>
          <div className="space-y-3">
            {modelRequirements.optional.map((inputType) => (
              <ReferenceInputManager
                key={inputType}
                label={inputType
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
                onChange={(file) => handleReferenceInputChange(inputType, file)}
                type={inputType}
                value={referenceInputs[inputType]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prompt */}
      <div className="space-y-3">
        <Label className="font-medium text-sm" htmlFor="prompt">
          Prompt
        </Label>
        <Textarea
          className="resize-none"
          id="prompt"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate..."
          rows={4}
          value={prompt}
        />
      </div>

      {/* Advanced Settings */}
      <Card className="border-border border-thin bg-background shadow-xs">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-sm">Advanced Settings</Label>
            <Settings2 className="h-4 w-4 text-muted-foreground/60" />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label className="text-xs" htmlFor="negative-prompt">
              Negative Prompt
            </Label>
            <Textarea
              className="resize-none text-sm"
              id="negative-prompt"
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid in the generation..."
              rows={2}
              value={negativePrompt}
            />
          </div>

          {/* Image Size */}
          {generationType.includes("image") && (
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="image-size">
                Image Size
              </Label>
              <Select onValueChange={setImageSize} value={imageSize}>
                <SelectTrigger id="image-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="square_hd">Square HD (1:1)</SelectItem>
                  <SelectItem value="portrait_4_3">Portrait (4:3)</SelectItem>
                  <SelectItem value="portrait_16_9">Portrait (16:9)</SelectItem>
                  <SelectItem value="landscape_4_3">Landscape (4:3)</SelectItem>
                  <SelectItem value="landscape_16_9">
                    Landscape (16:9)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Inference Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Inference Steps</Label>
              <span className="text-muted-foreground text-xs">{steps[0]}</span>
            </div>
            <Slider
              max={50}
              min={1}
              onValueChange={setSteps}
              step={1}
              value={steps}
            />
          </div>

          {/* Guidance Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Guidance Scale</Label>
              <span className="text-muted-foreground text-xs">
                {guidanceScale[0]}
              </span>
            </div>
            <Slider
              max={20}
              min={1}
              onValueChange={setGuidanceScale}
              step={0.5}
              value={guidanceScale}
            />
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs" htmlFor="random-seed">
                Random Seed
              </Label>
              <Switch
                checked={randomSeed}
                id="random-seed"
                onCheckedChange={setRandomSeed}
              />
            </div>
            {!randomSeed && (
              <Input
                onChange={(e) =>
                  setSeed(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="Enter seed..."
                type="number"
                value={seed || ""}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        className="h-11 w-full rounded-xl font-medium text-sm shadow-md transition-bg-background"
        disabled={isGenerating || !selectedModel}
        onClick={handleGenerate}
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </>
        )}
      </Button>

      {/* Model Selector Dialog */}
      <ModelSelectorDialog
        currentModel={selectedModel}
        generationType={generationType}
        onOpenChange={setModelDialogOpen}
        onSelectModel={setSelectedModel}
        open={modelDialogOpen}
      />
      </div>
    </ScrollArea>
  );
}
