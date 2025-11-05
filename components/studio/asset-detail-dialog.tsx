"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAssetSignedUrl, useSignedUrl } from "@/hooks/use-signed-url";
import type { StudioAsset } from "@/lib/studio/types";
import { format } from "date-fns";
import {
    Calendar,
    CheckCheck,
    Clock,
    Copy,
    Download,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Layers,
    Music,
    Trash2,
    Video
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AssetDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: StudioAsset | null;
  onDelete?: (assetId: string) => void;
  onUpdate?: (assetId: string, data: Partial<StudioAsset>) => void;
}

export function AssetDetailDialog({
  open,
  onOpenChange,
  asset,
  onDelete,
  onUpdate,
}: AssetDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Get signed URLs for display
  const { signedUrl: largePreview } = useAssetSignedUrl(asset, "large");
  const { signedUrl: thumbnailPreview } = useSignedUrl(asset?.thumbnailUrl || null, {
    transform: {
      width: 800,
      height: 600,
      resize: "contain",
      quality: 85,
      format: "webp",
    },
  });
  const { signedUrl: videoUrl } = useSignedUrl(asset?.url || null);

  if (!asset) return null;

  const handleEdit = () => {
    setEditedName(asset.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedName.trim() && editedName !== asset.name) {
      onUpdate?.(asset.id, { name: editedName.trim() });
      toast.success("Asset name updated");
    }
    setIsEditing(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.url);
    setCopiedUrl(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownload = () => {
    window.open(asset.url, "_blank");
    toast.success("Download started");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this asset?")) {
      onDelete?.(asset.id);
      onOpenChange(false);
      toast.success("Asset deleted");
    }
  };

  const getIcon = () => {
    switch (asset.type) {
      case "video":
        return <Video className="h-8 w-8 text-purple-500" />;
      case "audio":
        return <Music className="h-8 w-8 text-pink-500" />;
      default:
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  autoFocus
                  className="font-semibold text-lg"
                />
              ) : (
                <DialogTitle className="text-2xl truncate">
                  {asset.name}
                </DialogTitle>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={asset.type === "video" ? "default" : "secondary"}>
                  {asset.type}
                </Badge>
                <DialogDescription className="text-xs">
                  Created {format(asset.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </DialogDescription>
              </div>
            </div>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                Edit Name
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Preview
              </h3>
              <div className="relative bg-muted rounded-lg overflow-hidden">
                {asset.type === "image" ? (
                  largePreview ? (
                    <img
                      src={largePreview}
                      alt={asset.name}
                      className="w-full h-auto max-h-[500px] object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-video flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  )
                ) : asset.type === "video" ? (
                  <>
                    {thumbnailPreview && (
                      <img
                        src={thumbnailPreview}
                        alt={`${asset.name} thumbnail`}
                        className="absolute inset-0 w-full h-full object-contain opacity-50 blur-sm"
                      />
                    )}
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        className="relative w-full h-auto max-h-[500px]"
                        preload="metadata"
                      />
                    ) : (
                      <div className="aspect-video flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    <Music className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* File Size */}
                {asset.metadata.size && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      File Size
                    </Label>
                    <p className="text-sm font-medium">
                      {formatBytes(asset.metadata.size)}
                    </p>
                  </div>
                )}

                {/* Dimensions */}
                {asset.metadata.width && asset.metadata.height && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Dimensions
                    </Label>
                    <p className="text-sm font-medium">
                      {asset.metadata.width} × {asset.metadata.height}
                    </p>
                  </div>
                )}

                {/* Duration */}
                {asset.metadata.duration && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Duration
                    </Label>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {asset.metadata.duration.toFixed(1)}s
                    </p>
                  </div>
                )}

                {/* Format */}
                {asset.metadata.format && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Format
                    </Label>
                    <p className="text-sm font-medium uppercase">
                      {asset.metadata.format}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Created
                  </Label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(asset.createdAt, "MMM d, yyyy")}
                  </p>
                </div>

              </div>
            </div>

            <Separator />

            {/* URL */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Public URL</h3>
              <div className="flex gap-2">
                <Input
                  value={asset.url}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copiedUrl ? (
                    <>
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Source Info */}
            {(asset.sourceType || asset.sourceGenerationId) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Source Info</h3>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    {asset.sourceType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Source:</span>
                        <Badge variant="outline" className="capitalize">
                          {asset.sourceType}
                        </Badge>
                      </div>
                    )}
                    {asset.sourceGenerationId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Generation ID:</span>
                        <span className="font-mono text-xs">{asset.sourceGenerationId}</span>
                      </div>
                    )}
                    {asset.projectId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Project ID:</span>
                        <span className="font-mono text-xs">{asset.projectId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(asset.url, "_blank")}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
          <div className="flex-1" />
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
