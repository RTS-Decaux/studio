"use client";

import {
  CheckCheck,
  Clock,
  Copy,
  Eye,
  Gauge,
  Image as ImageIcon,
  Layers,
  Search,
  Sparkles,
  Target,
  Video,
  Wand2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StudioHeader } from "@/components/studio/studio-header";
import { TemplateDetailDialog } from "@/components/studio/template-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PROJECT_TEMPLATE_CATEGORIES,
  PROJECT_TEMPLATES,
  PROMPT_TEMPLATES,
  type ProjectTemplate,
  type PromptTemplate,
  TEMPLATE_CATEGORIES,
} from "@/lib/studio/templates";

type ViewMode = "prompts" | "projects";

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("prompts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detailTemplate, setDetailTemplate] = useState<
    PromptTemplate | ProjectTemplate | null
  >(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter templates based on search and category
  const filteredPromptTemplates = PROMPT_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredProjectTemplates = PROJECT_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get category counts
  const getCategoryCount = (categoryId: string) => {
    if (viewMode === "prompts") {
      return PROMPT_TEMPLATES.filter((t) => t.category === categoryId).length;
    }
    return PROJECT_TEMPLATES.filter((t) => t.category === categoryId).length;
  };

  const handleCopyPrompt = (template: PromptTemplate) => {
    const text = `${template.prompt}\n\nNegative: ${template.negativePrompt}`;
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyProject = (template: ProjectTemplate) => {
    const settings = template.defaultSettings;
    const text = `Template: ${template.name}
Prompt: ${template.promptTemplate || ""}
Negative: ${template.negativePromptTemplate || ""}
Settings: ${JSON.stringify(settings, null, 2)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    toast.success("Template copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories =
    viewMode === "prompts" ? TEMPLATE_CATEGORIES : PROJECT_TEMPLATE_CATEGORIES;
  const currentTemplates =
    viewMode === "prompts" ? filteredPromptTemplates : filteredProjectTemplates;

  return (
    <div className="flex h-full flex-col">
      <StudioHeader showNewButton={false} title="Template Gallery" />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-4 md:p-6">
          {/* Header Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold text-3xl text-transparent">
                  Template Gallery
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Browse and use pre-made templates for quick generation
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  className="gap-2"
                  onClick={() => {
                    setViewMode("prompts");
                    setSelectedCategory("all");
                  }}
                  variant={viewMode === "prompts" ? "default" : "outline"}
                >
                  <Sparkles className="h-4 w-4" />
                  Prompts ({PROMPT_TEMPLATES.length})
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setViewMode("projects");
                    setSelectedCategory("all");
                  }}
                  variant={viewMode === "projects" ? "default" : "outline"}
                >
                  <Wand2 className="h-4 w-4" />
                  Projects ({PROJECT_TEMPLATES.length})
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs
            className="space-y-6"
            onValueChange={setSelectedCategory}
            value={selectedCategory}
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 overflow-x-auto bg-muted/50 p-2">
              <TabsTrigger className="gap-2" value="all">
                <Layers className="h-4 w-4" />
                All
                <Badge className="ml-1" variant="secondary">
                  {viewMode === "prompts"
                    ? PROMPT_TEMPLATES.length
                    : PROJECT_TEMPLATES.length}
                </Badge>
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger className="gap-2" key={cat.id} value={cat.id}>
                  <span>{cat.icon}</span>
                  {cat.name}
                  <Badge className="ml-1" variant="secondary">
                    {getCategoryCount(cat.id)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent className="space-y-6" value={selectedCategory}>
              {currentTemplates.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">
                      No templates found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {viewMode === "prompts"
                    ? // Prompt Templates
                      filteredPromptTemplates.map((template) => (
                        <Card
                          className="group transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg"
                          key={template.id}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="mb-2 text-lg">
                                  {template.name}
                                </CardTitle>
                                <CardDescription>
                                  {template.description}
                                </CardDescription>
                              </div>
                              <Badge className="shrink-0" variant="outline">
                                {
                                  TEMPLATE_CATEGORIES.find(
                                    (c) => c.id === template.category
                                  )?.icon
                                }
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Generation Types */}
                            <div className="flex flex-wrap gap-2">
                              {template.generationType.map((type) => (
                                <Badge
                                  className="gap-1 text-xs"
                                  key={type}
                                  variant="secondary"
                                >
                                  {type.includes("video") ? (
                                    <Video className="h-3 w-3" />
                                  ) : (
                                    <ImageIcon className="h-3 w-3" />
                                  )}
                                  {type === "text-to-image"
                                    ? "Image"
                                    : type === "text-to-video"
                                      ? "Video"
                                      : type === "image-to-image"
                                        ? "I2I"
                                        : type === "image-to-video"
                                          ? "I2V"
                                          : type}
                                </Badge>
                              ))}
                            </div>

                            {/* Prompt Preview */}
                            <div className="space-y-2">
                              <div className="font-medium text-muted-foreground text-xs">
                                Prompt Preview:
                              </div>
                              <ScrollArea className="h-20 rounded-md border bg-muted/50 p-3">
                                <p className="text-xs leading-relaxed">
                                  {template.prompt}
                                </p>
                              </ScrollArea>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 4).map((tag) => (
                                <Badge
                                  className="text-xs"
                                  key={tag}
                                  variant="outline"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 4 && (
                                <Badge className="text-xs" variant="outline">
                                  +{template.tags.length - 4}
                                </Badge>
                              )}
                            </div>

                            {/* Examples */}
                            {template.examples &&
                              template.examples.length > 0 && (
                                <div className="text-muted-foreground text-xs">
                                  <span className="font-medium">Try with:</span>{" "}
                                  {template.examples.join(", ")}
                                </div>
                              )}
                          </CardContent>

                          <CardFooter className="flex gap-2">
                            <Button
                              className="flex-1 gap-2"
                              onClick={() => {
                                setDetailTemplate(template);
                                setDetailDialogOpen(true);
                              }}
                              variant="outline"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                            <Button
                              className="flex-1 gap-2"
                              onClick={() => handleCopyPrompt(template)}
                              variant={
                                copiedId === template.id ? "outline" : "default"
                              }
                            >
                              {copiedId === template.id ? (
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
                          </CardFooter>
                        </Card>
                      ))
                    : // Project Templates
                      filteredProjectTemplates.map((template) => (
                        <Card
                          className="group transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg"
                          key={template.id}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="text-2xl">
                                    {template.icon}
                                  </span>
                                  <CardTitle className="text-lg">
                                    {template.name}
                                  </CardTitle>
                                </div>
                                <CardDescription>
                                  {template.description}
                                </CardDescription>
                              </div>
                              <Badge className="shrink-0" variant="outline">
                                {
                                  PROJECT_TEMPLATE_CATEGORIES.find(
                                    (c) => c.id === template.category
                                  )?.icon
                                }
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Generation Type */}
                            <Badge className="gap-1" variant="secondary">
                              {template.generationType === "text-to-video" ||
                              template.generationType === "image-to-video" ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <ImageIcon className="h-3 w-3" />
                              )}
                              {template.generationType === "text-to-image"
                                ? "Image Generation"
                                : template.generationType === "text-to-video"
                                  ? "Video Generation"
                                  : template.generationType === "image-to-image"
                                    ? "Image to Image"
                                    : template.generationType ===
                                        "image-to-video"
                                      ? "Image to Video"
                                      : template.generationType}
                            </Badge>

                            {/* Settings Preview */}
                            <div className="space-y-2">
                              <div className="font-medium text-muted-foreground text-xs">
                                Pre-configured Settings:
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {template.defaultSettings.imageSize && (
                                  <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                    <Layers className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {template.defaultSettings.imageSize}
                                    </span>
                                  </div>
                                )}
                                {template.defaultSettings.duration && (
                                  <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {template.defaultSettings.duration}s
                                    </span>
                                  </div>
                                )}
                                {template.defaultSettings.fps && (
                                  <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                    <Gauge className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {template.defaultSettings.fps} FPS
                                    </span>
                                  </div>
                                )}
                                {template.defaultSettings.steps && (
                                  <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                    <Zap className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {template.defaultSettings.steps} steps
                                    </span>
                                  </div>
                                )}
                                {template.defaultSettings.guidance && (
                                  <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                    <Target className="h-3 w-3 text-muted-foreground" />
                                    <span>
                                      G: {template.defaultSettings.guidance}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Prompt Preview */}
                            {template.promptTemplate && (
                              <div className="space-y-2">
                                <div className="font-medium text-muted-foreground text-xs">
                                  Prompt Template:
                                </div>
                                <ScrollArea className="h-16 rounded-md border bg-muted/50 p-2">
                                  <p className="text-xs leading-relaxed">
                                    {template.promptTemplate}
                                  </p>
                                </ScrollArea>
                              </div>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag) => (
                                <Badge
                                  className="text-xs"
                                  key={tag}
                                  variant="outline"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>

                          <CardFooter className="flex gap-2">
                            <Button
                              className="flex-1 gap-2"
                              onClick={() => {
                                setDetailTemplate(template);
                                setDetailDialogOpen(true);
                              }}
                              variant="outline"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                            <Button
                              className="flex-1 gap-2"
                              onClick={() => handleCopyProject(template)}
                              variant={
                                copiedId === template.id ? "outline" : "default"
                              }
                            >
                              {copiedId === template.id ? (
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
                          </CardFooter>
                        </Card>
                      ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer Stats */}
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground text-sm">
            <p>
              Showing {currentTemplates.length} of{" "}
              {viewMode === "prompts"
                ? PROMPT_TEMPLATES.length
                : PROJECT_TEMPLATES.length}{" "}
              templates
            </p>
          </div>
        </div>

        {/* Template Detail Dialog */}
        <TemplateDetailDialog
          onOpenChange={setDetailDialogOpen}
          open={detailDialogOpen}
          template={detailTemplate}
          type={viewMode === "prompts" ? "prompt" : "project"}
        />
      </main>
    </div>
  );
}
