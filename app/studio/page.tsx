import { PlusIcon } from "@/components/icons";
import { ProjectGrid } from "@/components/studio/project/project-grid";
import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";
import { getProjectsAction } from "@/lib/studio/actions";
import Link from "next/link";

export default async function StudioPage() {
  const projects = await getProjectsAction();

  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Projects" showNewButton={true} />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="rounded-full bg-muted p-6 mb-6">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Studio</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Create stunning AI-generated images and videos with the latest models from FLUX, Sora, Runway, and more.
            </p>
            <Button asChild size="lg">
              <Link href="/studio/new">
                <PlusIcon />
                Create your first project
              </Link>
            </Button>
          </div>
        ) : (
          <ProjectGrid projects={projects} />
        )}
      </main>
    </div>
  );
}
