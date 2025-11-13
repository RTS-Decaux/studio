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

type AssetGalleryProps = {
  assets: StudioAsset[];
  projectId?: string;
};

type ViewMode = "grid" | "list";

export function AssetGallery({ assets, projectId }: AssetGalleryProps) {
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
      !search || asset.name.toLowerCase().includes(search.toLowerCase());
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
    if (selectedAssets.size === 0) {
      return;
    }

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
    const response = await fetch(`/api/studio/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update");
    }

    router.refresh();
  };

  const handleUploadComplete = () => {
    router.refresh();
  };

  if (assets.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <h3 className="mb-1 font-medium text-sm">No assets yet</h3>
          <p className="mb-3 max-w-sm text-muted-foreground text-xs">
            Generate content or upload files to see them here
          </p>
          <Button onClick={() => setUploadDialogOpen(true)} size="sm">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload Asset
          </Button>
        </div>

        <UploadAssetDialog
          onOpenChange={setUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
          open={uploadDialogOpen}
          projectId={projectId}
        />
      </>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            value={search}
          />
        </div>

        {/* Type Filter */}
        <Select
          onValueChange={(value) =>
            setTypeFilter(value as StudioAssetType | "all")
          }
          value={typeFilter}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
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
        <div className="flex items-center rounded-md border">
          <Button
            className="h-8 rounded-r-none px-2"
            onClick={() => setViewMode("grid")}
            size="sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
          >
            <Grid3x3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            className="h-8 rounded-l-none px-2"
            onClick={() => setViewMode("list")}
            size="sm"
            variant={viewMode === "list" ? "secondary" : "ghost"}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selection Mode Toggle */}
        {!selectionMode && (
          <Button
            className="h-8 text-xs"
            onClick={() => setSelectionMode(true)}
            size="sm"
            variant="outline"
          >
            Select
          </Button>
        )}

        {/* Upload Button */}
        <Button
          className="h-8 text-xs"
          onClick={() => setUploadDialogOpen(true)}
          size="sm"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-xs">
              {selectedAssets.size} selected
            </span>
            <Button
              className="h-7 text-xs"
              disabled={selectedAssets.size === filteredAssets.length}
              onClick={selectAll}
              size="sm"
              variant="ghost"
            >
              Select All
            </Button>
            <Button
              className="h-7 text-xs"
              disabled={selectedAssets.size === 0}
              onClick={deselectAll}
              size="sm"
              variant="ghost"
            >
              Deselect All
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              className="h-7 text-xs"
              disabled={selectedAssets.size === 0 || isDeleting}
              onClick={handleBulkDelete}
              size="sm"
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : `Delete (${selectedAssets.size})`}
            </Button>
            <Button
              className="h-7 text-xs"
              onClick={() => {
                setSelectionMode(false);
                setSelectedAssets(new Set());
              }}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Asset Count */}
      <div className="text-muted-foreground text-xs">
        {filteredAssets.length}{" "}
        {filteredAssets.length === 1 ? "asset" : "assets"}
      </div>

      {/* Assets */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            No assets found matching your filters
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAssets.map((asset) => (
            <AssetCard
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredAssets.map((asset) => (
            <AssetListItem
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AssetDetailDialog
        asset={selectedAsset}
        onDelete={handleDelete}
        onOpenChange={setDetailDialogOpen}
        open={detailDialogOpen}
      />

      <UploadAssetDialog
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
        open={uploadDialogOpen}
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
      className={`group cursor-pointer border bg-background transition-all ${
        isSelected
          ? "border-foreground ring-1 ring-foreground ring-offset-1"
          : "border-border hover:border-foreground/50"
      }`}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div
          className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted/30"
          onClick={onClick}
        >
          {!loading && signedUrl ? (
            <img
              alt={asset.name}
              className="h-full w-full object-cover"
              loading="lazy"
              src={signedUrl}
            />
          ) : loading ? (
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            </div>
          ) : (
            <Icon className="h-6 w-6 text-muted-foreground/60" />
          )}

          {/* Selection Overlay */}
          {selectionMode && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-foreground/20"
                  : "bg-background/0 hover:bg-background/10"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-foreground bg-foreground"
                    : "border-border bg-background"
                }`}
              >
                {isSelected && (
                  <svg
                    className="h-4 w-4 text-background"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Hover Overlay (only when not in selection mode) */}
          {!selectionMode && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-background/90 opacity-0 transition-smooth group-hover:opacity-100">
              <Button className="h-7 px-2" size="sm" variant="secondary">
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button className="h-7 px-2" size="sm" variant="secondary">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Type Badge */}
          <Badge
            className="absolute top-1.5 right-1.5 border-border bg-card px-1 py-0 text-[9px]"
            variant="secondary"
          >
            {asset.type}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-0.5 p-2">
          <h4 className="truncate font-medium text-xs">{asset.name}</h4>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
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
          ? "border-foreground ring-1 ring-foreground ring-offset-1"
          : "hover:border-foreground/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-2.5">
        <div className="flex items-center gap-3">
          {/* Selection Checkbox */}
          {selectionMode && (
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                isSelected
                  ? "border-foreground bg-foreground"
                  : "border-border bg-background"
              }`}
            >
              {isSelected && (
                <svg
                  className="h-4 w-4 text-background"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              )}
            </div>
          )}

          {/* Thumbnail */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            {!loading && signedUrl ? (
              <img
                alt={asset.name}
                className="h-full w-full object-cover"
                loading="lazy"
                src={signedUrl}
              />
            ) : loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            ) : (
              <Icon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h4 className="mb-0.5 truncate font-medium text-xs">
              {asset.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Badge className="px-1 py-0 text-[9px]" variant="secondary">
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
            <div className="flex items-center gap-1.5">
              <Button
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(asset.url, "_blank");
                }}
                size="sm"
                variant="outline"
              >
                <ExternalLink className="mr-1 h-2.5 w-2.5" />
                View
              </Button>
              <Button
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(asset.url, "_blank");
                }}
                size="sm"
                variant="outline"
              >
                <Download className="mr-1 h-2.5 w-2.5" />
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
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
