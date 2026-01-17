import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSites } from "@/hooks/useSites";
import { useAllLeads } from "@/hooks/useLeads";
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
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/page-loader";
import { 
  Globe, 
  FileText, 
  Users, 
  TrendingUp, 
  Plus, 
  Settings, 
  ExternalLink, 
  Edit, 
  Rocket, 
  EyeOff, 
  CreditCard,
  Clock,
  MessageSquare,
  Star,
  Phone
} from "lucide-react";
import type { SiteConfig } from "@/components/templates/types";
import { formatDistanceToNow } from "date-fns";

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
    { label: "Active Sites", value: publishedSites.length.toString(), icon: Globe, color: "text-green-600" },
    { label: "Total Sites", value: sites.length.toString(), icon: FileText, color: "text-blue-600" },
    { label: "New Leads", value: newLeads.length.toString(), icon: Users, color: "text-primary" },
    { label: "Total Leads", value: (allLeads?.length ?? 0).toString(), icon: TrendingUp, color: "text-purple-600" },
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

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
        <DashboardSkeleton />
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
      <div className="container py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {profile?.company_name ? `Welcome, ${profile.company_name}!` : "Welcome back!"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {user?.email ? `Signed in as ${user.email}` : "Manage your roofing websites"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Button 
            className="h-auto py-4 flex flex-col items-start gap-1 min-h-[64px]" 
            onClick={() => navigate("/onboarding")}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">New Site</span>
            </div>
            <span className="text-xs opacity-80">Create a website</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-start gap-1 min-h-[64px]"
            onClick={() => navigate("/leads")}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-semibold">View Leads</span>
              {newLeads.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">
                  {newLeads.length}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Manage contacts</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-start gap-1 min-h-[64px]"
            onClick={() => navigate("/blogs")}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold">Blog Posts</span>
            </div>
            <span className="text-xs text-muted-foreground">AI-powered content</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-start gap-1 min-h-[64px]"
            onClick={() => navigate("/billing")}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-semibold">Billing</span>
            </div>
            <span className="text-xs text-muted-foreground">Manage subscription</span>
          </Button>
        </div>

        {/* Sites Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold">Your Sites</h2>
            {sites.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")} className="min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                Add Site
              </Button>
            )}
          </div>

          {sites.length === 0 ? (
            <Card>
              <EmptyState
                icon={Globe}
                title="Create your first site"
                description="Our AI assistant will help you build a professional roofing website in minutes. Get started now!"
                action={{
                  label: "Create New Site",
                  onClick: () => navigate("/onboarding"),
                  icon: Plus,
                }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => (
                <Card key={site.id} className="card-elevated group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {getSiteBusinessName(site.config)}
                        </CardTitle>
                        <CardDescription className="capitalize mt-1">
                          {site.template.replace("-", " ")} template
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={site.published ? "default" : "secondary"}
                        className={`shrink-0 ${site.published ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
                      >
                        {site.published ? (
                          <><Globe className="h-3 w-3 mr-1" /> Live</>
                        ) : (
                          "Draft"
                        )}
                      </Badge>
                    </div>
                    {site.updated_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3" />
                        Edited {formatDistanceToNow(new Date(site.updated_at), { addSuffix: true })}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 min-h-[44px]"
                        onClick={() => navigate(`/edit/${site.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {site.published ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="min-h-[44px] min-w-[44px] p-0"
                            asChild
                          >
                            <a href={`/site/${site.domain}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] p-0">
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
                                <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="min-h-[44px]" onClick={() => handleUnpublish(site.id)}>
                                  Unpublish
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          className="min-h-[44px]"
                          onClick={() => navigate(`/publish/${site.id}`)}
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              Recent Leads
              {newLeads.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {newLeads.length} new
                </Badge>
              )}
            </h2>
            {allLeads && allLeads.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => navigate("/leads")} className="min-h-[44px]">
                View All
              </Button>
            )}
          </div>

          {!allLeads || allLeads.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title="No leads yet"
                description="When visitors submit forms on your published sites, their contact information will appear here."
              />
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allLeads.slice(0, 5).map((lead) => (
                    <div 
                      key={lead.id} 
                      className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors min-h-[72px]"
                      onClick={() => navigate("/leads")}
                    >
                      <div className="flex items-center gap-3">
                        {lead.status === "new" && !lead.read && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{lead.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{lead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-primary/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Phone className="h-4 w-4 text-primary" />
                        </a>
                        <div className="text-right hidden sm:block">
                          <Badge 
                            variant={lead.status === "new" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {lead.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
