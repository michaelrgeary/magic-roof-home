import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePublicSite } from "@/hooks/usePublicSite";
import { usePublicBlogs } from "@/hooks/useBlogs";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { Loader2 } from "lucide-react";
import type { SiteConfig } from "@/components/templates/types";

export default function PublicSite() {
  const { slug } = useParams<{ slug: string }>();
  const { data: site, isLoading, error } = usePublicSite(slug);
  const { data: blogs } = usePublicBlogs(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This site doesn't exist or is no longer published.
        </p>
        <a 
          href="/" 
          className="text-primary hover:underline"
        >
          ← Go to homepage
        </a>
      </div>
    );
  }

  const config = site.config as unknown as SiteConfig;
  const siteTitle = config.businessName || "Roofing Company";
  const siteDescription = config.tagline || config.heroSubheadline || 
    `${siteTitle} - Professional roofing services`;

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{siteTitle} | Professional Roofing Services</title>
        <meta name="description" content={siteDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        {config.heroImage && <meta property="og:image" content={config.heroImage} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        {config.heroImage && <meta name="twitter:image" content={config.heroImage} />}
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        {config.phone && <meta name="telephone" content={config.phone} />}
        {config.address && <meta name="address" content={config.address} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RoofingContractor",
            "name": config.businessName,
            "description": siteDescription,
            "telephone": config.phone,
            "email": config.email,
            "address": config.address,
            "areaServed": config.serviceAreas,
            "foundingDate": config.yearEstablished,
            "image": config.logo || config.heroImage,
          })}
        </script>
      </Helmet>

      <TemplateRenderer
        template={site.template as "classic-pro" | "modern-edge" | "trusted-local"}
        config={config}
        siteId={site.id}
        siteSlug={slug}
        isPreview={false}
        blogs={blogs || []}
      />
    </>
  );
}
