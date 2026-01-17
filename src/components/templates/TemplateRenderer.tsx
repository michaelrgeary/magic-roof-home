import { lazy, Suspense } from "react";
import type { SiteConfig } from "./types";
import type { Language } from "@/lib/i18n";

// Lazy load templates for code splitting
const ClassicPro = lazy(() => import("./ClassicPro"));
const ModernEdge = lazy(() => import("./ModernEdge"));
const TrustedLocal = lazy(() => import("./TrustedLocal"));

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
}

interface TemplateRendererProps {
  template: "classic-pro" | "modern-edge" | "trusted-local";
  config: SiteConfig;
  siteId?: string;
  siteSlug?: string;
  isPreview?: boolean;
  blogs?: BlogPost[];
  language?: Language;
}

function TemplateSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 animate-pulse">
      <div className="h-16 bg-gray-200" />
      <div className="h-96 bg-gray-300" />
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplateRenderer({ template, config, siteId, siteSlug, isPreview, blogs, language = 'en' }: TemplateRendererProps) {
  const renderTemplate = () => {
    switch (template) {
      case "classic-pro":
        return <ClassicPro config={config} siteId={siteId} siteSlug={siteSlug} isPreview={isPreview} blogs={blogs} language={language} />;
      case "modern-edge":
        return <ModernEdge config={config} siteId={siteId} siteSlug={siteSlug} isPreview={isPreview} blogs={blogs} language={language} />;
      case "trusted-local":
        return <TrustedLocal config={config} siteId={siteId} siteSlug={siteSlug} isPreview={isPreview} blogs={blogs} language={language} />;
      default:
        return <ClassicPro config={config} siteId={siteId} siteSlug={siteSlug} isPreview={isPreview} blogs={blogs} language={language} />;
    }
  };

  return (
    <Suspense fallback={<TemplateSkeleton />}>
      {renderTemplate()}
    </Suspense>
  );
}
