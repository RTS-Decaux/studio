import { getProjectAction } from "@/lib/studio/actions";
import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";

import { notFound } from "next/navigation";
import { Sparkles, FolderOpen, History } from "lucide-react";


interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;
  
  try {
    const project = await getProjectAction(id);

    return (
      <div className="flex flex-col h-full">
        <StudioHeader title={project.title} showNewButton={false} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {/* Project Description */}
            {project.description && (
              <p className="text-sm text-muted-foreground mb-6">
                {project.description}
              </p>
            )}

            {/* Tabs */}
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="generate" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Generate</span>
                </TabsTrigger>
                <TabsTrigger value="assets" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Assets</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="mt-6">
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Generation Panel</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Coming in Phase 2: AI generation interface with model selection and prompt editor
                  </p>
                  <Button disabled variant="outline">
                    Generate (Coming Soon)
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="mt-6">
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Asset Library</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Coming in Phase 3: Browse and manage your project assets
                  </p>
                  <Button disabled variant="outline">
                    Upload Asset (Coming Soon)
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Generation History</h3>
                  <p className="text-sm text-muted-foreground">
                    Coming in Phase 5: View all your generations and their status
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
