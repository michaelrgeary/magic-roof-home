import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
  before?: string;
  after?: string;
  caption?: string;
}

interface GalleryLightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function GalleryLightbox({ items, initialIndex, onClose }: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showBefore, setShowBefore] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const item = items[currentIndex];
  const hasBoth = item?.before && item?.after;

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setShowBefore(false);
    setSliderPosition(50);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setShowBefore(false);
    setSliderPosition(50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  };

  if (!item) return null;

  const displayImage = showBefore && item.before ? item.before : item.after || item.before;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Main content */}
      <div
        className="relative max-w-5xl max-h-[80vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {hasBoth ? (
          // Comparison slider
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={item.after}
              alt="After"
              className="absolute inset-0 w-full h-full object-contain bg-black"
              loading="eager"
              decoding="async"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={item.before}
                alt="Before"
                className="absolute inset-0 h-full object-contain bg-black"
                style={{ width: `${100 / (sliderPosition / 100)}%` }}
                loading="eager"
                decoding="async"
              />
            </div>
            <div
              className="absolute inset-y-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
                <ChevronRight className="h-4 w-4 text-gray-600" />
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
            <div className="absolute bottom-4 left-4 text-sm bg-black/70 text-white px-3 py-1 rounded">
              Before
            </div>
            <div className="absolute bottom-4 right-4 text-sm bg-black/70 text-white px-3 py-1 rounded">
              After
            </div>
          </div>
        ) : (
          // Single image
          <img
            src={displayImage}
            alt={item.caption || "Gallery image"}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            loading="eager"
            decoding="async"
          />
        )}

        {/* Caption */}
        {item.caption && (
          <p className="text-white text-center mt-4 text-lg">{item.caption}</p>
        )}

        {/* Image counter */}
        <p className="text-white/50 text-center mt-2 text-sm">
          {currentIndex + 1} / {items.length}
        </p>
      </div>
    </div>
  );
}
