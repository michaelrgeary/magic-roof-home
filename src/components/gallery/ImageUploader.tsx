import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, deleteImage, extractPathFromUrl } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";

interface ImageUploaderProps {
  siteId: string;
  imageType: "gallery" | "logo" | "before" | "after";
  currentImage?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  placeholder?: string;
}

interface UploadState {
  status: "idle" | "compressing" | "uploading" | "complete" | "error";
  progress: number;
  error?: string;
}

export function ImageUploader({
  siteId,
  imageType,
  currentImage,
  onUploadComplete,
  onDelete,
  className = "",
  aspectRatio = "video",
  placeholder = "Drop image here or click to upload",
}: ImageUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "min-h-[120px]",
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!user?.id) {
        toast.error("Please sign in to upload images");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or WebP image");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      setUploadState({ status: "compressing", progress: 10 });

      try {
        const result = await uploadImage(
          file,
          user.id,
          siteId,
          imageType,
          (progress) => {
            setUploadState({
              status: progress < 30 ? "compressing" : "uploading",
              progress,
            });
          }
        );

        setUploadState({ status: "complete", progress: 100 });
        onUploadComplete(result.url);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadState({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
        });
        toast.error("Failed to upload image");
        setPreviewUrl(null);
      }
    },
    [user?.id, siteId, imageType, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!currentImage) return;

    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    const path = extractPathFromUrl(currentImage);
    if (path) {
      try {
        await deleteImage(path);
        toast.success("Image deleted");
      } catch (error) {
        console.error("Delete failed:", error);
        // Continue anyway - image reference will be removed
      }
    }

    setPreviewUrl(null);
    onDelete?.();
  };

  const displayImage = previewUrl || currentImage;
  const isUploading = uploadState.status === "compressing" || uploadState.status === "uploading";

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onClick={!displayImage && !isUploading ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-lg overflow-hidden border-2 border-dashed transition-all
          ${aspectClasses[aspectRatio]}
          ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${!displayImage && !isUploading ? "cursor-pointer hover:border-primary/50 hover:bg-muted/50" : ""}
          ${uploadState.status === "error" ? "border-destructive" : ""}
        `}
      >
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt="Uploaded"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  Replace
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {uploadState.status === "compressing" ? "Compressing..." : "Uploading..."}
            </p>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        ) : uploadState.status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive text-center">{uploadState.error}</p>
            <Button variant="outline" size="sm" onClick={handleClick}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            {isDragOver ? (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-sm text-primary font-medium">Drop to upload</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">{placeholder}</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
