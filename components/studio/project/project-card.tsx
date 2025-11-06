"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Edit,
  FolderOpen,
  MoreHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteProjectAction } from "@/lib/studio/actions";
import type { StudioProject } from "@/lib/studio/types";

interface ProjectCardProps {
  project: StudioProject;
  onDelete?: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProjectAction(project.id);
      toast.success("Project deleted successfully");
      onDelete?.();
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group hover:-translate-y-1 relative overflow-hidden transition-all duration-300 hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10">
      <Link className="block" href={`/studio/${project.id}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5">
          {project.thumbnail ? (
            <>
              <img
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={project.thumbnail}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                <FolderOpen className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-xs">No thumbnail</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              className="bg-background/90 shadow-lg backdrop-blur-sm"
              size="sm"
              variant="secondary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Open Project
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title */}
            <h3 className="truncate font-semibold text-base transition-colors group-hover:text-purple-600">
              {project.title}
            </h3>

            {/* Description */}
            {project.description && (
              <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-2 pt-1">
              <Badge className="gap-1 font-normal text-xs" variant="secondary">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(project.updatedAt), {
                  addSuffix: true,
                })}
              </Badge>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={isDeleting}
                size="sm"
                variant="ghost"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/studio/${project.id}`}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/studio/${project.id}/settings`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
