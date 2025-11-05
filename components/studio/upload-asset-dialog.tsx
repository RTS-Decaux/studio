"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { StudioAssetType } from "@/lib/studio/types";
import {
    AlertCircle,
    FileCheck,
    Image as ImageIcon,
    Music,
    Upload,
    Video,
    X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface UploadAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (assetId: string) => void;
  projectId?: string;
}

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function UploadAssetDialog({
  open,
  onOpenChange,
  onUploadComplete,
  projectId,
}: UploadAssetDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [assetType, setAssetType] = useState<StudioAssetType>("image");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
  };

  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    audio: 20 * 1024 * 1024, // 20MB
  };

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: UploadFile[] = [];

      Array.from(selectedFiles).forEach((file) => {
        // Validate file type
        const isValidType =
          assetType === "image"
            ? file.type.startsWith("image/")
            : assetType === "video"
              ? file.type.startsWith("video/")
              : file.type.startsWith("audio/");

        if (!isValidType) {
          toast.error(`Invalid file type: ${file.name}`);
          return;
        }

        // Validate file size
        if (file.size > maxSizes[assetType]) {
          toast.error(
            `File too large: ${file.name} (max ${maxSizes[assetType] / 1024 / 1024}MB)`,
          );
          return;
        }

        // Create preview for images
        const uploadFile: UploadFile = {
          file,
          progress: 0,
          status: "pending",
        };

        if (assetType === "image") {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadFile.preview = e.target?.result as string;
            setFiles((prev) => [...prev]);
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(uploadFile);
      });

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [assetType],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const uploadFile = files[i];

        // Update status to uploading
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" as const } : f,
          ),
        );

        try {
          // Create FormData
          const formData = new FormData();
          formData.append("file", uploadFile.file);
          formData.append("type", assetType);
          if (projectId) {
            formData.append("projectId", projectId);
          }

          // Upload with progress tracking
          const response = await fetch("/api/studio/assets/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const result = await response.json();

          // Update status to success
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "success" as const, progress: 100 }
                : f,
            ),
          );

          onUploadComplete?.(result.id);
        } catch (error) {
          // Update status to error
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "error" as const,
                    error: "Upload failed",
                  }
                : f,
            ),
          );
          toast.error(`Failed to upload ${uploadFile.file.name}`);
        }
      }

      // Check if all uploads succeeded
      const allSuccess = files.every((f) => f.status === "success");
      if (allSuccess) {
        toast.success("All files uploaded successfully!");
        onOpenChange(false);
        setFiles([]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getIcon = () => {
    switch (assetType) {
      case "video":
        return <Video className="h-8 w-8 text-purple-500" />;
      case "audio":
        return <Music className="h-8 w-8 text-pink-500" />;
      default:
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Assets
          </DialogTitle>
          <DialogDescription>
            Upload images, videos, or audio files to your asset library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Asset Type Selector */}
          <div className="space-y-2">
            <Label>Asset Type</Label>
            <Select
              value={assetType}
              onValueChange={(value) => {
                setAssetType(value as StudioAssetType);
                setFiles([]);
              }}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images (max 10MB)
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videos (max 100MB)
                  </div>
                </SelectItem>
                <SelectItem value="audio">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Audio (max 20MB)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
              ${isUploading ? "opacity-50 pointer-events-none" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes[assetType]}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />

            <div className="flex flex-col items-center gap-3">
              {getIcon()}
              <div>
                <p className="font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported: {acceptedTypes[assetType]} (max{" "}
                  {maxSizes[assetType] / 1024 / 1024}MB per file)
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <Label>Files ({files.length})</Label>
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {/* Preview/Icon */}
                  <div className="shrink-0 w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getIcon()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Progress */}
                    {uploadFile.status === "uploading" && (
                      <Progress value={uploadFile.progress} className="mt-2" />
                    )}

                    {/* Error */}
                    {uploadFile.status === "error" && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="shrink-0">
                    {uploadFile.status === "success" ? (
                      <FileCheck className="h-5 w-5 text-green-500" />
                    ) : uploadFile.status === "error" ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : uploadFile.status === "uploading" ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFiles([]);
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {files.length} {files.length === 1 ? "File" : "Files"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
