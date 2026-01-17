import { Star } from "lucide-react";
import { getLocalizedText, type Language, type LocalizedString } from "@/lib/i18n";

interface TestimonialCardProps {
  name: string;
  text: string | LocalizedString;
  rating: number;
  location?: string;
  variant?: "classic" | "modern" | "trusted";
  language?: Language;
}

export function TestimonialCard({ name, text, rating, location, variant = "classic", language = "en" }: TestimonialCardProps) {
  const cardStyles = {
    classic: "bg-white border-2 border-slate-200 p-6 rounded-sm",
    modern: "bg-zinc-800 border border-zinc-700 p-6 rounded-none",
    trusted: "bg-stone-50 border border-stone-200 p-6 rounded-xl shadow-sm",
  };

  const starColor = {
    classic: "text-amber-500",
    modern: "text-cyan-400",
    trusted: "text-yellow-500",
  };

  return (
    <div className={cardStyles[variant]}>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? starColor[variant] : "text-gray-300"}`}
            fill={i < rating ? "currentColor" : "none"}
          />
        ))}
      </div>
      <p className={`mb-4 italic ${variant === "modern" ? "text-zinc-300" : "text-gray-600"}`}>
        "{getLocalizedText(text, language)}"
      </p>
      <div className={variant === "modern" ? "text-white" : "text-gray-900"}>
        <p className="font-semibold">{name}</p>
        {location && (
          <p className={`text-sm ${variant === "modern" ? "text-zinc-400" : "text-gray-500"}`}>
            {location}
          </p>
        )}
      </div>
    </div>
  );
}
