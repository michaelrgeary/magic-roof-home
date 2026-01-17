import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useSite } from "@/hooks/useSites";
import { PublishFlow } from "@/components/publish/PublishFlow";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import type { SiteConfig } from "@/components/templates/types";

export default function PublishSite() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { signOut, isAuthenticated } = useAuth();
  const { data: site, isLoading, refetch } = useSite(siteId);

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!site) {
    return (
      <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Site Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The site you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const config = site.config as unknown as SiteConfig;

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Publish Flow Panel */}
        <div className="w-full lg:w-[400px] xl:w-[480px] border-r bg-background p-6 overflow-y-auto">
          <PublishFlow
            siteId={site.id}
            config={config}
            template={site.template}
            isPublished={site.published}
            currentDomain={site.domain}
            onPublishComplete={() => refetch()}
          />
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-muted/30 overflow-hidden hidden lg:block">
          <div className="h-full overflow-auto">
            <div className="transform scale-75 origin-top-left w-[133.33%] h-[133.33%]">
              <TemplateRenderer
                template={site.template as "classic-pro" | "modern-edge" | "trusted-local"}
                config={config}
                siteId={site.id}
                isPreview
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
