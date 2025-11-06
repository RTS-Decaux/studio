"use client";

import { FolderOpen, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  StudioAsset,
  StudioGeneration,
  StudioProject,
} from "@/lib/studio/types";
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
    <div className="flex h-full flex-col bg-background">
      {/* Project Description */}
      {project.description && (
        <div className="border-b bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 px-6 py-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      {/* Main Content - Grid Layout */}
      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-12">
        {/* Left Panel - Generation Form */}
        <div className="overflow-hidden border-r bg-card/50 lg:col-span-5 xl:col-span-4">
          <GenerationPanel
            onGenerationComplete={handleGenerationComplete}
            onGenerationStart={handleGenerationStart}
            projectId={project.id}
          />
        </div>

        {/* Right Panel - Results & History */}
        <div className="flex flex-col bg-background lg:col-span-7 xl:col-span-8">
          <Tabs
            className="flex h-full flex-col"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="border-b bg-card/30 px-6 py-2 backdrop-blur-sm">
              <TabsList className="h-11 bg-background/50">
                <TabsTrigger
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-pink-500/10 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
                  value="generate"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Generation History</span>
                </TabsTrigger>
                <TabsTrigger
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                  value="assets"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="font-medium">Assets Library</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent className="mt-0 h-full p-6" value="generate">
                <GenerationHistory
                  generations={generations}
                  onRefresh={refreshGenerations}
                />
              </TabsContent>

              <TabsContent className="mt-0 h-full p-6" value="assets">
                <AssetGallery assets={assets} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
