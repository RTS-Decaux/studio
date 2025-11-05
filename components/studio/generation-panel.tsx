"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { FalStudioModel, ReferenceInputKind } from "@/lib/ai/studio-models";
import { generateAction } from "@/lib/studio/actions";
import { getRecommendedModels, getModelById } from "@/lib/studio/model-mapping";
import type { StudioGenerationType } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Settings2,
  Sparkles,
  Video,
  AlertCircle,
  Info,
  Upload,
} from "lucide-react";
import { useCallback, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { ModelSelectorDialog } from "./model-selector-dialog";
import { ReferenceInputManager } from "./reference-input-manager";
import { ModelCapabilityBadge } from "./model-capability-badge";

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
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Generate Content
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose your generation type, select a model, and configure parameters
          </p>
        </div>

        <Separator />

        {/* Generation Type Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Generation Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {GENERATION_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = generationType === type.value;

              return (
                <button
                  key={type.value}
                  onClick={() => handleGenerationTypeChange(type.value)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                    isActive
                      ? "border-purple-500 bg-purple-500/5 shadow-sm shadow-purple-500/10"
                      : "border-border bg-background hover:border-purple-500/50 hover:bg-accent/50"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                      isActive
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-0.5">{type.label}</h4>
                    <p className="text-xs text-muted-foreground/80 line-clamp-2">
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
        <Label className="text-sm font-medium">Model</Label>
        <button
          onClick={() => setModelDialogOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-xl border-thin border-border bg-background hover:border-foreground/50 transition-bg-background text-left shadow-xs"
        >
          {selectedModel ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm truncate">
                  {selectedModel.name}
                </span>
                {selectedModel.quality && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {selectedModel.quality}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground/80 line-clamp-1">
                {selectedModel.description}
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground/70">Select model...</span>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 ml-2" />
        </button>
      </div>

      {/* Reference Image Upload (if needed) */}
      {needsReferenceImage && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Reference Image</Label>
          {referenceImagePreview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border-thin border-border bg-background shadow-xs">
              <img
                src={referenceImagePreview}
                alt="Reference"
                className="w-full h-full object-cover"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 shadow-md"
                onClick={() => {
                  setReferenceImage(null);
                  setReferenceImagePreview(null);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-thin border-dashed border-border rounded-xl cursor-pointer bg-background hover:border-foreground/50 transition-bg-background">
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-7 w-7 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground/80">
                  Click to upload or drag and drop
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      )}

      {/* Prompt */}
      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Advanced Settings */}
      <Card className="bg-background border-thin border-border shadow-xs">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Advanced Settings</Label>
            <Settings2 className="h-4 w-4 text-muted-foreground/60" />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negative-prompt" className="text-xs">
              Negative Prompt
            </Label>
            <Textarea
              id="negative-prompt"
              placeholder="What to avoid in the generation..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Image Size */}
          {generationType.includes("image") && (
            <div className="space-y-2">
              <Label htmlFor="image-size" className="text-xs">
                Image Size
              </Label>
              <Select value={imageSize} onValueChange={setImageSize}>
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
              <span className="text-xs text-muted-foreground">{steps[0]}</span>
            </div>
            <Slider
              value={steps}
              onValueChange={setSteps}
              min={1}
              max={50}
              step={1}
            />
          </div>

          {/* Guidance Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Guidance Scale</Label>
              <span className="text-xs text-muted-foreground">
                {guidanceScale[0]}
              </span>
            </div>
            <Slider
              value={guidanceScale}
              onValueChange={setGuidanceScale}
              min={1}
              max={20}
              step={0.5}
            />
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="random-seed" className="text-xs">
                Random Seed
              </Label>
              <Switch
                id="random-seed"
                checked={randomSeed}
                onCheckedChange={setRandomSeed}
              />
            </div>
            {!randomSeed && (
              <Input
                type="number"
                placeholder="Enter seed..."
                value={seed || ""}
                onChange={(e) =>
                  setSeed(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !selectedModel}
        className="w-full h-11 text-sm font-medium rounded-xl shadow-md transition-bg-background"
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
        open={modelDialogOpen}
        onOpenChange={setModelDialogOpen}
        onSelectModel={setSelectedModel}
        currentModel={selectedModel}
        generationType={generationType}
      />
    </div>
  );
}
