import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSites } from "@/hooks/useSites";
import { useAllLeads } from "@/hooks/useLeads";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Globe, FileText, Users, TrendingUp, Plus, Settings, Loader2, ExternalLink, Edit, Rocket, EyeOff, CreditCard, ArrowUpRight } from "lucide-react";
import type { SiteConfig } from "@/components/templates/types";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { sites, isLoading: sitesLoading, publishSite } = useSites();
  const { data: allLeads, isLoading: leadsLoading } = useAllLeads();

  const isLoading = profileLoading || sitesLoading || leadsLoading;

  const publishedSites = sites.filter(s => s.published);
  const newLeads = allLeads?.filter(l => l.status === "new") ?? [];

  const stats = [
    { label: "Active Sites", value: publishedSites.length.toString(), icon: Globe },
    { label: "Total Sites", value: sites.length.toString(), icon: FileText },
    { label: "New Leads", value: newLeads.length.toString(), icon: Users },
    { label: "Total Leads", value: (allLeads?.length ?? 0).toString(), icon: TrendingUp },
  ];

  const getSiteBusinessName = (config: unknown): string => {
    if (config && typeof config === 'object' && 'businessName' in config) {
      return (config as SiteConfig).businessName || "Untitled Site";
    }
    return "Untitled Site";
  };

  const handleUnpublish = async (siteId: string) => {
    await publishSite.mutateAsync({ siteId, publish: false });
  };

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {profile?.company_name ? `Welcome, ${profile.company_name}!` : "Welcome back!"}
          </h1>
          <p className="text-muted-foreground">
            {user?.email ? `Signed in as ${user.email}` : "Manage your roofing websites"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>
                {sites.length === 0 ? "Create Your First Site" : "Create Another Site"}
              </CardTitle>
              <CardDescription>
                {sites.length === 0
                  ? "Our AI assistant will help you build a professional website in minutes."
                  : "Add another website to your portfolio."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="glow-primary" onClick={() => navigate("/onboarding")}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Site
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences, billing, and company information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sites List */}
        {sites.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Sites</h2>
              <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Site
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => (
                <Card key={site.id} className="card-elevated group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {getSiteBusinessName(site.config)}
                      </CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                        site.published 
                          ? "bg-green-100 text-green-700" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {site.published ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Live
                          </>
                        ) : (
                          "Draft"
                        )}
                      </span>
                    </div>
                    <CardDescription className="capitalize">
                      {site.template.replace("-", " ")} template
                    </CardDescription>
                    {site.published && site.domain && (
                      <p className="text-xs text-primary truncate">
                        /site/{site.domain}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/edit/${site.id}`)}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      {site.published ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <a href={`/site/${site.domain}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unpublish Site?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will take your site offline. Visitors will no longer be able to access it at the current URL. You can republish at any time.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUnpublish(site.id)}>
                                  Unpublish
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/publish/${site.id}`)}
                        >
                          <Rocket className="mr-2 h-3 w-3" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Leads */}
        {allLeads && allLeads.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Recent Leads
                {newLeads.length > 0 && (
                  <Badge variant="default" className="text-xs">
                    {newLeads.length} new
                  </Badge>
                )}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigate("/leads")}>
                View All Leads
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allLeads.slice(0, 5).map((lead) => (
                    <div 
                      key={lead.id} 
                      className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate("/leads")}
                    >
                      <div className="flex items-center gap-3">
                        {lead.status === "new" && !lead.read && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lead.status === "new" 
                            ? "bg-primary/10 text-primary"
                            : lead.status === "converted"
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {lead.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
