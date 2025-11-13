"use client";

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
  ImageIcon,
  Info,
  Layers,
  Loader2,
  Sparkles,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { ModelCapabilityBadge } from "./model-capability-badge";
import { ModelSelectorDialog } from "./model-selector-dialog";
import { ProjectTemplatePicker } from "./project-template-picker";
import { ReferenceInputManager } from "./reference-input-manager";
import { TemplatePickerDialog } from "./template-picker-dialog";

type GenerationPanelProps = {
  projectId?: string;
  onGenerationStart?: (generationId: string) => void;
  onGenerationComplete?: () => void;
};

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
    description: "Generate standalone images from prompts",
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
    value: "video-to-video",
    label: "Video to Video",
    icon: Layers,
    description: "Remix or extend existing clips",
  },
  {
    value: "image-to-image",
    label: "Image to Image",
    icon: ImageIcon,
    description: "Edit or restyle existing pictures",
  },
];

export function GenerationPanelV2({
  projectId,
  onGenerationStart,
  onGenerationComplete,
}: GenerationPanelProps) {
  const [generationType, setGenerationType] =
    useState<StudioGenerationType>("text-to-video");
  const [selectedModel, setSelectedModel] = useState<FalStudioModel | null>(
    () => getRecommendedModels(generationType)[0] || null
  );
  const [modelDialogOpen, setModelDialogOpen] = useState(false);

  // Generation parameters
  const [prompt, setPrompt] = useState("");

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
  const [modelSettings, setModelSettings] = useState<
    Record<string, string | number | boolean>
  >({});

  const buildDefaultSettings = useCallback((model: FalStudioModel | null) => {
    if (!model?.settings) {
      return {};
    }

    return model.settings.reduce<Record<string, string | number | boolean>>(
      (acc, setting) => {
        if (setting.type === "toggle" || setting.type === "select") {
          acc[setting.key] = setting.defaultValue;
        } else {
          acc[setting.key] = setting.defaultValue ?? "";
        }
        return acc;
      },
      {}
    );
  }, []);

  useEffect(() => {
    setModelSettings(buildDefaultSettings(selectedModel));
  }, [selectedModel, buildDefaultSettings]);

  const selectedModelSettings = useMemo(
    () => selectedModel?.settings ?? [],
    [selectedModel]
  );

  const availableSettingKeys = useMemo(
    () => new Set(selectedModelSettings.map((setting) => setting.key)),
    [selectedModelSettings]
  );

  const findSettingByKey = useCallback(
    (key: string) =>
      selectedModelSettings.find((setting) => setting.key === key),
    [selectedModelSettings]
  );

  const hasSetting = useCallback(
    (key: string) => availableSettingKeys.has(key),
    [availableSettingKeys]
  );

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

  const promptRequired = useMemo(() => {
    if (selectedModel) {
      return selectedModel.requiresPrompt !== false;
    }
    return generationType.startsWith("text-to");
  }, [generationType, selectedModel]);

  const requiredSettingMissing = useMemo(() => {
    return selectedModelSettings.some((setting) => {
      if (!setting.required) {
        return false;
      }
      const value = modelSettings[setting.key];

      switch (setting.type) {
        case "toggle":
          return typeof value !== "boolean";
        case "select":
          return value === undefined || value === "";
        case "text":
        case "textarea":
          return typeof value !== "string" || value.trim().length === 0;
        default:
          return false;
      }
    });
  }, [modelSettings, selectedModelSettings]);

  const setSettingValue = useCallback(
    (key: string, value: string | number | boolean) => {
      setModelSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const setSettingIfAvailable = useCallback(
    (key: string, value: string | number | boolean) => {
      const setting = findSettingByKey(key);
      if (!setting) {
        return;
      }

      if (setting.type === "select") {
        const match = setting.options.find(
          (option) => String(option.value) === String(value)
        );
        if (!match) {
          return;
        }
        setSettingValue(key, match.value);
        return;
      }

      if (setting.type === "toggle") {
        if (typeof value !== "boolean") {
          return;
        }
        setSettingValue(key, value);
        return;
      }

      setSettingValue(key, String(value));
    },
    [findSettingByKey, setSettingValue]
  );

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
  const handleSelectPromptTemplate = useCallback(
    (template: PromptTemplate) => {
      setPrompt(template.prompt);
      if (hasSetting("negative_prompt")) {
        setSettingValue("negative_prompt", template.negativePrompt || "");
      }
      toast.success(`Template "${template.name}" applied!`);
    },
    [hasSetting, setSettingValue]
  );

  const handleSelectProjectTemplate = useCallback(
    (template: ProjectTemplate) => {
      // Apply settings from template
      const settings = template.defaultSettings;

      if (settings.imageSize) {
        setSettingIfAvailable("image_size", settings.imageSize);
      }
      if (settings.duration) {
        setSettingIfAvailable("duration", settings.duration);
      }
      if (settings.fps) {
        setSettingIfAvailable("fps", settings.fps);
      }
      if (settings.steps) {
        setSettingIfAvailable("num_inference_steps", settings.steps);
      }
      if (settings.guidance) {
        setSettingIfAvailable("guidance_scale", settings.guidance);
      }

      // Apply prompt templates if available
      if (template.promptTemplate) {
        setPrompt(template.promptTemplate);
      }
      if (template.negativePromptTemplate) {
        setSettingIfAvailable(
          "negative_prompt",
          template.negativePromptTemplate
        );
      }

      toast.success(`Project template "${template.name}" loaded!`);
    },
    [setSettingIfAvailable]
  );

  const handleGenerate = async () => {
    if (!selectedModel) {
      toast.error("Please select a model", {
        description: "Choose an AI model to start generating",
      });
      return;
    }

    if (promptRequired && !prompt.trim()) {
      toast.error("Prompt required", {
        description: "Please describe what you want to generate",
      });
      return;
    }

    if (requiredSettingMissing) {
      toast.error("Model settings incomplete", {
        description: "Fill in all required model fields",
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
      const parameterPayload = selectedModelSettings.reduce<
        Record<string, unknown>
      >((acc, setting) => {
        const value = modelSettings[setting.key];
        if (value === undefined) {
          return acc;
        }

        if (setting.type === "text" || setting.type === "textarea") {
          if (typeof value !== "string") {
            return acc;
          }
          const trimmed = value.trim();
          if (!trimmed && !setting.required) {
            return acc;
          }
          acc[setting.key] = trimmed;
          return acc;
        }

        acc[setting.key] = value;
        return acc;
      }, {});

      const parameters =
        Object.keys(parameterPayload).length > 0 ? parameterPayload : undefined;

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
        referenceImageUrl: uploadedUrls["reference-image"],
        firstFrameUrl: uploadedUrls["first-frame"],
        lastFrameUrl: uploadedUrls["last-frame"],
        referenceVideoUrl: uploadedUrls["reference-video"],
        parameters,
      });

      showStudioSuccess(
        "Generation started!",
        `Your ${generationType.replace("-", " ")} is being generated`
      );
      onGenerationStart?.(response.generationId);

      // Reset form
      setPrompt("");
      setReferenceInputs({
        "reference-image": null,
        "first-frame": null,
        "last-frame": null,
        "reference-video": null,
      });
      setModelSettings(buildDefaultSettings(selectedModel));

      // Call completion callback to refresh UI
      onGenerationComplete?.();
    } catch (error: any) {
      showStudioError(error, "generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = useMemo(() => {
    if (!selectedModel) {
      return false;
    }
    if (promptRequired && !prompt.trim()) {
      return false;
    }
    if (!hasAllRequiredInputs) {
      return false;
    }
    if (requiredSettingMissing) {
      return false;
    }
    return true;
  }, [
    selectedModel,
    promptRequired,
    prompt,
    hasAllRequiredInputs,
    requiredSettingMissing,
  ]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-semibold text-base text-foreground tracking-tight">
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
                    <p className="line-clamp-2 text-[10px] text-muted-foreground leading-tight">
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
                <p className="line-clamp-1 text-[10px] text-muted-foreground">
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
                      <p className="font-medium text-[10px] text-foreground">
                        Model Requirements
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
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
              <span className="text-[9px] text-muted-foreground">
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
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-[10px]">Project Templates</span>
              <span className="text-[9px] text-muted-foreground">
                Pre-configured setups
              </span>
            </Button>
          </div>
        </div>

        {/* Prompt - Only show if needed */}
        {promptRequired && (
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
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Info className="h-2.5 w-2.5" />
                Be specific and descriptive for best results
              </p>
            </div>
          </>
        )}

        {selectedModelSettings.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-xs">Model Settings</Label>
                <Badge className="px-1.5 py-0 text-[10px]" variant="outline">
                  {selectedModelSettings.length} fields
                </Badge>
              </div>
              <div className="space-y-3">
                {selectedModelSettings.map((setting) => {
                  const value = modelSettings[setting.key];

                  if (setting.type === "select") {
                    const selectValue =
                      value !== undefined
                        ? String(value)
                        : String(setting.defaultValue);
                    return (
                      <div className="space-y-1.5" key={setting.key}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-[10px]">
                              {setting.label}
                            </Label>
                            {setting.required && (
                              <Badge
                                className="px-1 py-0 text-[9px]"
                                variant="destructive"
                              >
                                Required
                              </Badge>
                            )}
                          </div>
                          <Badge
                            className="px-1.5 py-0 text-[9px]"
                            variant="secondary"
                          >
                            Default: {String(setting.defaultValue)}
                          </Badge>
                        </div>
                        <Select
                          disabled={isGenerating}
                          onValueChange={(val) => {
                            const option = setting.options.find(
                              (opt) => String(opt.value) === val
                            );
                            setSettingValue(
                              setting.key,
                              option ? option.value : val
                            );
                          }}
                          value={selectValue}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options.map((option) => (
                              <SelectItem
                                key={String(option.value)}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {setting.helperText && (
                          <p className="text-[9px] text-muted-foreground">
                            {setting.helperText}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (setting.type === "toggle") {
                    const checked =
                      typeof value === "boolean" ? value : Boolean(value);
                    return (
                      <div className="space-y-1.5" key={setting.key}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-[10px]">
                              {setting.label}
                            </Label>
                            {setting.required && (
                              <Badge
                                className="px-1 py-0 text-[9px]"
                                variant="destructive"
                              >
                                Required
                              </Badge>
                            )}
                            {setting.helperText && (
                              <p className="text-[9px] text-muted-foreground">
                                {setting.helperText}
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={checked}
                            disabled={isGenerating}
                            onCheckedChange={(val) =>
                              setSettingValue(setting.key, val)
                            }
                          />
                        </div>
                      </div>
                    );
                  }

                  const isTextarea = setting.type === "textarea";
                  const textValue =
                    typeof value === "string"
                      ? value
                      : setting.defaultValue || "";

                  return (
                    <div className="space-y-1.5" key={setting.key}>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">
                          {setting.label}
                          {setting.required && (
                            <Badge
                              className="ml-1 px-1 py-0 text-[9px]"
                              variant="destructive"
                            >
                              Required
                            </Badge>
                          )}
                        </Label>
                      </div>
                      {isTextarea ? (
                        <Textarea
                          className="resize-none text-xs"
                          disabled={isGenerating}
                          onChange={(e) =>
                            setSettingValue(setting.key, e.target.value)
                          }
                          placeholder={setting.placeholder}
                          rows={3}
                          value={textValue as string}
                        />
                      ) : (
                        <Input
                          className="h-8 text-xs"
                          disabled={isGenerating}
                          onChange={(e) =>
                            setSettingValue(setting.key, e.target.value)
                          }
                          placeholder={setting.placeholder}
                          value={textValue as string}
                        />
                      )}
                      {setting.helperText && (
                        <p className="text-[9px] text-muted-foreground">
                          {setting.helperText}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Validation Warning */}
        {!canGenerate && !isGenerating && (
          <Card className="border-border bg-muted/50">
            <CardContent className="px-2.5 pt-2.5 pb-2">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="font-medium text-[10px] text-foreground">
                    Cannot Generate
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {!selectedModel && "Please select a model"}
                    {selectedModel &&
                      promptRequired &&
                      !prompt.trim() &&
                      "Please enter a prompt"}
                    {selectedModel &&
                      !hasAllRequiredInputs &&
                      "Please provide all required inputs"}
                    {selectedModel &&
                      requiredSettingMissing &&
                      "Fill the highlighted model settings"}
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
