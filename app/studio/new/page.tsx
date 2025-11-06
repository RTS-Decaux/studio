"use client";

import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/lib/studio/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewProjectPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Пожалуйста, введите название проекта");
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProjectAction(title.trim(), description.trim() || undefined);
      toast.success("Проект успешно создан");
      router.push(`/studio/${project.id}`);
    } catch (error) {
      toast.error("Не удалось создать проект");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Новый проект" showNewButton={false} />
      
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            asChild
          >
            <Link href="/studio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Link>
          </Button>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Создать новый проект</h1>
            <p className="text-muted-foreground">
              Начните новый проект RTS Studio. Вы можете добавить генерации и ресурсы позже.
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Название проекта <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Введите описательное имя для вашего проекта"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isCreating}
                  className="h-12 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Выберите запоминающееся имя, которое описывает ваш проект
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Описание <span className="text-xs font-normal text-muted-foreground">(необязательно)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Опишите, что вы планируете создать в этом проекте..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCreating}
                  rows={5}
                  className="resize-none text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Добавьте заметки о целях или идеях проекта
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isCreating}
                  className="sm:flex-1"
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={isCreating || !title.trim()}
                  className="sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
