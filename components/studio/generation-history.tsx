"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StudioGeneration } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

interface GenerationHistoryProps {
  generations: StudioGeneration[];
  onRefresh?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    animate: false,
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    animate: false,
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    animate: false,
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    animate: false,
  },
};

export function GenerationHistory({
  generations,
  onRefresh,
}: GenerationHistoryProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh when there are pending/processing generations
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const hasActiveGenerations = generations.some(
      (g) => g.status === "pending" || g.status === "processing"
    );

    if (!hasActiveGenerations) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, generations, onRefresh]);

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="mb-3 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-1 font-semibold text-lg">No generations yet</h3>
        <p className="max-w-sm text-muted-foreground text-sm">
          Start generating content and your history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          Recent Generations ({generations.length})
        </h3>
        {onRefresh && (
          <Button
            disabled={autoRefresh}
            onClick={onRefresh}
            size="sm"
            variant="ghost"
          >
            {autoRefresh ? "Auto-refresh" : "Refresh"}
          </Button>
        )}
      </div>

      {/* Generation List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {generations.map((generation) => {
            const status = STATUS_CONFIG[generation.status];
            const Icon = status.icon;
            const isVideo = generation.generationType.includes("video");
            const MediaIcon = isVideo ? Video : ImageIcon;

            return (
              <Card
                className="border-border border-thin bg-background shadow-xs"
                key={generation.id}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Thumbnail/Preview */}
                    <div className="shrink-0">
                      {generation.status === "completed" &&
                      generation.outputAssetId ? (
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-border border-thin bg-muted/30">
                          {/* TODO: Load actual asset thumbnail */}
                          <MediaIcon className="h-7 w-7 text-muted-foreground/60" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex h-20 w-20 items-center justify-center rounded-lg border-border border-thin",
                            status.bgColor
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-7 w-7",
                              status.color,
                              status.animate && "animate-spin"
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <Badge
                          className="text-xs"
                          variant={
                            generation.status === "completed"
                              ? "default"
                              : generation.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          <Icon
                            className={cn(
                              "mr-1 h-3 w-3",
                              status.animate && "animate-spin"
                            )}
                          />
                          {status.label}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {format(generation.createdAt, "MMM d, HH:mm")}
                        </span>
                      </div>

                      {/* Prompt */}
                      {generation.prompt && (
                        <p className="line-clamp-2 text-sm">
                          {generation.prompt}
                        </p>
                      )}

                      {/* Model Info */}
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Badge className="text-xs" variant="outline">
                          {generation.modelId.split("/").pop()}
                        </Badge>
                        <span>•</span>
                        <span className="capitalize">
                          {generation.generationType.replace(/-/g, " ")}
                        </span>
                        {generation.processingTime && (
                          <>
                            <span>•</span>
                            <span>{generation.processingTime}s</span>
                          </>
                        )}
                      </div>

                      {/* Error Message */}
                      {generation.status === "failed" && generation.error && (
                        <p className="text-destructive text-xs">
                          {generation.error}
                        </p>
                      )}

                      {/* Actions */}
                      {generation.status === "completed" &&
                        generation.outputAssetId && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
