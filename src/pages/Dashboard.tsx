import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSites } from "@/hooks/useSites";
import { useAllLeads } from "@/hooks/useLeads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, FileText, Users, TrendingUp, Plus, Settings, Loader2, ExternalLink, Edit } from "lucide-react";
import type { SiteConfig } from "@/components/templates/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { sites, isLoading: sitesLoading } = useSites();
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        site.published 
                          ? "bg-green-100 text-green-700" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {site.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <CardDescription className="capitalize">
                      {site.template.replace("-", " ")} template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      {site.published && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
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
            <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allLeads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
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
