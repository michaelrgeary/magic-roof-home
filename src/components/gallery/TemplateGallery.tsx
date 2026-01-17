import { useState } from "react";
import { GalleryLightbox } from "./GalleryLightbox";
import { OptimizedImage } from "./OptimizedImage";

interface GalleryItem {
  before?: string;
  after?: string;
  caption?: string;
}

interface TemplateGalleryProps {
  items: GalleryItem[];
  variant?: "classic" | "modern" | "trusted";
}

export function TemplateGallery({ items, variant = "classic" }: TemplateGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter to only show items with at least one image
  const validItems = items.filter((item) => item.before || item.after);

  if (validItems.length === 0) {
    return null;
  }

  const cardStyles = {
    classic: "rounded-sm",
    modern: "rounded-none",
    trusted: "rounded-xl",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {validItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setLightboxIndex(index)}
            className={`group relative overflow-hidden ${cardStyles[variant]} focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            {/* Optimized image with lazy loading and skeleton placeholder */}
            <OptimizedImage
              src={item.after || item.before || ""}
              alt={item.caption || `Project ${index + 1}`}
              aspectRatio="video"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-300 group-hover:scale-105"
            />

            {/* Before/After indicator */}
            {item.before && item.after && (
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                  Before/After
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-10">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                View Project
              </span>
            </div>

            {/* Caption */}
            {item.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                <p className="text-white text-sm line-clamp-2">{item.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={validItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}