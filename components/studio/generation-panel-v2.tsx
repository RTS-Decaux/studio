"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { showStudioError, showStudioSuccess } from "@/lib/studio/error-handler";
import { getFalClient } from "@/lib/studio/fal";
import { getRecommendedModels } from "@/lib/studio/model-mapping";
import type { ProjectTemplate, PromptTemplate } from "@/lib/studio/templates";
import type { StudioGenerationType } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Info,
  Loader2,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { ModelCapabilityBadge } from "./model-capability-badge";
import { ModelSelectorDialog } from "./model-selector-dialog";
import { ProjectTemplatePicker } from "./project-template-picker";
import { ReferenceInputManager } from "./reference-input-manager";
import { TemplatePickerDialog } from "./template-picker-dialog";

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
    icon: Film,
    description: "Animate images into videos",
  },
  {
    value: "image-to-image",
    label: "Image to Image",
    icon: Wand2,
    description: "Transform images with AI",
  },
];

export function GenerationPanelV2({
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

  // Veo-specific parameters
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [autoFix, setAutoFix] = useState(false);

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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [projectTemplateDialogOpen, setProjectTemplateDialogOpen] =
    useState(false);

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

  // Apply model defaults when model changes
  useEffect(() => {
    if (selectedModel?.modelParameters?.defaults) {
      const defaults = selectedModel.modelParameters.defaults;
      
      // Apply aspect_ratio if present
      if (defaults.aspect_ratio && typeof defaults.aspect_ratio === 'string') {
        setAspectRatio(defaults.aspect_ratio);
      }
      
      // Apply resolution if present
      if (defaults.resolution && typeof defaults.resolution === 'string') {
        setResolution(defaults.resolution);
      }
      
      // Apply duration if present
      if (defaults.duration && typeof defaults.duration === 'string') {
        const durationNum = parseInt(defaults.duration);
        if (!isNaN(durationNum)) {
          setDuration([durationNum]);
        }
      }
      
      // Apply enhance_prompt if present
      if (typeof defaults.enhance_prompt === 'boolean') {
        setEnhancePrompt(defaults.enhance_prompt);
      }
      
      // Apply auto_fix if present
      if (typeof defaults.auto_fix === 'boolean') {
        setAutoFix(defaults.auto_fix);
      }
    }
  }, [selectedModel]);

  // Update model when generation type changes
  const handleGenerationTypeChange = useCallback(
    (type: StudioGenerationType) => {
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
    },
    []
  );

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

  // Template handlers
  const handleSelectPromptTemplate = useCallback((template: PromptTemplate) => {
    setPrompt(template.prompt);
    setNegativePrompt(template.negativePrompt);
    toast.success(`Template "${template.name}" applied!`);
  }, []);

  const handleSelectProjectTemplate = useCallback(
    (template: ProjectTemplate) => {
      // Apply settings from template
      const settings = template.defaultSettings;

      if (settings.imageSize) setImageSize(settings.imageSize);
      if (settings.duration) setDuration([settings.duration]);
      if (settings.fps) setFps([settings.fps]);
      if (settings.steps) setSteps([settings.steps]);
      if (settings.guidance) setGuidanceScale([settings.guidance]);

      // Apply prompt templates if available
      if (template.promptTemplate) setPrompt(template.promptTemplate);
      if (template.negativePromptTemplate)
        setNegativePrompt(template.negativePromptTemplate);

      toast.success(`Project template "${template.name}" loaded!`);
    },
    []
  );

  const handleGenerate = async () => {
    if (!selectedModel) {
      toast.error("Please select a model", {
        description: "Choose an AI model to start generating",
      });
      return;
    }

    if (needsPrompt && !prompt.trim()) {
      toast.error("Prompt required", {
        description: "Please describe what you want to generate",
      });
      return;
    }

    if (!hasAllRequiredInputs) {
      toast.error("Missing required inputs", {
        description: "Please provide all required reference images/videos",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Upload reference files to fal.ai storage
      const uploadedUrls: Record<string, string | undefined> = {};

      for (const [key, file] of Object.entries(referenceInputs)) {
        if (file instanceof File) {
          toast.loading(`Uploading ${key.replace("-", " ")}...`, {
            id: `upload-${key}`,
          });
          const client = getFalClient();
          const url = await client.uploadFile(file);
          uploadedUrls[key] = url;
          toast.success(`Uploaded ${key.replace("-", " ")}`, {
            id: `upload-${key}`,
          });
        }
      }

      const response = await generateAction({
        modelId: selectedModel.id,
        projectId,
        generationType,
        prompt: prompt || undefined,
        negativePrompt: negativePrompt || undefined,
        referenceImageUrl: uploadedUrls["reference-image"],
        firstFrameUrl: uploadedUrls["first-frame"],
        lastFrameUrl: uploadedUrls["last-frame"],
        referenceVideoUrl: uploadedUrls["reference-video"],
        parameters: {
          // Image-specific
          imageSize: selectedModel.type === "image" ? imageSize : undefined,
          
          // Video-specific
          duration: selectedModel.type === "video" ? duration[0] : undefined,
          fps: selectedModel.type === "video" ? fps[0] : undefined,
          
          // Veo-specific parameters (if model supports them)
          aspect_ratio: selectedModel.modelParameters?.defaults?.aspect_ratio !== undefined ? aspectRatio : undefined,
          resolution: selectedModel.modelParameters?.defaults?.resolution !== undefined ? resolution : undefined,
          enhance_prompt: selectedModel.modelParameters?.defaults?.enhance_prompt !== undefined ? enhancePrompt : undefined,
          auto_fix: selectedModel.modelParameters?.defaults?.auto_fix !== undefined ? autoFix : undefined,
          
          // Common parameters
          numInferenceSteps: steps[0],
          guidanceScale: guidanceScale[0],
          seed: randomSeed ? undefined : seed,
        },
      });

      showStudioSuccess(
        "Generation started!",
        `Your ${generationType.replace("-", " ")} is being generated`
      );
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

      // Call completion callback to refresh UI
      onGenerationComplete?.();
    } catch (error: any) {
      showStudioError(error, "generation");
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
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-semibold text-foreground text-base tracking-tight">
            Generate Content
          </h2>
          <p className="text-muted-foreground text-xs">
            Choose your generation type, select a model, and configure
            parameters
          </p>
        </div>

        <Separator />

        {/* Generation Type Selector */}
        <div className="space-y-2">
          <Label className="font-medium text-xs">Generation Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {GENERATION_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = generationType === type.value;

              return (
                <button
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-2 text-left transition-all",
                    isActive
                      ? "border-foreground bg-muted"
                      : "border-border bg-background hover:border-foreground/50 hover:bg-muted/50"
                  )}
                  key={type.value}
                  onClick={() => handleGenerationTypeChange(type.value)}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all",
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-0.5 font-medium text-xs">{type.label}</h4>
                    <p className="line-clamp-2 text-muted-foreground text-[10px] leading-tight">
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <Label className="font-medium text-xs">AI Model</Label>
          <button
            className="group flex w-full items-start justify-between rounded-lg border border-border bg-card p-2.5 text-left transition-all hover:border-foreground/50 hover:bg-muted/50"
            onClick={() => setModelDialogOpen(true)}
          >
            {selectedModel ? (
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs">
                    {selectedModel.name}
                  </span>
                  {selectedModel.quality && (
                    <Badge
                      className="px-1.5 py-0 text-[10px]"
                      variant="secondary"
                    >
                      {selectedModel.quality}
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-1 text-muted-foreground text-[10px]">
                  {selectedModel.description}
                </p>
                <ModelCapabilityBadge model={selectedModel} />
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">
                Select a model...
              </span>
            )}
            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
          </button>

          {/* Model Requirements Info */}
          {selectedModel &&
            (modelRequirements.required.length > 0 ||
              modelRequirements.optional.length > 0) && (
              <Card className="border-border bg-muted/30">
                <CardContent className="px-2.5 pt-2.5 pb-2">
                  <div className="flex items-start gap-1.5">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground text-[10px]">
                        Model Requirements
                      </p>
                      <p className="text-muted-foreground text-[10px] leading-tight">
                        {modelRequirements.required.length > 0 && (
                          <>
                            <strong>Required:</strong>{" "}
                            {modelRequirements.required.join(", ")}
                          </>
                        )}
                        {modelRequirements.required.length > 0 &&
                          modelRequirements.optional.length > 0 &&
                          " • "}
                        {modelRequirements.optional.length > 0 && (
                          <>
                            <strong>Optional:</strong>{" "}
                            {modelRequirements.optional.join(", ")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Reference Inputs - Dynamic based on model */}
        {selectedModel &&
          (modelRequirements.required.length > 0 ||
            modelRequirements.optional.length > 0) && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 font-medium text-xs">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Reference Inputs
                </Label>

                {modelRequirements.required.map((inputType) => (
                  <ReferenceInputManager
                    disabled={isGenerating}
                    key={inputType}
                    label={inputType
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                    onChange={(file) =>
                      handleReferenceInputChange(inputType, file)
                    }
                    required={true}
                    type={inputType}
                    value={referenceInputs[inputType]}
                  />
                ))}

                {modelRequirements.optional.map((inputType) => (
                  <ReferenceInputManager
                    disabled={isGenerating}
                    key={inputType}
                    label={inputType
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                    onChange={(file) =>
                      handleReferenceInputChange(inputType, file)
                    }
                    required={false}
                    type={inputType}
                    value={referenceInputs[inputType]}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Quick Actions */}
        <Separator />
        <div className="space-y-2">
          <Label className="font-medium text-xs">Quick Start</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-auto flex-col gap-0.5 py-2"
              disabled={isGenerating}
              onClick={() => setTemplateDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-[10px]">Prompt Templates</span>
              <span className="text-muted-foreground text-[9px]">
                Ready-made prompts
              </span>
            </Button>
            <Button
              className="h-auto flex-col gap-0.5 py-2"
              disabled={isGenerating}
              onClick={() => setProjectTemplateDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Wand2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-[10px]">Project Templates</span>
              <span className="text-muted-foreground text-[9px]">
                Pre-configured setups
              </span>
            </Button>
          </div>
        </div>

        {/* Prompt - Only show if needed */}
        {needsPrompt && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  className="flex items-center gap-1.5 font-medium text-xs"
                  htmlFor="prompt"
                >
                  Prompt
                  <Badge className="px-1 py-0 text-[9px]" variant="destructive">
                    Required
                  </Badge>
                </Label>
                <Button
                  className="h-6 text-[10px]"
                  disabled={isGenerating}
                  onClick={() => setTemplateDialogOpen(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                  Use Template
                </Button>
              </div>
              <Textarea
                className="resize-none text-xs"
                disabled={isGenerating}
                id="prompt"
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate in detail... or click 'Use Template' for ready-made prompts"
                rows={4}
                value={prompt}
              />
              <p className="flex items-center gap-1 text-muted-foreground text-[10px]">
                <Info className="h-2.5 w-2.5" />
                Be specific and descriptive for best results
              </p>
            </div>
          </>
        )}

        {/* Advanced Settings - Accordion */}
        <Separator />
        <Accordion collapsible defaultValue="advanced" type="single">
          <AccordionItem className="border-none" value="advanced">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="font-medium text-xs">Advanced Settings</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-1">
              {/* Negative Prompt */}
              <div className="space-y-1.5">
                <Label className="text-[10px]" htmlFor="negative-prompt">
                  Negative Prompt
                </Label>
                <Textarea
                  className="resize-none text-xs"
                  disabled={isGenerating}
                  id="negative-prompt"
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What to avoid in the generation..."
                  rows={2}
                  value={negativePrompt}
                />
              </div>

              {/* Image Size - Only for image models */}
              {selectedModel?.type === "image" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px]" htmlFor="image-size">
                    Image Size
                  </Label>
                  <Select
                    disabled={isGenerating}
                    onValueChange={setImageSize}
                    value={imageSize}
                  >
                    <SelectTrigger className="h-8 text-xs" id="image-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square (1:1)</SelectItem>
                      <SelectItem value="square_hd">Square HD (1:1)</SelectItem>
                      <SelectItem value="portrait_4_3">
                        Portrait (4:3)
                      </SelectItem>
                      <SelectItem value="portrait_16_9">
                        Portrait (16:9)
                      </SelectItem>
                      <SelectItem value="landscape_4_3">
                        Landscape (4:3)
                      </SelectItem>
                      <SelectItem value="landscape_16_9">
                        Landscape (16:9)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Aspect Ratio - For video models that support it */}
              {selectedModel?.type === "video" && 
               selectedModel.modelParameters?.defaults?.aspect_ratio !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]" htmlFor="aspect-ratio">
                      Aspect Ratio
                    </Label>
                    {selectedModel.modelParameters.defaults.aspect_ratio && (
                      <Badge className="px-1.5 py-0 text-[9px]" variant="secondary">
                        Default: {String(selectedModel.modelParameters.defaults.aspect_ratio)}
                      </Badge>
                    )}
                  </div>
                  <Select
                    disabled={isGenerating}
                    onValueChange={setAspectRatio}
                    value={aspectRatio}
                  >
                    <SelectTrigger className="h-8 text-xs" id="aspect-ratio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Resolution - For video models that support it */}
              {selectedModel?.type === "video" && 
               selectedModel.modelParameters?.defaults?.resolution !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]" htmlFor="resolution">
                      Resolution
                    </Label>
                    {selectedModel.modelParameters.defaults.resolution && (
                      <Badge className="px-1.5 py-0 text-[9px]" variant="secondary">
                        Default: {String(selectedModel.modelParameters.defaults.resolution)}
                      </Badge>
                    )}
                  </div>
                  <Select
                    disabled={isGenerating}
                    onValueChange={setResolution}
                    value={resolution}
                  >
                    <SelectTrigger className="h-8 text-xs" id="resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Duration - Only for video models */}
              {selectedModel?.type === "video" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]">Duration (seconds)</Label>
                    <span className="text-muted-foreground text-[10px]">
                      {duration[0]}s
                    </span>
                  </div>
                  <Slider
                    disabled={isGenerating}
                    max={30}
                    min={1}
                    onValueChange={setDuration}
                    step={1}
                    value={duration}
                  />
                  {selectedModel.modelParameters?.defaults?.duration !== undefined && (
                    <p className="text-muted-foreground text-[9px]">
                      Recommended: {String(selectedModel.modelParameters.defaults.duration)}
                    </p>
                  )}
                </div>
              )}

              {/* FPS - Only for video models */}
              {selectedModel?.type === "video" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]">FPS (Frames Per Second)</Label>
                    <span className="text-muted-foreground text-[10px]">
                      {fps[0]} fps
                    </span>
                  </div>
                  <Slider
                    disabled={isGenerating}
                    max={60}
                    min={12}
                    onValueChange={setFps}
                    step={6}
                    value={fps}
                  />
                </div>
              )}

              {/* Enhance Prompt - Only for models that support it */}
              {selectedModel?.modelParameters?.defaults?.enhance_prompt !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-[10px]" htmlFor="enhance-prompt">
                        Enhance Prompt
                      </Label>
                      <p className="text-muted-foreground text-[9px]">
                        Automatically improve prompt quality
                      </p>
                    </div>
                    <Switch
                      checked={enhancePrompt}
                      disabled={isGenerating}
                      id="enhance-prompt"
                      onCheckedChange={setEnhancePrompt}
                    />
                  </div>
                </div>
              )}

              {/* Auto Fix - Only for models that support it */}
              {selectedModel?.modelParameters?.defaults?.auto_fix !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-[10px]" htmlFor="auto-fix">
                        Auto Fix
                      </Label>
                      <p className="text-muted-foreground text-[9px]">
                        Automatically fix prompt policy violations
                      </p>
                    </div>
                    <Switch
                      checked={autoFix}
                      disabled={isGenerating}
                      id="auto-fix"
                      onCheckedChange={setAutoFix}
                    />
                  </div>
                </div>
              )}

              {/* Fixed Parameters Info */}
              {selectedModel?.modelParameters?.fixed && Object.keys(selectedModel.modelParameters.fixed).length > 0 && (
                <Card className="border-border bg-muted/30">
                  <CardContent className="px-2.5 pt-2.5 pb-2">
                    <div className="flex items-start gap-1.5">
                      <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground text-[10px]">
                          Fixed Parameters
                        </p>
                        <p className="text-muted-foreground text-[10px] leading-tight">
                          {Object.entries(selectedModel.modelParameters.fixed).map(([key, value]) => (
                            <span key={key} className="block">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inference Steps */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">Inference Steps</Label>
                  <span className="text-muted-foreground text-[10px]">
                    {steps[0]}
                  </span>
                </div>
                <Slider
                  disabled={isGenerating}
                  max={50}
                  min={1}
                  onValueChange={setSteps}
                  step={1}
                  value={steps}
                />
                <p className="text-muted-foreground text-[9px]">
                  More steps = better quality but slower generation
                </p>
              </div>

              {/* Guidance Scale */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]">Guidance Scale</Label>
                  <span className="text-muted-foreground text-[10px]">
                    {guidanceScale[0]}
                  </span>
                </div>
                <Slider
                  disabled={isGenerating}
                  max={20}
                  min={1}
                  onValueChange={setGuidanceScale}
                  step={0.5}
                  value={guidanceScale}
                />
                <p className="text-muted-foreground text-[9px]">
                  Higher values = more adherence to prompt
                </p>
              </div>

              {/* Seed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px]" htmlFor="random-seed">
                    Random Seed
                  </Label>
                  <Switch
                    checked={randomSeed}
                    disabled={isGenerating}
                    id="random-seed"
                    onCheckedChange={setRandomSeed}
                  />
                </div>
                {!randomSeed && (
                  <Input
                    className="h-8 text-xs"
                    disabled={isGenerating}
                    onChange={(e) =>
                      setSeed(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Enter seed..."
                    type="number"
                    value={seed || ""}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Validation Warning */}
        {!canGenerate && !isGenerating && (
          <Card className="border-border bg-muted/50">
            <CardContent className="px-2.5 pt-2.5 pb-2">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground text-[10px]">
                    Cannot Generate
                  </p>
                  <p className="text-muted-foreground text-[10px] leading-tight">
                    {!selectedModel && "Please select a model"}
                    {selectedModel &&
                      needsPrompt &&
                      !prompt.trim() &&
                      "Please enter a prompt"}
                    {selectedModel &&
                      !hasAllRequiredInputs &&
                      "Please provide all required inputs"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Button */}
        <Button
          className="h-9 w-full font-medium text-sm"
          disabled={!canGenerate || isGenerating}
          onClick={handleGenerate}
          size="default"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 h-4 w-4" />
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

        {/* Template Picker Dialog */}
        <TemplatePickerDialog
          generationType={generationType}
          onOpenChange={setTemplateDialogOpen}
          onSelectTemplate={handleSelectPromptTemplate}
          open={templateDialogOpen}
        />

        {/* Project Template Picker */}
        <ProjectTemplatePicker
          onOpenChange={setProjectTemplateDialogOpen}
          onSelectTemplate={handleSelectProjectTemplate}
          open={projectTemplateDialogOpen}
        />
      </div>
    </ScrollArea>
  );
}
