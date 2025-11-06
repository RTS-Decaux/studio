"use client";

import { Search, Sparkles, Tag } from "lucide-react";
import { useMemo, useState } from "react";
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
  type PromptTemplate,
  TEMPLATE_CATEGORIES,
} from "@/lib/studio/templates";
import type { StudioGenerationType } from "@/lib/studio/types";

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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] max-w-5xl border border-border bg-card shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-bold text-transparent text-xl">
                Шаблоны промптов
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground text-sm">
                Выберите из профессионально созданных промптов
              </DialogDescription>
            </div>
            <Badge className="text-xs" variant="secondary">
              {filteredTemplates.length} шаблонов
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Search */}
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск шаблонов по названию, стилю или тегам..."
            type="search"
            value={search}
          />
        </div>

        {/* Categories */}
        <Tabs onValueChange={setSelectedCategory} value={selectedCategory}>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger className="text-xs" value="all">
                Все ({getTemplatesByGenerationType(generationType).length})
              </TabsTrigger>
              {categoriesWithCount
                .filter((cat) => cat.count > 0)
                .map((cat) => (
                  <TabsTrigger className="text-xs" key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name} ({cat.count})
                  </TabsTrigger>
                ))}
            </TabsList>
          </ScrollArea>
        </Tabs>

        {/* Templates Grid */}
        <ScrollArea className="h-[450px] pr-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                onSelect={handleSelect}
                template={template}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                Шаблоны, соответствующие вашему запросу, не найдены
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
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-purple-500/50 hover:bg-card/80"
      onClick={() => onSelect(template)}
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
            {template.name}
          </h4>
          <Badge
            className="shrink-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-2 py-0.5 text-xs"
            variant="outline"
          >
            {template.category}
          </Badge>
        </div>
        <p className="line-clamp-2 text-muted-foreground text-xs">
          {template.description}
        </p>
      </div>

      {/* Prompt Preview */}
      <div className="space-y-2">
        <div className="font-medium text-foreground/70 text-xs">Промпт:</div>
        <div className="line-clamp-3 rounded-lg bg-muted/30 p-2 font-mono text-muted-foreground text-xs">
          {template.prompt}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        {template.tags.slice(0, 4).map((tag) => (
          <Badge
            className="bg-muted/50 px-2 py-0 text-xs"
            key={tag}
            variant="secondary"
          >
            {tag}
          </Badge>
        ))}
        {template.tags.length > 4 && (
          <Badge className="bg-muted/50 px-2 py-0 text-xs" variant="secondary">
            +{template.tags.length - 4}
          </Badge>
        )}
      </div>

      {/* Examples hint */}
      {template.examples && template.examples.length > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground/70 text-xs">
          <Tag className="h-3 w-3" />
          Попробуйте: {template.examples.join(", ")}
        </div>
      )}
    </button>
  );
}
