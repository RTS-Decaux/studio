"use client";

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
    PROJECT_TEMPLATES,
    PROJECT_TEMPLATE_CATEGORIES,
    type ProjectTemplate,
} from "@/lib/studio/templates";
import { cn } from "@/lib/utils";
import {
    Image as ImageIcon,
    Settings2,
    Sparkles,
    Video,
    Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] bg-card border border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Project Templates
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Start with pre-configured settings for common use cases
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredTemplates.length} templates
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              All
            </TabsTrigger>
            {categoriesWithCount.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.icon} {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <ProjectTemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelect}
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
      onClick={() => onSelect(template)}
      className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:bg-card/80 hover:shadow-lg hover:shadow-purple-500/10 transition-all text-left"
    >
      {/* Icon & Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-3xl">{template.icon}</div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>

      {/* Generation Type Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-2 py-0.5",
            isVideo
              ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
              : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
          )}
        >
          {isVideo ? (
            <>
              <Video className="h-3 w-3 mr-1" />
              Video
            </>
          ) : (
            <>
              <ImageIcon className="h-3 w-3 mr-1" />
              Image
            </>
          )}
        </Badge>
        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
          {template.category}
        </Badge>
      </div>

      {/* Settings Preview */}
      <div className="space-y-2 rounded-lg bg-muted/30 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/70">
          <Settings2 className="h-3 w-3" />
          Pre-configured Settings
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {template.defaultSettings.imageSize && (
            <div className="text-muted-foreground">
              Size: <span className="font-medium">{template.defaultSettings.imageSize}</span>
            </div>
          )}
          {template.defaultSettings.duration && (
            <div className="text-muted-foreground">
              Duration: <span className="font-medium">{template.defaultSettings.duration}s</span>
            </div>
          )}
          {template.defaultSettings.fps && (
            <div className="text-muted-foreground">
              FPS: <span className="font-medium">{template.defaultSettings.fps}</span>
            </div>
          )}
          {template.defaultSettings.steps && (
            <div className="text-muted-foreground">
              Steps: <span className="font-medium">{template.defaultSettings.steps}</span>
            </div>
          )}
          {template.defaultSettings.guidance && (
            <div className="text-muted-foreground">
              Guidance: <span className="font-medium">{template.defaultSettings.guidance}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {template.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs px-2 py-0 bg-muted/50"
          >
            {tag}
          </Badge>
        ))}
        {template.tags.length > 3 && (
          <Badge variant="secondary" className="text-xs px-2 py-0 bg-muted/50">
            +{template.tags.length - 3}
          </Badge>
        )}
      </div>

      {/* Quick Start hint */}
      <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <Zap className="h-3 w-3" />
        Click to quick start
      </div>
    </button>
  );
}
