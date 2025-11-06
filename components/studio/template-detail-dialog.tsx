"use client";

import {
  ArrowRight,
  CheckCheck,
  Clock,
  Copy,
  Gauge,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Target,
  Video,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ProjectTemplate, PromptTemplate } from "@/lib/studio/templates";
import {
  PROJECT_TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORIES,
} from "@/lib/studio/templates";

type TemplateDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | ProjectTemplate | null;
  type: "prompt" | "project";
};

export function TemplateDetailDialog({
  open,
  onOpenChange,
  template,
  type,
}: TemplateDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  if (!template) return null;

  const isPromptTemplate = (
    t: PromptTemplate | ProjectTemplate
  ): t is PromptTemplate => {
    return "prompt" in t;
  };

  const handleCopy = () => {
    if (isPromptTemplate(template)) {
      const text = `${template.prompt}\n\nNegative: ${template.negativePrompt}`;
      navigator.clipboard.writeText(text);
    } else {
      const settings = template.defaultSettings;
      const text = `Template: ${template.name}
Prompt: ${template.promptTemplate || ""}
Negative: ${template.negativePromptTemplate || ""}
Settings: ${JSON.stringify(settings, null, 2)}`;
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    toast.success("Template copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseTemplate = () => {
    // Store template in localStorage for use in generation page
    localStorage.setItem(
      "studioTemplate",
      JSON.stringify({
        type,
        template,
      })
    );
    toast.success("Template ready! Redirecting to generation...");
    router.push("/studio/generate");
  };

  const category = isPromptTemplate(template)
    ? TEMPLATE_CATEGORIES.find((c) => c.id === template.category)
    : PROJECT_TEMPLATE_CATEGORIES.find((c) => c.id === template.category);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {!isPromptTemplate(template) && (
              <span className="text-4xl">{template.icon}</span>
            )}
            <div className="flex-1">
              <DialogTitle className="mb-2 text-2xl">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
            </div>
            <Badge className="shrink-0" variant="outline">
              {category?.icon} {category?.name}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Generation Types */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                Generation Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {isPromptTemplate(template) ? (
                  template.generationType.map((type) => (
                    <Badge className="gap-1" key={type} variant="secondary">
                      {type.includes("video") ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      {type === "text-to-image"
                        ? "Text to Image"
                        : type === "text-to-video"
                          ? "Text to Video"
                          : type === "image-to-image"
                            ? "Image to Image"
                            : type === "image-to-video"
                              ? "Image to Video"
                              : type}
                    </Badge>
                  ))
                ) : (
                  <Badge className="gap-1" variant="secondary">
                    {template.generationType === "text-to-video" ||
                    template.generationType === "image-to-video" ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                    {template.generationType === "text-to-image"
                      ? "Text to Image"
                      : template.generationType === "text-to-video"
                        ? "Text to Video"
                        : template.generationType === "image-to-image"
                          ? "Image to Image"
                          : template.generationType === "image-to-video"
                            ? "Image to Video"
                            : template.generationType}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Prompt Template Details */}
            {isPromptTemplate(template) && (
              <>
                <div>
                  <h4 className="mb-3 font-semibold text-sm">
                    Positive Prompt
                  </h4>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {template.prompt}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-sm">
                    Negative Prompt
                  </h4>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {template.negativePrompt}
                    </p>
                  </div>
                </div>

                {template.examples && template.examples.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">
                      Example Subjects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.examples.map((example) => (
                        <Badge key={example} variant="outline">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Project Template Details */}
            {!isPromptTemplate(template) && (
              <>
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-sm">
                    <Layers className="h-4 w-4" />
                    Pre-configured Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {template.defaultSettings.imageSize && (
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Size
                          </div>
                          <div className="font-medium text-sm">
                            {template.defaultSettings.imageSize}
                          </div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.duration && (
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Duration
                          </div>
                          <div className="font-medium text-sm">
                            {template.defaultSettings.duration}s
                          </div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.fps && (
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            FPS
                          </div>
                          <div className="font-medium text-sm">
                            {template.defaultSettings.fps}
                          </div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.steps && (
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Steps
                          </div>
                          <div className="font-medium text-sm">
                            {template.defaultSettings.steps}
                          </div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.guidance && (
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Guidance
                          </div>
                          <div className="font-medium text-sm">
                            {template.defaultSettings.guidance}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {template.promptTemplate && (
                  <div>
                    <h4 className="mb-3 font-semibold text-sm">
                      Prompt Template
                    </h4>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {template.promptTemplate}
                      </p>
                    </div>
                  </div>
                )}

                {template.negativePromptTemplate && (
                  <div>
                    <h4 className="mb-3 font-semibold text-sm">
                      Negative Prompt
                    </h4>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {template.negativePromptTemplate}
                      </p>
                    </div>
                  </div>
                )}

                {template.modelId && (
                  <div>
                    <h4 className="mb-2 font-semibold text-sm">
                      Recommended Model
                    </h4>
                    <Badge className="font-mono text-xs" variant="outline">
                      {template.modelId}
                    </Badge>
                  </div>
                )}
              </>
            )}

            {/* Tags */}
            <div>
              <h4 className="mb-2 font-semibold text-sm">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button className="gap-2" onClick={handleCopy} variant="outline">
            {copied ? (
              <>
                <CheckCheck className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button className="gap-2" onClick={handleUseTemplate}>
            Use Template
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
