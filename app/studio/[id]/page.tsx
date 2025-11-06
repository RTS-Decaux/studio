import { notFound } from "next/navigation";
import { ProjectStudio } from "@/components/studio/project-studio";
import { StudioHeader } from "@/components/studio/studio-header";
import {
  getProjectAction,
  getProjectAssetsAction,
  getProjectGenerationsAction,
} from "@/lib/studio/actions";

export default async function ProjectPage(props: {
  params: Promise<{ id: string }>;
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
      <div className="flex h-full flex-col">
        <StudioHeader showNewButton={false} title={project.title} />

        <main className="flex-1 overflow-hidden">
          <ProjectStudio
            initialAssets={assets}
            initialGenerations={generations}
            project={project}
          />
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
