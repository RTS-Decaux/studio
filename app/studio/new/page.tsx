"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/lib/studio/actions";
import { showStudioError, showStudioSuccess } from "@/lib/studio/error-handler";

export default function NewProjectPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title required", {
        description: "Please enter a project name to continue",
      });
      return;
    }

    if (title.trim().length > 200) {
      toast.error("Title too long", {
        description: "Project title must be 200 characters or less",
      });
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProjectAction(
        title.trim(),
        description.trim() || undefined
      );
      showStudioSuccess("Project created!", `${project.title} is ready to use`);
      router.push(`/studio/${project.id}`);
    } catch (error: any) {
      showStudioError(error, "project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <StudioHeader showNewButton={false} title="Новый проект" />

      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Back button */}
          <Button asChild className="mb-2" size="sm" variant="ghost">
            <Link href="/studio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Link>
          </Button>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-bold text-3xl tracking-tight">
              Создать новый проект
            </h1>
            <p className="text-muted-foreground">
              Начните новый проект RTS Studio. Вы можете добавить генерации и
              ресурсы позже.
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-2 shadow-lg">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div className="space-y-2">
                <Label className="font-semibold text-base" htmlFor="title">
                  Название проекта <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-12 text-base"
                  disabled={isCreating}
                  id="title"
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="Введите описательное имя для вашего проекта"
                  value={title}
                />
                <p className="text-muted-foreground text-xs">
                  Выберите запоминающееся имя, которое описывает ваш проект
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  className="font-semibold text-base"
                  htmlFor="description"
                >
                  Описание{" "}
                  <span className="font-normal text-muted-foreground text-xs">
                    (необязательно)
                  </span>
                </Label>
                <Textarea
                  className="resize-none text-base"
                  disabled={isCreating}
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите, что вы планируете создать в этом проекте..."
                  rows={5}
                  value={description}
                />
                <p className="text-muted-foreground text-xs">
                  Добавьте заметки о целях или идеях проекта
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
                <Button
                  className="sm:flex-1"
                  disabled={isCreating}
                  onClick={() => router.back()}
                  variant="outline"
                >
                  Отмена
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 sm:flex-1"
                  disabled={isCreating || !title.trim()}
                  onClick={handleCreate}
                >
                  {isCreating ? (
                    <>
                      <span className="mr-2">Создание...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    </>
                  ) : (
                    "Создать проект"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
