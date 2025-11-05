"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    getTemplatesByGenerationType,
    PROMPT_TEMPLATES,
    TEMPLATE_CATEGORIES,
    type PromptTemplate
} from "@/lib/studio/templates";
import type { StudioGenerationType } from "@/lib/studio/types";
import { Search, Sparkles, Tag } from "lucide-react";
import { useMemo, useState } from "react";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PromptTemplate) => void;
  generationType: StudioGenerationType;
}

export function TemplatePickerDialog({
  open,
  onOpenChange,
  onSelectTemplate,
  generationType,
}: TemplatePickerDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates = useMemo(() => {
    let templates = PROMPT_TEMPLATES;

    // Filter by generation type
    templates = getTemplatesByGenerationType(generationType);

    // Filter by category
    if (selectedCategory !== "all") {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerSearch) ||
          t.description.toLowerCase().includes(lowerSearch) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return templates;
  }, [generationType, selectedCategory, search]);

  const categoriesWithCount = useMemo(() => {
    const compatibleTemplates = getTemplatesByGenerationType(generationType);
    return TEMPLATE_CATEGORIES.map((cat) => ({
      ...cat,
      count: compatibleTemplates.filter((t) => t.category === cat.id).length,
    }));
  }, [generationType]);

  const handleSelect = (template: PromptTemplate) => {
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
                Prompt Templates
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Choose from professionally crafted prompts
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredTemplates.length} templates
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates by name, style, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="all" className="text-xs">
                All ({getTemplatesByGenerationType(generationType).length})
              </TabsTrigger>
              {categoriesWithCount
                .filter((cat) => cat.count > 0)
                .map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                    {cat.icon} {cat.name} ({cat.count})
                  </TabsTrigger>
                ))}
            </TabsList>
          </ScrollArea>
        </Tabs>

        {/* Templates Grid */}
        <ScrollArea className="h-[450px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No templates found matching your search
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: PromptTemplate;
  onSelect: (template: PromptTemplate) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:bg-card/80 transition-all text-left"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {template.name}
          </h4>
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 shrink-0"
          >
            {template.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Prompt Preview */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-foreground/70">Prompt:</div>
        <div className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted/30 rounded-lg p-2">
          {template.prompt}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {template.tags.slice(0, 4).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs px-2 py-0 bg-muted/50"
          >
            {tag}
          </Badge>
        ))}
        {template.tags.length > 4 && (
          <Badge variant="secondary" className="text-xs px-2 py-0 bg-muted/50">
            +{template.tags.length - 4}
          </Badge>
        )}
      </div>

      {/* Examples hint */}
      {template.examples && template.examples.length > 0 && (
        <div className="text-xs text-muted-foreground/70 flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Try: {template.examples.join(", ")}
        </div>
      )}
    </button>
  );
}
