"use client";

import { FolderOpen } from "lucide-react";
import type { StudioProject } from "@/lib/studio/types";
import { ProjectCard } from "./project-card";

type ProjectGridProps = {
  projects: StudioProject[];
  onProjectDelete?: () => void;
};

export function ProjectGrid({ projects, onProjectDelete }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
          <FolderOpen className="h-12 w-12 text-purple-500" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 font-semibold text-xl">No projects yet</h3>
        <p className="max-w-sm text-muted-foreground text-sm">
          Create your first project to start generating AI images and videos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Your Projects</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {projects.map((project, index) => (
          <div
            className="fade-in slide-in-from-bottom-4 animate-in"
            key={project.id}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards",
            }}
          >
            <ProjectCard onDelete={onProjectDelete} project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
