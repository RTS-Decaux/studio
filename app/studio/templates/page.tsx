"use client";

import { StudioHeader } from "@/components/studio/studio-header";
import { TemplateDetailDialog } from "@/components/studio/template-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PROJECT_TEMPLATE_CATEGORIES,
    PROJECT_TEMPLATES,
    PROMPT_TEMPLATES,
    TEMPLATE_CATEGORIES,
    type ProjectTemplate,
    type PromptTemplate
} from "@/lib/studio/templates";
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
    Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ViewMode = "prompts" | "projects";

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("prompts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detailTemplate, setDetailTemplate] = useState<PromptTemplate | ProjectTemplate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter templates based on search and category
  const filteredPromptTemplates = PROMPT_TEMPLATES.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredProjectTemplates = PROJECT_TEMPLATES.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get category counts
  const getCategoryCount = (categoryId: string) => {
    if (viewMode === "prompts") {
      return PROMPT_TEMPLATES.filter(t => t.category === categoryId).length;
    } else {
      return PROJECT_TEMPLATES.filter(t => t.category === categoryId).length;
    }
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

  const categories = viewMode === "prompts" ? TEMPLATE_CATEGORIES : PROJECT_TEMPLATE_CATEGORIES;
  const currentTemplates = viewMode === "prompts" ? filteredPromptTemplates : filteredProjectTemplates;

  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Template Gallery" showNewButton={false} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Template Gallery
                </h1>
                <p className="text-muted-foreground mt-1">
                  Browse and use pre-made templates for quick generation
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "prompts" ? "default" : "outline"}
                  onClick={() => {
                    setViewMode("prompts");
                    setSelectedCategory("all");
                  }}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Prompts ({PROMPT_TEMPLATES.length})
                </Button>
                <Button
                  variant={viewMode === "projects" ? "default" : "outline"}
                  onClick={() => {
                    setViewMode("projects");
                    setSelectedCategory("all");
                  }}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Projects ({PROJECT_TEMPLATES.length})
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-muted/50 p-2">
              <TabsTrigger value="all" className="gap-2">
                <Layers className="h-4 w-4" />
                All
                <Badge variant="secondary" className="ml-1">
                  {viewMode === "prompts" ? PROMPT_TEMPLATES.length : PROJECT_TEMPLATES.length}
                </Badge>
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <span>{cat.icon}</span>
                  {cat.name}
                  <Badge variant="secondary" className="ml-1">
                    {getCategoryCount(cat.id)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-6">
              {currentTemplates.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {viewMode === "prompts" ? (
                    // Prompt Templates
                    filteredPromptTemplates.map((template) => (
                      <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:border-purple-500/50">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Generation Types */}
                          <div className="flex flex-wrap gap-2">
                            {template.generationType.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs gap-1">
                                {type.includes("video") ? (
                                  <Video className="h-3 w-3" />
                                ) : (
                                  <ImageIcon className="h-3 w-3" />
                                )}
                                {type === "text-to-image" ? "Image" : 
                                 type === "text-to-video" ? "Video" :
                                 type === "image-to-image" ? "I2I" :
                                 type === "image-to-video" ? "I2V" : type}
                              </Badge>
                            ))}
                          </div>

                          {/* Prompt Preview */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Prompt Preview:</div>
                            <ScrollArea className="h-20 rounded-md border bg-muted/50 p-3">
                              <p className="text-xs leading-relaxed">{template.prompt}</p>
                            </ScrollArea>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 4}
                              </Badge>
                            )}
                          </div>

                          {/* Examples */}
                          {template.examples && template.examples.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Try with:</span> {template.examples.join(", ")}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="flex gap-2">
                          <Button
                            onClick={() => {
                              setDetailTemplate(template);
                              setDetailDialogOpen(true);
                            }}
                            variant="outline"
                            className="flex-1 gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          <Button
                            onClick={() => handleCopyPrompt(template)}
                            className="flex-1 gap-2"
                            variant={copiedId === template.id ? "outline" : "default"}
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
                  ) : (
                    // Project Templates
                    filteredProjectTemplates.map((template) => (
                      <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:border-blue-500/50">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{template.icon}</span>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                              </div>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {PROJECT_TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Generation Type */}
                          <Badge variant="secondary" className="gap-1">
                            {template.generationType === "text-to-video" || template.generationType === "image-to-video" ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <ImageIcon className="h-3 w-3" />
                            )}
                            {template.generationType === "text-to-image" ? "Image Generation" : 
                             template.generationType === "text-to-video" ? "Video Generation" :
                             template.generationType === "image-to-image" ? "Image to Image" :
                             template.generationType === "image-to-video" ? "Image to Video" : template.generationType}
                          </Badge>

                          {/* Settings Preview */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Pre-configured Settings:</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {template.defaultSettings.imageSize && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                  <Layers className="h-3 w-3 text-muted-foreground" />
                                  <span>{template.defaultSettings.imageSize}</span>
                                </div>
                              )}
                              {template.defaultSettings.duration && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{template.defaultSettings.duration}s</span>
                                </div>
                              )}
                              {template.defaultSettings.fps && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                  <Gauge className="h-3 w-3 text-muted-foreground" />
                                  <span>{template.defaultSettings.fps} FPS</span>
                                </div>
                              )}
                              {template.defaultSettings.steps && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                  <Zap className="h-3 w-3 text-muted-foreground" />
                                  <span>{template.defaultSettings.steps} steps</span>
                                </div>
                              )}
                              {template.defaultSettings.guidance && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                  <Target className="h-3 w-3 text-muted-foreground" />
                                  <span>G: {template.defaultSettings.guidance}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Prompt Preview */}
                          {template.promptTemplate && (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">Prompt Template:</div>
                              <ScrollArea className="h-16 rounded-md border bg-muted/50 p-2">
                                <p className="text-xs leading-relaxed">{template.promptTemplate}</p>
                              </ScrollArea>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="flex gap-2">
                          <Button
                            onClick={() => {
                              setDetailTemplate(template);
                              setDetailDialogOpen(true);
                            }}
                            variant="outline"
                            className="flex-1 gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          <Button
                            onClick={() => handleCopyProject(template)}
                            className="flex-1 gap-2"
                            variant={copiedId === template.id ? "outline" : "default"}
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
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer Stats */}
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Showing {currentTemplates.length} of {viewMode === "prompts" ? PROMPT_TEMPLATES.length : PROJECT_TEMPLATES.length} templates
            </p>
          </div>
        </div>

        {/* Template Detail Dialog */}
        <TemplateDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          template={detailTemplate}
          type={viewMode === "prompts" ? "prompt" : "project"}
        />
      </main>
    </div>
  );
}
