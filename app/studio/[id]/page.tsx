import { ProjectStudio } from "@/components/studio/project-studio";
import { StudioHeader } from "@/components/studio/studio-header";
import {
  getProjectAction,
  getProjectAssetsAction,
  getProjectGenerationsAction,
} from "@/lib/studio/actions";
import { notFound } from "next/navigation";

export default async function ProjectPage(props: { 
  params: Promise<{ id: string }> 
}) {
  const params = await props.params;
  const { id } = params;

  try {
    const [project, assets, generations] = await Promise.all([
      getProjectAction(id),
      getProjectAssetsAction(id),
      getProjectGenerationsAction(id),
    ]);

    return (
      <div className="flex flex-col h-full">
        <StudioHeader title={project.title} showNewButton={false} />

        <main className="flex-1 overflow-hidden">
          <ProjectStudio
            project={project}
            initialAssets={assets}
            initialGenerations={generations}
          />
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
