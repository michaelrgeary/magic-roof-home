import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingChat } from "@/components/chat/OnboardingChat";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { sampleConfig, type SiteConfig } from "@/components/templates/types";
import { Button } from "@/components/ui/button";
import { useSites } from "@/hooks/useSites";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Home, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type TemplateType = "classic-pro" | "modern-edge" | "trusted-local";

const templates: { id: TemplateType; name: string; description: string }[] = [
  { id: "classic-pro", name: "Classic Pro", description: "Traditional & established" },
  { id: "modern-edge", name: "Modern Edge", description: "Bold & contemporary" },
  { id: "trusted-local", name: "Trusted Local", description: "Warm & approachable" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, createProfile } = useProfile();
  const { createSite } = useSites();
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("classic-pro");
  const [config, setConfig] = useState<Partial<SiteConfig>>({
    phone: "(555) 123-4567",
  });
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Merge with sample config for preview
  const previewConfig: SiteConfig = {
    ...sampleConfig,
    ...config,
    services: config.services || sampleConfig.services,
    testimonials: config.testimonials || sampleConfig.testimonials,
    credentials: config.credentials || sampleConfig.credentials,
    serviceAreas: config.serviceAreas || sampleConfig.serviceAreas,
  };

  const handleConfigUpdate = (newConfig: Partial<SiteConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error("Please sign in to save your site");
      return;
    }

    setIsSaving(true);

    try {
      // Create profile if it doesn't exist
      if (!profile) {
        await createProfile.mutateAsync({
          company_name: config.businessName || "My Roofing Company",
          phone: config.phone || null,
        });
      }

      // Create the site
      await createSite.mutateAsync({
        template: selectedTemplate,
        config: JSON.parse(JSON.stringify(previewConfig)),
        published: false,
      });

      toast.success("Site created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save site:", error);
      toast.error("Failed to save site. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Home className="h-5 w-5 text-primary" />
            <span>RoofSites</span>
          </Link>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Chat side */}
        <div className="lg:w-[400px] xl:w-[480px] border-r flex flex-col h-[50vh] lg:h-[calc(100vh-57px)]">
          <OnboardingChat
            onConfigUpdate={handleConfigUpdate}
            onComplete={() => setIsReady(true)}
          />
        </div>

        {/* Preview side */}
        <div className="flex-1 flex flex-col h-[50vh] lg:h-[calc(100vh-57px)]">
          {/* Template selector */}
          <div className="border-b p-4 bg-muted/30">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">Template:</span>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTemplate === template.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {template.name}
                  {selectedTemplate === template.id && (
                    <Check className="inline-block ml-1 h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview iframe/renderer */}
          <div className="flex-1 overflow-auto bg-muted/20">
            <div className="origin-top-left scale-[0.6] lg:scale-75 xl:scale-[0.85]" style={{ width: "166.67%", minHeight: "133.33%" }}>
              <TemplateRenderer
                template={selectedTemplate}
                config={previewConfig}
                isPreview
              />
            </div>
          </div>

          {/* Save button (mobile) */}
          {isReady && (
            <div className="p-4 border-t lg:hidden">
              <Button
                onClick={handleComplete}
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop save button (floating) */}
      {isReady && (
        <div className="hidden lg:block fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleComplete}
            disabled={isSaving}
            size="lg"
            className="shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save & Continue to Dashboard
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
