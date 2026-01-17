import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryItem {
  before?: string;
  after?: string;
  caption?: string;
}

interface BeforeAfterPairProps {
  siteId: string;
  item: GalleryItem;
  index: number;
  onChange: (item: GalleryItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function BeforeAfterPair({
  siteId,
  item,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: BeforeAfterPairProps) {
  const [showSlider, setShowSlider] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleBeforeUpload = (url: string) => {
    onChange({ ...item, before: url });
  };

  const handleAfterUpload = (url: string) => {
    onChange({ ...item, after: url });
  };

  const handleCaptionChange = (caption: string) => {
    onChange({ ...item, caption });
  };

  const handleDeleteConfirm = () => {
    const confirmed = window.confirm("Delete this before/after pair?");
    if (confirmed) {
      onDelete();
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <span className="text-sm font-medium">Project {index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteConfirm}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Before</label>
          <ImageUploader
            siteId={siteId}
            imageType="before"
            currentImage={item.before}
            onUploadComplete={handleBeforeUpload}
            onDelete={() => onChange({ ...item, before: undefined })}
            placeholder="Upload before photo"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">After</label>
          <ImageUploader
            siteId={siteId}
            imageType="after"
            currentImage={item.after}
            onUploadComplete={handleAfterUpload}
            onDelete={() => onChange({ ...item, after: undefined })}
            placeholder="Upload after photo"
          />
        </div>
      </div>

      {/* Comparison slider (when both images present) */}
      {item.before && item.after && (
        <div className="mb-4">
          <button
            onClick={() => setShowSlider(!showSlider)}
            className="text-xs text-primary hover:underline mb-2"
          >
            {showSlider ? "Hide" : "Show"} comparison slider
          </button>
          
          {showSlider && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={item.after}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={item.before}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: `${100 / (sliderPosition / 100)}%` }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div
                className="absolute inset-y-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              />
              <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                Before
              </div>
              <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                After
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      <Input
        value={item.caption || ""}
        onChange={(e) => handleCaptionChange(e.target.value)}
        placeholder="Project description (e.g., 'Complete shingle replacement - Oak Park residence')"
        className="text-sm"
      />
    </div>
  );
}
