import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useSites } from "@/hooks/useSites";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug, generateUniqueSlug } from "@/lib/slugify";
import { STRIPE_PLANS } from "@/lib/stripe-plans";
import type { SiteConfig } from "@/components/templates/types";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  ArrowLeft,
  Globe,
  Rocket,
  CreditCard,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

interface ValidationError {
  field: string;
  message: string;
  link?: string;
}

interface PublishFlowProps {
  siteId: string;
  config: SiteConfig;
  template: string;
  isPublished: boolean;
  currentDomain?: string | null;
  onPublishComplete?: () => void;
}

export function PublishFlow({ 
  siteId, 
  config, 
  template,
  isPublished,
  currentDomain,
  onPublishComplete 
}: PublishFlowProps) {
  const navigate = useNavigate();
  const { sites, publishSite, updateSite } = useSites();
  const { subscription, isLoading: subLoading, isActive, isPro } = useSubscription();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(
    isPublished && currentDomain ? `/site/${currentDomain}` : null
  );

  // Check subscription limits
  const publishedSitesCount = sites.filter(s => s.published).length;
  const currentPlan = isActive ? subscription?.plan : null;
  const siteLimit = currentPlan ? STRIPE_PLANS[currentPlan].siteLimit : 0;
  const canPublish = isActive && (isPro || publishedSitesCount < siteLimit || isPublished);

  // Validation
  const validateSite = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!config.businessName?.trim()) {
      errors.push({
        field: "Business Name",
        message: "Your company name is required",
        link: `/edit/${siteId}`
      });
    }

    if (!config.phone?.trim()) {
      errors.push({
        field: "Phone Number",
        message: "A contact phone number is required",
        link: `/edit/${siteId}`
      });
    }

    if (!config.services || config.services.length === 0) {
      errors.push({
        field: "Services",
        message: "Add at least one service you offer",
        link: `/edit/${siteId}`
      });
    }

    if (!template) {
      errors.push({
        field: "Template",
        message: "Select a template for your site",
        link: `/edit/${siteId}`
      });
    }

    return errors;
  };

  const validationErrors = validateSite();
  const isValid = validationErrors.length === 0;

  const handlePublish = async () => {
    if (!isValid || !canPublish) return;

    setIsDeploying(true);
    setDeployProgress(10);

    try {
      // Step 1: Generate slug from business name
      setDeployProgress(20);
      const baseSlug = generateSlug(config.businessName);
      
      // Step 2: Check for existing slugs to ensure uniqueness
      setDeployProgress(40);
      const { data: existingSites } = await supabase
        .from("sites")
        .select("domain")
        .not("domain", "is", null);
      
      const existingSlugs = existingSites?.map(s => s.domain).filter(Boolean) as string[] || [];
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs.filter(s => s !== currentDomain));
      
      // Step 3: Update site with domain and publish
      setDeployProgress(60);
      await updateSite.mutateAsync({
        id: siteId,
        domain: uniqueSlug,
        domain_type: "subdomain" as const,
      });

      setDeployProgress(80);
      await publishSite.mutateAsync({ siteId, publish: true });

      setDeployProgress(100);
      setPublishedUrl(`/site/${uniqueSlug}`);
      
      onPublishComplete?.();
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish site. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      await publishSite.mutateAsync({ siteId, publish: false });
      setPublishedUrl(null);
      toast.success("Site unpublished successfully");
      onPublishComplete?.();
    } catch (error) {
      console.error("Unpublish error:", error);
      toast.error("Failed to unpublish site");
    }
  };

  const copyUrl = () => {
    if (publishedUrl) {
      const fullUrl = `${window.location.origin}${publishedUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("URL copied to clipboard!");
    }
  };

  // Loading state
  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No subscription - show upgrade prompt
  if (!isActive) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
          <p className="text-muted-foreground">
            You need an active subscription to publish your site
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose a Plan</CardTitle>
            <CardDescription>
              Select a plan to publish your roofing website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Basic</span>
                  <span className="font-bold">${STRIPE_PLANS.basic.price}/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">1 website included</p>
              </div>
              <div className="p-4 border-2 border-primary rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Pro</span>
                  <span className="font-bold">${STRIPE_PLANS.pro.price}/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">Unlimited websites + custom domains</p>
              </div>
            </div>
            <Button className="w-full glow-primary" asChild>
              <Link to="/pricing">
                View Plans
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => navigate(`/edit/${siteId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </div>
    );
  }

  // At site limit (Basic plan)
  if (!canPublish && !isPublished) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Site Limit Reached</h2>
          <p className="text-muted-foreground">
            Your Basic plan allows only {siteLimit} published site
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Publish unlimited sites with the Pro plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Unlimited roofing websites
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Custom domain support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Priority support
              </li>
            </ul>
            <Button className="w-full glow-primary" asChild>
              <Link to="/billing">
                Upgrade to Pro - ${STRIPE_PLANS.pro.price}/mo
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => navigate(`/edit/${siteId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </div>
    );
  }

  // Published state
  if (publishedUrl && isPublished) {
    const fullUrl = `${window.location.origin}${publishedUrl}`;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Site is Live!</h2>
          <p className="text-muted-foreground">
            Your roofing website is now published and accessible to the public.
          </p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Your Live URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm break-all">{fullUrl}</code>
              <Button variant="ghost" size="sm" onClick={copyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1" asChild>
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live Site
                </a>
              </Button>
              <Button variant="outline" onClick={copyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Domain</CardTitle>
            <CardDescription>
              Connect your own domain for a professional look
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="p-4 bg-primary/5 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Custom domains coming soon!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Custom domains available with Pro plan
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/billing">Upgrade to Pro</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(`/edit/${siteId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleUnpublish}
            disabled={publishSite.isPending}
          >
            {publishSite.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Unpublish Site
          </Button>
        </div>
      </div>
    );
  }

  // Deploying state
  if (isDeploying) {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Rocket className="h-8 w-8 text-primary animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold">Publishing Your Site...</h2>
        <p className="text-muted-foreground">
          This usually takes just a few seconds
        </p>
        
        <div className="max-w-md mx-auto space-y-2">
          <Progress value={deployProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {deployProgress < 30 && "Generating your site..."}
            {deployProgress >= 30 && deployProgress < 60 && "Checking domain availability..."}
            {deployProgress >= 60 && deployProgress < 90 && "Deploying to server..."}
            {deployProgress >= 90 && "Almost done..."}
          </p>
        </div>
      </div>
    );
  }

  // Validation / Ready to publish state
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Publish Your Site</h2>
        <p className="text-muted-foreground">
          Make your roofing website live and accessible to customers
        </p>
      </div>

      {/* Validation Status */}
      <Card className={isValid ? "border-green-200 bg-green-50/50" : "border-destructive/50"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            {isValid ? "Ready to Publish" : "Fix These Issues First"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isValid ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Company name: {config.businessName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Phone: {config.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{config.services?.length || 0} services listed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Template: {template.replace("-", " ")}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {validationErrors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{error.field}</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error.message}</span>
                    {error.link && (
                      <Button variant="link" size="sm" asChild className="p-0 h-auto">
                        <a href={error.link}>Fix this →</a>
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Site Address</CardTitle>
          <CardDescription>
            Your site will be available at this address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-sm">
              {window.location.origin}/site/{generateSlug(config.businessName || "your-company")}
            </code>
          </div>
          {!isPro && (
            <p className="text-xs text-muted-foreground mt-2">
              * Custom domains available with Pro plan
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex-1" onClick={() => navigate(`/edit/${siteId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <Button 
          className="flex-1 glow-primary" 
          onClick={handlePublish}
          disabled={!isValid}
        >
          <Rocket className="mr-2 h-4 w-4" />
          Publish Site
        </Button>
      </div>
    </div>
  );
}
