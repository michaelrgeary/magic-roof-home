import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, FileText, Users, TrendingUp, Plus, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, signOut, isAuthenticated } = useAuth();

  const stats = [
    { label: "Active Sites", value: "0", icon: Globe, trend: null },
    { label: "Page Views", value: "0", icon: TrendingUp, trend: null },
    { label: "Leads", value: "0", icon: Users, trend: null },
    { label: "Blog Posts", value: "0", icon: FileText, trend: null },
  ];

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Create Your First Site</CardTitle>
              <CardDescription>
                Get started by creating a professional website for your roofing business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create New Site
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences, billing, and team members.
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
      </div>
    </Layout>
  );
}
