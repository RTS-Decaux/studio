"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createProjectAction } from "@/lib/studio/actions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
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
      const project = await createProjectAction(title.trim(), description.trim() || undefined);
      toast.success("Project created successfully");
      router.push(`/studio/${project.id}`);
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="New Project" showNewButton={false} />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            asChild
          >
            <Link href="/studio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to projects
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create new project</CardTitle>
              <CardDescription>
                Start a new AI Studio project. You can add generations and assets later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project title</Label>
                <Input
                  id="title"
                  placeholder="My awesome project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isCreating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCreating}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create project"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
