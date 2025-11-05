"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
    StudioAsset,
    StudioGeneration,
    StudioProject,
} from "@/lib/studio/types";
import { FolderOpen, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { AssetGallery } from "./asset-gallery";
import { GenerationHistory } from "./generation-history";
import { GenerationPanelV2 as GenerationPanel } from "./generation-panel-v2";

interface ProjectStudioProps {
  project: StudioProject;
  initialAssets: StudioAsset[];
  initialGenerations: StudioGeneration[];
}

export function ProjectStudio({
  project,
  initialAssets,
  initialGenerations,
}: ProjectStudioProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [generations, setGenerations] = useState(initialGenerations);
  const [activeTab, setActiveTab] = useState("generate");

  const handleGenerationStart = useCallback((generationId: string) => {
    // Optionally refresh generations
    console.log("Generation started:", generationId);
  }, []);

  const handleGenerationComplete = useCallback(() => {
    // Refresh assets and generations
    console.log("Generation completed");
  }, []);

  const refreshGenerations = useCallback(() => {
    // TODO: Implement refresh
    console.log("Refreshing generations");
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Project Description */}
      {project.description && (
        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      {/* Main Content - Grid Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Panel - Generation Form */}
        <div className="lg:col-span-5 xl:col-span-4 border-r bg-card/50 overflow-hidden">
          <GenerationPanel
            projectId={project.id}
            onGenerationStart={handleGenerationStart}
            onGenerationComplete={handleGenerationComplete}
          />
        </div>

        {/* Right Panel - Results & History */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-background">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="border-b bg-card/30 backdrop-blur-sm px-6 py-2">
              <TabsList className="h-11 bg-background/50">
                <TabsTrigger value="generate" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-pink-500/10 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Generation History</span>
                </TabsTrigger>
                <TabsTrigger value="assets" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
                  <FolderOpen className="h-4 w-4" />
                  <span className="font-medium">Assets Library</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="generate" className="mt-0 p-6 h-full">
                <GenerationHistory
                  generations={generations}
                  onRefresh={refreshGenerations}
                />
              </TabsContent>

              <TabsContent value="assets" className="mt-0 p-6 h-full">
                <AssetGallery assets={assets} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
