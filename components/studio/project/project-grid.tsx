"use client";

import type { StudioProject } from "@/lib/studio/types";
import { FolderOpen } from "lucide-react";
import { ProjectCard } from "./project-card";

interface ProjectGridProps {
  projects: StudioProject[];
  onProjectDelete?: () => void;
}

export function ProjectGrid({ projects, onProjectDelete }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 mb-6">
          <FolderOpen className="h-12 w-12 text-purple-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
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
          <h2 className="text-2xl font-bold tracking-tight">Your Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards",
            }}
          >
            <ProjectCard
              project={project}
              onDelete={onProjectDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
