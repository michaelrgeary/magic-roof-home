import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteChat } from "@/components/chat/SiteChat";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { GalleryManager } from "@/components/gallery/GalleryManager";
import { TestimonialManager, type Testimonial } from "@/components/testimonials/TestimonialManager";
import { sampleConfig, type SiteConfig } from "@/components/templates/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSite, useSites } from "@/hooks/useSites";
import { useAuth } from "@/hooks/useAuth";
import { Home, ArrowLeft, Check, Loader2, X, AlertCircle, MessageSquare, Image, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type TemplateType = "classic-pro" | "modern-edge" | "trusted-local";

const templates: { id: TemplateType; name: string; description: string }[] = [
  { id: "classic-pro", name: "Classic Pro", description: "Traditional & established" },
  { id: "modern-edge", name: "Modern Edge", description: "Bold & contemporary" },
  { id: "trusted-local", name: "Trusted Local", description: "Warm & approachable" },
];

export default function EditSite() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: site, isLoading: siteLoading, error: siteError } = useSite(siteId);
  const { updateSite } = useSites();
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("classic-pro");
  const [config, setConfig] = useState<Partial<SiteConfig>>({});
  const [originalConfig, setOriginalConfig] = useState<Partial<SiteConfig>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "gallery" | "reviews">("chat");

  // Load site data
  useEffect(() => {
    if (site) {
      const siteConfig = site.config as unknown as Partial<SiteConfig>;
      setConfig(siteConfig);
      setOriginalConfig(siteConfig);
      setSelectedTemplate(site.template as TemplateType);
    }
  }, [site]);

  // Merge with sample config for preview (but not gallery - use actual)
  const previewConfig: SiteConfig = {
    ...sampleConfig,
    ...config,
    services: config.services || sampleConfig.services,
    testimonials: config.testimonials || sampleConfig.testimonials,
    credentials: config.credentials || sampleConfig.credentials,
    serviceAreas: config.serviceAreas || sampleConfig.serviceAreas,
    gallery: config.gallery || [], // Use actual gallery, no sample
    logo: config.logo,
  };

  const handleConfigUpdate = (newConfig: Partial<SiteConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    setHasChanges(true);
  };

  const handleChangesDetected = (detectedChanges: string[]) => {
    setChanges(detectedChanges);
  };

  const handleSave = async () => {
    if (!siteId || !user?.id) {
      toast.error("Unable to save changes");
      return;
    }

    setIsSaving(true);

    try {
      await updateSite.mutateAsync({
        id: siteId,
        template: selectedTemplate,
        config: JSON.parse(JSON.stringify(previewConfig)),
      });

      toast.success("Site updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save site:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      const confirmed = window.confirm("Are you sure you want to discard your changes?");
      if (!confirmed) return;
    }
    navigate("/dashboard");
  };

  if (siteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (siteError || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Site not found</h1>
          <p className="text-muted-foreground mb-4">
            This site doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            {hasChanges && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Home className="h-5 w-5 text-primary" />
            <span>RoofSites</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDiscard}>
              <X className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Edit side */}
        <div className="lg:w-[400px] xl:w-[480px] border-r flex flex-col h-[50vh] lg:h-[calc(100vh-57px)]">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "gallery" | "reviews")} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 m-2" style={{ width: "calc(100% - 16px)" }}>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Image className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-0">
              <SiteChat
                mode="edit"
                currentConfig={originalConfig}
                onConfigUpdate={handleConfigUpdate}
                onChangesDetected={handleChangesDetected}
                onComplete={handleSave}
              />
            </TabsContent>
            
            <TabsContent value="gallery" className="flex-1 overflow-auto m-0 p-4">
              <GalleryManager
                siteId={siteId!}
                config={config}
                onConfigChange={handleConfigUpdate}
              />
            </TabsContent>

            <TabsContent value="reviews" className="flex-1 overflow-auto m-0 p-4">
              <TestimonialManager
                testimonials={(config.testimonials as Testimonial[]) || []}
                onUpdate={(testimonials) => handleConfigUpdate({ testimonials })}
              />
            </TabsContent>
          </Tabs>
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
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setHasChanges(true);
                  }}
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
                siteId={siteId}
                isPreview
              />
            </div>
          </div>

          {/* Save button (mobile) */}
          {hasChanges && (
            <div className="p-4 border-t lg:hidden">
              <Button
                onClick={handleSave}
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
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop save button (floating) */}
      {hasChanges && (
        <div className="hidden lg:block fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSave}
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
