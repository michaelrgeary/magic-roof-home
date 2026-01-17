import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
  sizes?: string;
  priority?: boolean;
  onClick?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  aspectRatio = "video",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "",
  };

  // Generate srcset for responsive images if using Supabase storage
  const generateSrcSet = (url: string): string | undefined => {
    // Only generate srcset for Supabase storage URLs
    if (!url.includes("supabase") || !url.includes("/storage/")) {
      return undefined;
    }

    // Supabase storage supports image transforms
    const widths = [400, 800, 1200];
    return widths
      .map((w) => {
        const transformUrl = `${url}?width=${w}&quality=80`;
        return `${transformUrl} ${w}w`;
      })
      .join(", ");
  };

  const srcSet = generateSrcSet(src);

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground text-sm",
          aspectClasses[aspectRatio],
          className
        )}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio], className)}>
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onClick={onClick}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          onClick && "cursor-pointer"
        )}
      />
    </div>
  );
}
