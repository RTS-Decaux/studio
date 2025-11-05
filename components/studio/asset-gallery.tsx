"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssetSignedUrl } from "@/hooks/use-signed-url";
import { deleteAssetAction } from "@/lib/studio/actions";
import type { StudioAsset, StudioAssetType } from "@/lib/studio/types";
import { format } from "date-fns";
import {
  Download,
  ExternalLink,
  Grid3x3,
  Image as ImageIcon,
  List,
  Search,
  Upload,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AssetDetailDialog } from "./asset-detail-dialog";
import { UploadAssetDialog } from "./upload-asset-dialog";

interface AssetGalleryProps {
  assets: StudioAsset[];
  projectId?: string;
}

type ViewMode = "grid" | "list";

export function AssetGallery({
  assets,
  projectId,
}: AssetGalleryProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StudioAssetType | "all">("all");
  const [selectedAsset, setSelectedAsset] = useState<StudioAsset | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      !search ||
      asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAssetClick = (asset: StudioAsset) => {
    if (selectionMode) {
      toggleAssetSelection(asset.id);
    } else {
      setSelectedAsset(asset);
      setDetailDialogOpen(true);
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedAssets(new Set(filteredAssets.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelectedAssets(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedAssets.size} asset(s)?`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/studio/assets/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: Array.from(selectedAssets) }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Deleted ${result.deleted} asset(s)`);
        setSelectedAssets(new Set());
        setSelectionMode(false);
        router.refresh();
      } else {
        toast.error(
          `Deleted ${result.deleted}, failed ${result.failed} asset(s)`
        );
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete assets");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await deleteAssetAction(assetId);
      toast.success("Asset deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const handleUpdate = async (assetId: string, data: { name?: string }) => {
    try {
      const response = await fetch(`/api/studio/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  const handleUploadComplete = () => {
    router.refresh();
  };

  if (assets.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <Upload className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">No assets yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Generate content or upload files to see them here
          </p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>

        <UploadAssetDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
          projectId={projectId}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as StudioAssetType | "all")
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Selection Mode Toggle */}
        {!selectionMode && (
          <Button
            variant="outline"
            onClick={() => setSelectionMode(true)}
            size="sm"
          >
            Select
          </Button>
        )}

        {/* Upload Button */}
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedAssets.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              disabled={selectedAssets.size === filteredAssets.length}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              disabled={selectedAssets.size === 0}
            >
              Deselect All
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedAssets.size === 0 || isDeleting}
            >
              {isDeleting ? "Deleting..." : `Delete (${selectedAssets.size})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectionMode(false);
                setSelectedAssets(new Set());
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Asset Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}
      </div>

      {/* Assets */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No assets found matching your filters
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => handleAssetClick(asset)}
              selectionMode={selectionMode}
              isSelected={selectedAssets.has(asset.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map((asset) => (
            <AssetListItem
              key={asset.id}
              asset={asset}
              onClick={() => handleAssetClick(asset)}
              selectionMode={selectionMode}
              isSelected={selectedAssets.has(asset.id)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AssetDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        asset={selectedAsset}
        onDelete={handleDelete}
      />

      <UploadAssetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
        projectId={projectId}
      />
    </div>
  );
}

function AssetCard({
  asset,
  onClick,
  selectionMode,
  isSelected,
}: {
  asset: StudioAsset;
  onClick?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
}) {
  const isVideo = asset.type === "video";
  const Icon = isVideo ? Video : ImageIcon;

  // Get signed URL with small thumbnail transformation
  const { signedUrl, loading } = useAssetSignedUrl(asset, "small");

  return (
    <Card
      className={`group cursor-pointer bg-background border-thin transition-all ${
        isSelected
          ? "border-primary ring-2 ring-primary ring-offset-2"
          : "border-border hover:border-foreground/50"
      }`}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div
          className="relative aspect-video bg-muted/30 flex items-center justify-center overflow-hidden"
          onClick={onClick}
        >
          {!loading && signedUrl ? (
            <img
              src={signedUrl}
              alt={asset.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Icon className="h-7 w-7 text-muted-foreground/60" />
          )}

          {/* Selection Overlay */}
          {selectionMode && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-colors ${
                isSelected ? "bg-primary/20" : "bg-background/0 hover:bg-background/10"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Hover Overlay (only when not in selection mode) */}
          {!selectionMode && (
            <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" className="shadow-md">
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="secondary" className="shadow-md">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Type Badge */}
          <Badge
            className="absolute top-2 right-2 bg-card border-thin border-border text-xs px-1.5 py-0"
            variant={isVideo ? "default" : "secondary"}
          >
            {asset.type}
          </Badge>
        </div>

        {/* Info */}
        <div className="p-3 space-y-0.5">
          <h4 className="font-medium text-sm truncate">{asset.name}</h4>
          <div className="flex items-center justify-between text-xs text-muted-foreground/70">
            <span>{format(asset.createdAt, "MMM d, yyyy")}</span>
            {asset.metadata.size && (
              <span>{formatBytes(asset.metadata.size)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssetListItem({
  asset,
  onClick,
  selectionMode,
  isSelected,
}: {
  asset: StudioAsset;
  onClick?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
}) {
  const isVideo = asset.type === "video";
  const Icon = isVideo ? Video : ImageIcon;

  // Get signed URL with small thumbnail transformation
  const { signedUrl, loading } = useAssetSignedUrl(asset, "small");

  return (
    <Card
      className={`group cursor-pointer transition-all ${
        isSelected
          ? "border-primary ring-2 ring-primary ring-offset-2"
          : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Selection Checkbox */}
          {selectionMode && (
            <div
              className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-background border-border"
              }`}
            >
              {isSelected && (
                <svg
                  className="w-5 h-5 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          )}

          {/* Thumbnail */}
          <div className="shrink-0 w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {!loading && signedUrl ? (
              <img
                src={signedUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            ) : (
              <Icon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate mb-1">{asset.name}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant={isVideo ? "default" : "secondary"}>
                {asset.type}
              </Badge>
              <span>{format(asset.createdAt, "MMM d, yyyy")}</span>
              {asset.metadata.width && asset.metadata.height && (
                <span>
                  {asset.metadata.width}×{asset.metadata.height}
                </span>
              )}
              {asset.metadata.size && (
                <span>{formatBytes(asset.metadata.size)}</span>
              )}
            </div>
          </div>

          {/* Actions (only when not in selection mode) */}
          {!selectionMode && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(asset.url, "_blank");
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(asset.url, "_blank");
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
