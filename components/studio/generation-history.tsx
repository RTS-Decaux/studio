"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    cancelGenerationAction,
    retryGenerationAction,
} from "@/lib/studio/actions";
import type { StudioGeneration } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    Sparkles,
    Video,
    XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAssetSignedUrl, useSignedUrl } from "@/hooks/use-signed-url";
import type { StudioAsset } from "@/lib/studio/types";
import { toast } from "sonner";

interface GenerationHistoryProps {
  generations: StudioGeneration[];
  onRefresh?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    animate: false,
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    color: "text-foreground",
    bgColor: "bg-muted",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-foreground",
    bgColor: "bg-muted/30",
    animate: false,
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    animate: false,
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    animate: false,
  },
};

export function GenerationHistory({
  generations,
  onRefresh,
}: GenerationHistoryProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());
  const [assetMap, setAssetMap] = useState<Record<string, StudioAsset | null>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Handle cancel generation
  const handleCancel = async (generationId: string) => {
    try {
      setActioningIds((prev) => new Set(prev).add(generationId));
      await cancelGenerationAction(generationId);
      toast.success("Generation cancelled");
      onRefresh?.();
    } catch (error: any) {
      toast.error("Failed to cancel", {
        description: error.message,
      });
    } finally {
      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(generationId);
        return next;
      });
    }
  };

  // Handle retry generation
  const handleRetry = async (generationId: string) => {
    try {
      setActioningIds((prev) => new Set(prev).add(generationId));
      const result = await retryGenerationAction(generationId);
      toast.success("Retrying generation");
      onRefresh?.();
    } catch (error: any) {
      toast.error("Failed to retry", {
        description: error.message,
      });
    } finally {
      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(generationId);
        return next;
      });
    }
  };

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

  useEffect(() => {
    const idsToFetch = new Set(
      generations
        .map((generation) => generation.outputAssetId)
        .filter(Boolean) as string[]
    );

    idsToFetch.forEach((assetId) => {
      if (assetMap[assetId] !== undefined || fetchingRef.current.has(assetId)) {
        return;
      }

      fetchingRef.current.add(assetId);

      fetch(`/api/studio/assets/${assetId}`, { cache: "no-store" })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unable to load asset");
          }
          return response.json();
        })
        .then((asset: StudioAsset) => {
          setAssetMap((prev) => ({ ...prev, [assetId]: asset }));
        })
        .catch(() => {
          setAssetMap((prev) => ({ ...prev, [assetId]: null }));
        })
        .finally(() => {
          fetchingRef.current.delete(assetId);
        });
    });
  }, [assetMap, generations]);

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Sparkles className="mb-2 h-8 w-8 text-muted-foreground" />
        <h3 className="mb-1 font-medium text-sm">No generations yet</h3>
        <p className="max-w-sm text-muted-foreground text-xs">
          Start generating content and your history will appear here
        </p>
      </div>
    );
  }

  function GenerationAssetButtons({
    asset,
  }: {
    asset?: StudioAsset | null;
  }) {
    const {
      signedUrl: viewUrl,
      loading: viewLoading,
    } = useAssetSignedUrl(asset ?? null, "large");
    const {
      signedUrl: downloadUrl,
      loading: downloadLoading,
    } = useSignedUrl(asset?.url ?? null, {
      download: asset?.name || "generated",
    });

    if (!asset) {
      return (
        <span className="text-muted-foreground text-[10px]">
          Preparing generated asset...
        </span>
      );
    }

    return (
      <>
        <Button
          asChild
          className="h-6 text-xs"
          disabled={!viewUrl || viewLoading}
          size="sm"
          variant="outline"
        >
          <a href={viewUrl ?? "#"} rel="noreferrer" target="_blank">
            <ExternalLink className="mr-1 h-2.5 w-2.5" />
            View
          </a>
        </Button>
        <Button
          asChild
          className="h-6 text-xs"
          disabled={!downloadUrl || downloadLoading}
          size="sm"
          variant="outline"
        >
          <a
            href={downloadUrl ?? "#"}
            rel="noreferrer"
            target="_blank"
            download
          >
            <Download className="mr-1 h-2.5 w-2.5" />
            Download
          </a>
        </Button>
      </>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-xs">
          Recent Generations ({generations.length})
        </h3>
        {onRefresh && (
          <Button
            className="h-7 text-xs"
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
        <div className="space-y-2 pr-2">
          {generations.map((generation) => {
            const status = STATUS_CONFIG[generation.status];
            const Icon = status.icon;
            const isVideo = generation.generationType.includes("video");
            const MediaIcon = isVideo ? Video : ImageIcon;

            return (
              <Card
                className="border-border bg-background"
                key={generation.id}
              >
                <CardContent className="p-2.5">
                  <div className="flex gap-2.5">
                    {/* Thumbnail/Preview */}
                    <div className="shrink-0">
                      {generation.status === "completed" &&
                      generation.falResponse ? (
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border-border border bg-muted/30">
                          {isVideo ? (
                            <video
                              className="h-full w-full object-cover"
                              src={
                                (generation.falResponse as any)?.video?.url ||
                                (Array.isArray((generation.falResponse as any)?.videos)
                                  ? (generation.falResponse as any).videos[0]?.url
                                  : undefined)
                              }
                            />
                          ) : (
                            <img
                              alt="Generated image"
                              className="h-full w-full object-cover"
                              src={
                                (generation.falResponse as any)?.images?.[0]?.url ||
                                (generation.falResponse as any)?.image?.url ||
                                (Array.isArray((generation.falResponse as any)?.images)
                                  ? (generation.falResponse as any).images[0]?.url
                                  : undefined)
                              }
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-md border-border border",
                            status.bgColor
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-6 w-6",
                              status.color,
                              status.animate && "animate-spin"
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <Badge
                          className="px-1.5 py-0 text-[10px]"
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
                              "mr-0.5 h-2.5 w-2.5",
                              status.animate && "animate-spin"
                            )}
                          />
                          {status.label}
                        </Badge>
                        <span className="text-muted-foreground text-[10px]">
                          {format(generation.createdAt, "MMM d, HH:mm")}
                        </span>
                      </div>

                      {/* Prompt */}
                      {generation.prompt && (
                        <p className="line-clamp-2 text-xs">
                          {generation.prompt}
                        </p>
                      )}

                      {/* Model Info */}
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                        <Badge className="px-1 py-0 text-[9px]" variant="outline">
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
                        <p className="text-destructive text-[10px]">
                          {generation.error}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {/* Completed - View & Download */}
                        {generation.status === "completed" &&
                          generation.outputAssetId && (
                            <GenerationAssetButtons
                              asset={assetMap[generation.outputAssetId]}
                            />
                          )}

                        {/* Processing/Pending - Cancel */}
                        {(generation.status === "processing" ||
                          generation.status === "pending") && (
                          <Button
                            className="h-6 text-xs"
                            disabled={actioningIds.has(generation.id)}
                            onClick={() => handleCancel(generation.id)}
                            size="sm"
                            variant="outline"
                          >
                            {actioningIds.has(generation.id) ? (
                              <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <XCircle className="mr-1 h-2.5 w-2.5" />
                            )}
                            Cancel
                          </Button>
                        )}

                        {/* Failed - Retry */}
                        {generation.status === "failed" && (
                          <Button
                            className="h-6 text-xs"
                            disabled={actioningIds.has(generation.id)}
                            onClick={() => handleRetry(generation.id)}
                            size="sm"
                            variant="outline"
                          >
                            {actioningIds.has(generation.id) ? (
                              <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-1 h-2.5 w-2.5" />
                            )}
                            Retry
                          </Button>
                        )}
                      </div>
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
