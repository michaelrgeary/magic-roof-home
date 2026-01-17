import { Wrench, Home, Search, CloudLightning, LucideIcon } from "lucide-react";
import { getLocalizedText, type Language, type LocalizedString } from "@/lib/i18n";

interface ServiceCardProps {
  name: string | LocalizedString;
  description: string | LocalizedString;
  icon?: string;
  variant?: "classic" | "modern" | "trusted";
  language?: Language;
}

const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  home: Home,
  search: Search,
  "cloud-lightning": CloudLightning,
};

export function ServiceCard({ name, description, icon, variant = "classic", language = "en" }: ServiceCardProps) {
  const IconComponent = icon ? iconMap[icon] || Wrench : Wrench;

  const cardStyles = {
    classic: "bg-white border-2 border-slate-200 p-6 rounded-sm hover:border-amber-500 transition-colors",
    modern: "bg-zinc-900 border border-zinc-700 p-6 rounded-none hover:bg-zinc-800 transition-colors group",
    trusted: "bg-white border border-stone-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow",
  };

  const iconWrapperStyles = {
    classic: "w-12 h-12 bg-navy-100 rounded-sm flex items-center justify-center mb-4 bg-slate-100",
    modern: "w-12 h-12 bg-zinc-800 rounded-none flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors",
    trusted: "w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4",
  };

  const iconStyles = {
    classic: "h-6 w-6 text-amber-600",
    modern: "h-6 w-6 text-cyan-400 group-hover:text-black transition-colors",
    trusted: "h-6 w-6 text-green-700",
  };

  const titleStyles = {
    classic: "text-lg font-serif font-bold text-slate-900 mb-2",
    modern: "text-lg font-bold text-white mb-2 uppercase tracking-wide",
    trusted: "text-lg font-semibold text-stone-800 mb-2",
  };

  const descStyles = {
    classic: "text-slate-600 text-sm",
    modern: "text-zinc-400 text-sm",
    trusted: "text-stone-600 text-sm",
  };

  return (
    <div className={cardStyles[variant]}>
      <div className={iconWrapperStyles[variant]}>
        <IconComponent className={iconStyles[variant]} />
      </div>
      <h3 className={titleStyles[variant]}>{getLocalizedText(name, language)}</h3>
      <p className={descStyles[variant]}>{getLocalizedText(description, language)}</p>
    </div>
  );
}
