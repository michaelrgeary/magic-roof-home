import { lazy, Suspense } from "react";
import type { SiteConfig } from "./types";

// Lazy load templates for code splitting
const ClassicPro = lazy(() => import("./ClassicPro"));
const ModernEdge = lazy(() => import("./ModernEdge"));
const TrustedLocal = lazy(() => import("./TrustedLocal"));

interface TemplateRendererProps {
  template: "classic-pro" | "modern-edge" | "trusted-local";
  config: SiteConfig;
  siteId?: string;
  isPreview?: boolean;
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

export function TemplateRenderer({ template, config, siteId, isPreview }: TemplateRendererProps) {
  const renderTemplate = () => {
    switch (template) {
      case "classic-pro":
        return <ClassicPro config={config} siteId={siteId} isPreview={isPreview} />;
      case "modern-edge":
        return <ModernEdge config={config} siteId={siteId} isPreview={isPreview} />;
      case "trusted-local":
        return <TrustedLocal config={config} siteId={siteId} isPreview={isPreview} />;
      default:
        return <ClassicPro config={config} siteId={siteId} isPreview={isPreview} />;
    }
  };

  return (
    <Suspense fallback={<TemplateSkeleton />}>
      {renderTemplate()}
    </Suspense>
  );
}
