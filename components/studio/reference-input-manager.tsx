"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ReferenceInputKind } from "@/lib/ai/studio-models";
import { cn } from "@/lib/utils";
import { Image, Upload, Video, X } from "lucide-react";
import { useCallback, useState } from "react";

interface ReferenceInputManagerProps {
  type: ReferenceInputKind;
  label: string;
  required?: boolean;
  value: File | string | null;
  onChange: (value: File | null) => void;
  disabled?: boolean;
}

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

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      const acceptedTypes = config.accept.split(",").map((t) => t.trim());
      const fileType = file.type;

      const isAccepted = acceptedTypes.some((type) => {
        if (type === "image/*") return fileType.startsWith("image/");
        if (type === "video/*") return fileType.startsWith("video/");
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
        <Label className="text-sm font-medium flex items-center gap-2">
          {label}
          {required && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              Required
            </Badge>
          )}
        </Label>
      </div>

      {preview ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted">
            {isVideo ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={preview}
                alt={label}
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={disabled}
                className="shadow-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>

          {/* File info */}
          {value instanceof File && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{value.name}</span>
              <span>({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border bg-background hover:border-primary/50 hover:bg-accent/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
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
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isVideo ? "MP4, WebM, MOV up to 100MB" : "PNG, JPG, WebP up to 10MB"}
              </p>
            </div>
          </div>

          <input
            type="file"
            className="hidden"
            accept={config.accept}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </label>
      )}
    </div>
  );
}
