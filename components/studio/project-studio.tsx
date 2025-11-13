"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  StudioAsset,
  StudioGeneration,
  StudioProject,
} from "@/lib/studio/types";
import {
  getProjectAssetsAction,
  getProjectGenerationsAction,
} from "@/lib/studio/actions";
import { FolderOpen, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { AssetGallery } from "./asset-gallery";
import { GenerationHistory } from "./generation-history";
import { GenerationPanelV2 as GenerationPanel } from "./generation-panel-v2";

type ProjectStudioProps = {
  project: StudioProject;
  initialAssets: StudioAsset[];
  initialGenerations: StudioGeneration[];
};

export function ProjectStudio({
  project,
  initialAssets,
  initialGenerations,
}: ProjectStudioProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [generations, setGenerations] = useState(initialGenerations);
  const [activeTab, setActiveTab] = useState("generate");

  const handleGenerationStart = useCallback((generationId: string) => {
    console.log("Generation started:", generationId);
  }, []);

  const refreshGenerations = useCallback(async () => {
    try {
      const [newAssets, newGenerations] = await Promise.all([
        getProjectAssetsAction(project.id),
        getProjectGenerationsAction(project.id),
      ]);
      setAssets(newAssets);
      setGenerations(newGenerations);
    } catch (error) {
      console.error("Failed to refresh generations:", error);
    }
  }, [project.id]);

  const handleGenerationComplete = useCallback(() => {
    refreshGenerations();
  }, [refreshGenerations]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Project Description */}
      {project.description && (
        <div className="border-b bg-muted/30 px-4 py-2">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      {/* Main Content - Grid Layout */}
      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-12">
        {/* Left Panel - Generation Form */}
        <div className="overflow-hidden border-r bg-card/30 lg:col-span-5 xl:col-span-4">
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
            <div className="border-b bg-muted/20 px-4 py-1.5">
              <TabsList className="h-9 bg-background/50">
                <TabsTrigger
                  className="gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
                  value="generate"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-medium">Generation History</span>
                </TabsTrigger>
                <TabsTrigger
                  className="gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
                  value="assets"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="font-medium">Assets Library</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent className="mt-0 h-full p-4" value="generate">
                <GenerationHistory
                  generations={generations}
                  onRefresh={refreshGenerations}
                />
              </TabsContent>

              <TabsContent className="mt-0 h-full p-4" value="assets">
                <AssetGallery assets={assets} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
