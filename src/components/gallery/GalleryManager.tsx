import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BeforeAfterPair, type GalleryItem } from "./BeforeAfterPair";
import { ImageUploader } from "./ImageUploader";
import { Plus, ImageIcon } from "lucide-react";
import type { SiteConfig } from "@/components/templates/types";

interface GalleryManagerProps {
  siteId: string;
  config: Partial<SiteConfig>;
  onConfigChange: (config: Partial<SiteConfig>) => void;
}

export function GalleryManager({ siteId, config, onConfigChange }: GalleryManagerProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>(config.gallery || []);
  const [logo, setLogo] = useState<string | undefined>(config.logo);

  // Sync with parent config
  useEffect(() => {
    setGallery(config.gallery || []);
    setLogo(config.logo);
  }, [config.gallery, config.logo]);

  const updateGallery = (newGallery: GalleryItem[]) => {
    setGallery(newGallery);
    onConfigChange({ ...config, gallery: newGallery });
  };

  const addPair = () => {
    updateGallery([...gallery, { caption: "" }]);
  };

  const updatePair = (index: number, item: GalleryItem) => {
    const newGallery = [...gallery];
    newGallery[index] = item;
    updateGallery(newGallery);
  };

  const deletePair = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    updateGallery(newGallery);
  };

  const movePair = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= gallery.length) return;

    const newGallery = [...gallery];
    [newGallery[index], newGallery[newIndex]] = [newGallery[newIndex], newGallery[index]];
    updateGallery(newGallery);
  };

  const handleLogoUpload = (url: string) => {
    setLogo(url);
    onConfigChange({ ...config, logo: url });
  };

  const handleLogoDelete = () => {
    setLogo(undefined);
    onConfigChange({ ...config, logo: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Company Logo
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Upload your company logo to display in your site header.
        </p>
        <ImageUploader
          siteId={siteId}
          imageType="logo"
          currentImage={logo}
          onUploadComplete={handleLogoUpload}
          onDelete={handleLogoDelete}
          aspectRatio="auto"
          placeholder="Upload your logo"
          className="max-w-xs"
        />
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Before & After Gallery</h3>
            <p className="text-sm text-muted-foreground">
              Showcase your best work with before and after photos.
            </p>
          </div>
          <Button onClick={addPair} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        </div>

        {gallery.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">No gallery photos yet</p>
            <Button onClick={addPair} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {gallery.map((item, index) => (
              <BeforeAfterPair
                key={index}
                siteId={siteId}
                item={item}
                index={index}
                onChange={(updatedItem) => updatePair(index, updatedItem)}
                onDelete={() => deletePair(index)}
                onMoveUp={() => movePair(index, "up")}
                onMoveDown={() => movePair(index, "down")}
                canMoveUp={index > 0}
                canMoveDown={index < gallery.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
