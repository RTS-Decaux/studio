"use client";

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
import { PROJECT_TEMPLATE_CATEGORIES, TEMPLATE_CATEGORIES } from "@/lib/studio/templates";
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
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

  const isPromptTemplate = (t: PromptTemplate | ProjectTemplate): t is PromptTemplate => {
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
    localStorage.setItem("studioTemplate", JSON.stringify({
      type,
      template,
    }));
    toast.success("Template ready! Redirecting to generation...");
    router.push("/studio/generate");
  };

  const category = isPromptTemplate(template)
    ? TEMPLATE_CATEGORIES.find(c => c.id === template.category)
    : PROJECT_TEMPLATE_CATEGORIES.find(c => c.id === template.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {!isPromptTemplate(template) && (
              <span className="text-4xl">{template.icon}</span>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{template.name}</DialogTitle>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="shrink-0">
              {category?.icon} {category?.name}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Generation Types */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generation Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {isPromptTemplate(template) ? (
                  template.generationType.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type.includes("video") ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      {type === "text-to-image" ? "Text to Image" : 
                       type === "text-to-video" ? "Text to Video" :
                       type === "image-to-image" ? "Image to Image" :
                       type === "image-to-video" ? "Image to Video" : type}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    {template.generationType === "text-to-video" || template.generationType === "image-to-video" ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                    {template.generationType === "text-to-image" ? "Text to Image" : 
                     template.generationType === "text-to-video" ? "Text to Video" :
                     template.generationType === "image-to-image" ? "Image to Image" :
                     template.generationType === "image-to-video" ? "Image to Video" : template.generationType}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Prompt Template Details */}
            {isPromptTemplate(template) && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Positive Prompt</h4>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {template.prompt}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Negative Prompt</h4>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {template.negativePrompt}
                    </p>
                  </div>
                </div>

                {template.examples && template.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Example Subjects</h4>
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
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Pre-configured Settings
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {template.defaultSettings.imageSize && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Size</div>
                          <div className="font-medium text-sm">{template.defaultSettings.imageSize}</div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.duration && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="font-medium text-sm">{template.defaultSettings.duration}s</div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.fps && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">FPS</div>
                          <div className="font-medium text-sm">{template.defaultSettings.fps}</div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.steps && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Steps</div>
                          <div className="font-medium text-sm">{template.defaultSettings.steps}</div>
                        </div>
                      </div>
                    )}
                    {template.defaultSettings.guidance && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Guidance</div>
                          <div className="font-medium text-sm">{template.defaultSettings.guidance}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {template.promptTemplate && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Prompt Template</h4>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {template.promptTemplate}
                      </p>
                    </div>
                  </div>
                )}

                {template.negativePromptTemplate && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Negative Prompt</h4>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {template.negativePromptTemplate}
                      </p>
                    </div>
                  </div>
                )}

                {template.modelId && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recommended Model</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {template.modelId}
                    </Badge>
                  </div>
                )}
              </>
            )}

            {/* Tags */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Tags</h4>
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
          <Button variant="outline" onClick={handleCopy} className="gap-2">
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
          <Button onClick={handleUseTemplate} className="gap-2">
            Use Template
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
