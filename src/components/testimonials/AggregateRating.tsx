import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  location?: string;
}

interface AggregateRatingProps {
  testimonials: Testimonial[];
  variant?: "classic" | "modern" | "trusted";
}

export function AggregateRating({ testimonials, variant = "classic" }: AggregateRatingProps) {
  if (!testimonials || testimonials.length === 0) return null;

  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  const roundedAverage = Math.round(averageRating * 10) / 10;

  const styles = {
    classic: {
      container: "flex items-center justify-center gap-3 mb-8",
      rating: "text-2xl font-bold text-slate-900",
      stars: "text-amber-500",
      count: "text-sm text-slate-600",
    },
    modern: {
      container: "flex items-center justify-center gap-3 mb-8",
      rating: "text-2xl font-bold text-white",
      stars: "text-cyan-400",
      count: "text-sm text-zinc-400",
    },
    trusted: {
      container: "flex items-center justify-center gap-3 mb-8",
      rating: "text-2xl font-bold text-stone-800",
      stars: "text-yellow-500",
      count: "text-sm text-stone-600",
    },
  };

  const style = styles[variant];

  return (
    <div className={style.container}>
      <span className={style.rating}>{roundedAverage.toFixed(1)}</span>
      <div className="flex flex-col items-start">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < Math.round(averageRating) ? style.stars : "text-gray-300"}`}
              fill={i < Math.round(averageRating) ? "currentColor" : "none"}
            />
          ))}
        </div>
        <span className={style.count}>
          Based on {testimonials.length} review{testimonials.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
