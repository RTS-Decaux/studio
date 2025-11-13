"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/lib/studio/actions";

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProjectAction(
        title.trim(),
        description.trim() || undefined
      );
      toast.success("Project created successfully");
      onOpenChange(false);
      router.push(`/studio/${project.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog onOpenChange={handleClose} open={open}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Create new project</AlertDialogTitle>
          <AlertDialogDescription>
            Start a new AI Studio project. You can add generations and assets
            later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project title</Label>
            <Input
              disabled={isCreating}
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="My awesome project"
              value={title}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              disabled={isCreating}
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={3}
              value={description}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <Button disabled={isCreating} onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button disabled={isCreating} onClick={handleCreate}>
            {isCreating ? "Creating..." : "Create project"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
