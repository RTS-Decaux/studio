"use client";

import { Image, Upload, Video, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ReferenceInputKind } from "@/lib/ai/studio-models";
import { cn } from "@/lib/utils";

type ReferenceInputManagerProps = {
  type: ReferenceInputKind;
  label: string;
  required?: boolean;
  value: File | string | null;
  onChange: (value: File | null) => void;
  disabled?: boolean;
};

const INPUT_CONFIG: Record<
  ReferenceInputKind,
  { accept: string; icon: React.ComponentType<{ className?: string }> }
> = {
  "reference-image": {
    accept: "image/*",
    icon: Image,
  },
  "first-frame": {
    accept: "image/*",
    icon: Image,
  },
  "last-frame": {
    accept: "image/*",
    icon: Image,
  },
  "reference-video": {
    accept: "video/*",
    icon: Video,
  },
};

export function ReferenceInputManager({
  type,
  label,
  required = false,
  value,
  onChange,
  disabled = false,
}: ReferenceInputManagerProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [isDragging, setIsDragging] = useState(false);

  const config = INPUT_CONFIG[type];
  const Icon = config.icon;
  const isVideo = type === "reference-video";

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (file) {
        onChange(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        onChange(null);
        setPreview(null);
      }
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      const acceptedTypes = config.accept.split(",").map((t) => t.trim());
      const fileType = file.type;

      const isAccepted = acceptedTypes.some((type) => {
        if (type === "image/*") {
          return fileType.startsWith("image/");
        }
        if (type === "video/*") {
          return fileType.startsWith("video/");
        }
        return fileType === type;
      });

      if (isAccepted) {
        handleFileChange(file);
      } else {
        // TODO: Show error toast
        console.error("Invalid file type:", fileType);
      }
    }
  };

  const handleRemove = () => {
    handleFileChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-medium text-sm">
          {label}
          {required && (
            <Badge className="px-1.5 py-0 text-xs" variant="destructive">
              Required
            </Badge>
          )}
        </Label>
      </div>

      {preview ? (
        <div className="group relative">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            {isVideo ? (
              <video
                className="h-full w-full object-cover"
                controls
                src={preview}
              />
            ) : (
              <img
                alt={label}
                className="h-full w-full object-cover"
                src={preview}
              />
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                className="shadow-lg"
                disabled={disabled}
                onClick={handleRemove}
                size="sm"
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>

          {/* File info */}
          {value instanceof File && (
            <div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{value.name}</span>
              <span>({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
      ) : (
        <label
          className={cn(
            "flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
            isDragging
              ? "scale-[1.02] border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/50 hover:bg-accent/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
            <div
              className={cn(
                "rounded-full p-3 transition-colors",
                isDragging
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isDragging ? (
                <Upload className="h-6 w-6" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>

            <div className="text-center">
              <p className="mb-1 font-medium text-foreground text-sm">
                {isDragging
                  ? "Drop file here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-muted-foreground text-xs">
                {isVideo
                  ? "MP4, WebM, MOV up to 100MB"
                  : "PNG, JPG, WebP up to 10MB"}
              </p>
            </div>
          </div>

          <input
            accept={config.accept}
            className="hidden"
            disabled={disabled}
            onChange={handleInputChange}
            type="file"
          />
        </label>
      )}
    </div>
  );
}
