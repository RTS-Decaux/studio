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
import type { FalStudioModel, ReferenceInputKind } from "@/lib/ai/studio-models";
import { generateAction } from "@/lib/studio/actions";
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
  const [projectTemplateDialogOpen, setProjectTemplateDialogOpen] = useState(false);

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

  const handleSelectProjectTemplate = useCallback((template: ProjectTemplate) => {
    // Apply settings from template
    const settings = template.defaultSettings;
    
    if (settings.imageSize) setImageSize(settings.imageSize);
    if (settings.duration) setDuration([settings.duration]);
    if (settings.fps) setFps([settings.fps]);
    if (settings.steps) setSteps([settings.steps]);
    if (settings.guidance) setGuidanceScale([settings.guidance]);

    // Apply prompt templates if available
    if (template.promptTemplate) setPrompt(template.promptTemplate);
    if (template.negativePromptTemplate) setNegativePrompt(template.negativePromptTemplate);

    toast.success(`Project template "${template.name}" loaded!`);
  }, []);

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
        referenceImageUrl: referenceInputs["reference-image"]
          ? undefined
          : undefined, // Will be handled by upload
        firstFrameUrl: referenceInputs["first-frame"] ? undefined : undefined,
        lastFrameUrl: referenceInputs["last-frame"] ? undefined : undefined,
        referenceVideoUrl: referenceInputs["reference-video"]
          ? undefined
          : undefined,
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
            Choose your generation type, select a model, and configure
            parameters
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
          <Label className="text-sm font-medium">AI Model</Label>
          <button
            onClick={() => setModelDialogOpen(true)}
            className="w-full flex items-start justify-between p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:bg-card/80 transition-all text-left group"
          >
            {selectedModel ? (
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{selectedModel.name}</span>
                  {selectedModel.quality && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                    >
                      {selectedModel.quality}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {selectedModel.description}
                </p>
                <ModelCapabilityBadge model={selectedModel} />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Select a model...
              </span>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground/60 shrink-0 ml-2 group-hover:text-purple-500 transition-colors" />
          </button>

          {/* Model Requirements Info */}
          {selectedModel &&
            (modelRequirements.required.length > 0 ||
              modelRequirements.optional.length > 0) && (
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                        Model Requirements
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
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
            <div className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Reference Inputs
                </Label>

                {modelRequirements.required.map((inputType) => (
                  <ReferenceInputManager
                    key={inputType}
                    type={inputType}
                    label={inputType
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                    required={true}
                    value={referenceInputs[inputType]}
                    onChange={(file) =>
                      handleReferenceInputChange(inputType, file)
                    }
                    disabled={isGenerating}
                  />
                ))}

                {modelRequirements.optional.map((inputType) => (
                  <ReferenceInputManager
                    key={inputType}
                    type={inputType}
                    label={inputType
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                    required={false}
                    value={referenceInputs[inputType]}
                    onChange={(file) =>
                      handleReferenceInputChange(inputType, file)
                    }
                    disabled={isGenerating}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Quick Actions */}
        <Separator />
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Start</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(true)}
              className="h-auto py-3 flex-col gap-1 hover:border-purple-500/50 hover:bg-purple-500/5"
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium">Prompt Templates</span>
              <span className="text-xs text-muted-foreground">Ready-made prompts</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setProjectTemplateDialogOpen(true)}
              className="h-auto py-3 flex-col gap-1 hover:border-blue-500/50 hover:bg-blue-500/5"
              disabled={isGenerating}
            >
              <Wand2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium">Project Templates</span>
              <span className="text-xs text-muted-foreground">Pre-configured setups</span>
            </Button>
          </div>
        </div>

        {/* Prompt - Only show if needed */}
        {needsPrompt && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                  Prompt
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    Required
                  </Badge>
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateDialogOpen(true)}
                  disabled={isGenerating}
                  className="h-7 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </div>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to generate in detail... or click 'Use Template' for ready-made prompts"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Be specific and descriptive for best results
              </p>
            </div>
          </>
        )}

        {/* Advanced Settings - Accordion */}
        <Separator />
        <Accordion type="single" collapsible defaultValue="advanced">
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="text-sm font-medium">Advanced Settings</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
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
                  rows={3}
                  className="resize-none text-sm"
                  disabled={isGenerating}
                />
              </div>

              {/* Image Size - Only for image models */}
              {selectedModel?.type === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="image-size" className="text-xs">
                    Image Size
                  </Label>
                  <Select
                    value={imageSize}
                    onValueChange={setImageSize}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="image-size">
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

              {/* Duration - Only for video models */}
              {selectedModel?.type === "video" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Duration (seconds)</Label>
                    <span className="text-xs text-muted-foreground">
                      {duration[0]}s
                    </span>
                  </div>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    min={1}
                    max={30}
                    step={1}
                    disabled={isGenerating}
                  />
                </div>
              )}

              {/* FPS - Only for video models */}
              {selectedModel?.type === "video" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">FPS (Frames Per Second)</Label>
                    <span className="text-xs text-muted-foreground">
                      {fps[0]} fps
                    </span>
                  </div>
                  <Slider
                    value={fps}
                    onValueChange={setFps}
                    min={12}
                    max={60}
                    step={6}
                    disabled={isGenerating}
                  />
                </div>
              )}

              {/* Inference Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Inference Steps</Label>
                  <span className="text-xs text-muted-foreground">
                    {steps[0]}
                  </span>
                </div>
                <Slider
                  value={steps}
                  onValueChange={setSteps}
                  min={1}
                  max={50}
                  step={1}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  More steps = better quality but slower generation
                </p>
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
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values = more adherence to prompt
                </p>
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
                    disabled={isGenerating}
                  />
                </div>
                {!randomSeed && (
                  <Input
                    type="number"
                    placeholder="Enter seed..."
                    value={seed || ""}
                    onChange={(e) =>
                      setSeed(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={isGenerating}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Validation Warning */}
        {!canGenerate && !isGenerating && (
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                    Cannot Generate
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {!selectedModel && "Please select a model"}
                    {selectedModel && needsPrompt && !prompt.trim() && "Please enter a prompt"}
                    {selectedModel && !hasAllRequiredInputs && "Please provide all required inputs"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
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

        {/* Template Picker Dialog */}
        <TemplatePickerDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          onSelectTemplate={handleSelectPromptTemplate}
          generationType={generationType}
        />

        {/* Project Template Picker */}
        <ProjectTemplatePicker
          open={projectTemplateDialogOpen}
          onOpenChange={setProjectTemplateDialogOpen}
          onSelectTemplate={handleSelectProjectTemplate}
        />
      </div>
    </ScrollArea>
  );
}
