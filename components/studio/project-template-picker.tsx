"use client";

import {
  Image as ImageIcon,
  Settings2,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PROJECT_TEMPLATE_CATEGORIES,
  PROJECT_TEMPLATES,
  type ProjectTemplate,
} from "@/lib/studio/templates";
import { cn } from "@/lib/utils";

interface ProjectTemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export function ProjectTemplatePicker({
  open,
  onOpenChange,
  onSelectTemplate,
}: ProjectTemplatePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") {
      return PROJECT_TEMPLATES;
    }
    return PROJECT_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const categoriesWithCount = useMemo(() => {
    return PROJECT_TEMPLATE_CATEGORIES.map((cat) => ({
      ...cat,
      count: PROJECT_TEMPLATES.filter((t) => t.category === cat.id).length,
    }));
  }, []);

  const handleSelect = (template: ProjectTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] max-w-5xl border border-border bg-card shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-bold text-transparent text-xl">
                Project Templates
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground text-sm">
                Start with pre-configured settings for common use cases
              </DialogDescription>
            </div>
            <Badge className="text-xs" variant="secondary">
              {filteredTemplates.length} templates
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Categories */}
        <Tabs onValueChange={setSelectedCategory} value={selectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger className="text-xs" value="all">
              <Sparkles className="mr-1 h-3 w-3" />
              All
            </TabsTrigger>
            {categoriesWithCount.map((cat) => (
              <TabsTrigger className="text-xs" key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <ProjectTemplateCard
                key={template.id}
                onSelect={handleSelect}
                template={template}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ProjectTemplateCard({
  template,
  onSelect,
}: {
  template: ProjectTemplate;
  onSelect: (template: ProjectTemplate) => void;
}) {
  const isVideo = template.generationType.includes("video");

  return (
    <button
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-purple-500/50 hover:bg-card/80 hover:shadow-lg hover:shadow-purple-500/10"
      onClick={() => onSelect(template)}
    >
      {/* Icon & Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-3xl">{template.icon}</div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
            {template.name}
          </h4>
          <p className="line-clamp-2 text-muted-foreground text-xs">
            {template.description}
          </p>
        </div>
      </div>

      {/* Generation Type Badge */}
      <div className="flex items-center gap-2">
        <Badge
          className={cn(
            "px-2 py-0.5 text-xs",
            isVideo
              ? "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400"
              : "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          )}
          variant="outline"
        >
          {isVideo ? (
            <>
              <Video className="mr-1 h-3 w-3" />
              Video
            </>
          ) : (
            <>
              <ImageIcon className="mr-1 h-3 w-3" />
              Image
            </>
          )}
        </Badge>
        <Badge className="bg-muted/50 px-2 py-0.5 text-xs" variant="secondary">
          {template.category}
        </Badge>
      </div>

      {/* Settings Preview */}
      <div className="space-y-2 rounded-lg bg-muted/30 p-3">
        <div className="flex items-center gap-1.5 font-medium text-foreground/70 text-xs">
          <Settings2 className="h-3 w-3" />
          Pre-configured Settings
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {template.defaultSettings.imageSize && (
            <div className="text-muted-foreground">
              Size:{" "}
              <span className="font-medium">
                {template.defaultSettings.imageSize}
              </span>
            </div>
          )}
          {template.defaultSettings.duration && (
            <div className="text-muted-foreground">
              Duration:{" "}
              <span className="font-medium">
                {template.defaultSettings.duration}s
              </span>
            </div>
          )}
          {template.defaultSettings.fps && (
            <div className="text-muted-foreground">
              FPS:{" "}
              <span className="font-medium">
                {template.defaultSettings.fps}
              </span>
            </div>
          )}
          {template.defaultSettings.steps && (
            <div className="text-muted-foreground">
              Steps:{" "}
              <span className="font-medium">
                {template.defaultSettings.steps}
              </span>
            </div>
          )}
          {template.defaultSettings.guidance && (
            <div className="text-muted-foreground">
              Guidance:{" "}
              <span className="font-medium">
                {template.defaultSettings.guidance}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        {template.tags.slice(0, 3).map((tag) => (
          <Badge
            className="bg-muted/50 px-2 py-0 text-xs"
            key={tag}
            variant="secondary"
          >
            {tag}
          </Badge>
        ))}
        {template.tags.length > 3 && (
          <Badge className="bg-muted/50 px-2 py-0 text-xs" variant="secondary">
            +{template.tags.length - 3}
          </Badge>
        )}
      </div>

      {/* Quick Start hint */}
      <div className="flex items-center gap-1.5 font-medium text-purple-600 text-xs opacity-0 transition-opacity group-hover:opacity-100 dark:text-purple-400">
        <Zap className="h-3 w-3" />
        Click to quick start
      </div>
    </button>
  );
}
