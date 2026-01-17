import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useAllLeads } from "@/hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog";
import type { SiteConfig } from "@/components/templates/types";

// Extended Lead type with joined site data and new fields
type Lead = {
  id: string;
  site_id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: "quote_form" | "contact_form" | "chat";
  status: "new" | "contacted" | "converted" | "lost";
  sms_sent: boolean;
  created_at: string;
  notes?: string | null;
  read?: boolean;
  sites?: { template: string; config: unknown } | null;
};

export default function Leads() {
  const { isAuthenticated, signOut } = useAuth();
  const { data: allLeads, isLoading } = useAllLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allLeadsData = allLeads as Lead[] | undefined;
  
  // Calculate stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const leadsThisWeek = allLeadsData?.filter(
    (l) => new Date(l.created_at) >= weekAgo
  ).length ?? 0;

  const stats = {
    total: allLeadsData?.length ?? 0,
    new: allLeadsData?.filter((l) => l.status === "new").length ?? 0,
    contacted: allLeadsData?.filter((l) => l.status === "contacted").length ?? 0,
    converted: allLeadsData?.filter((l) => l.status === "converted").length ?? 0,
    lost: allLeadsData?.filter((l) => l.status === "lost").length ?? 0,
    thisWeek: leadsThisWeek,
  };

  // Filter leads
  const filteredLeads = allLeadsData?.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) ?? [];

  const getSiteName = (lead: Lead): string => {
    if (lead.sites?.config && typeof lead.sites.config === "object" && "businessName" in lead.sites.config) {
      return (lead.sites.config as SiteConfig).businessName || "Unknown Site";
    }
    return "Unknown Site";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
      new: { variant: "default", icon: Clock },
      contacted: { variant: "secondary", icon: Phone },
      converted: { variant: "default", icon: CheckCircle },
      lost: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.new;
    return (
      <Badge variant={config.variant} className="capitalize">
        <config.icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lead Management</h1>
          <p className="text-muted-foreground">
            Track and manage leads from all your sites
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-primary">{stats.thisWeek}</div>
              )}
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stats.total}</div>
              )}
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> New
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              )}
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Contacted
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
              )}
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Converted
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
              )}
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Lost
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                <p className="text-muted-foreground">
                  When visitors submit forms on your sites, they'll appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead className="hidden md:table-cell">Site</TableHead>
                    <TableHead className="hidden sm:table-cell">Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead as Lead)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {lead.status === "new" && !lead.read && (
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{getSiteName(lead as Lead)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="capitalize text-xs">
                          {lead.source.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${lead.phone}`;
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          {lead.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${lead.email}`;
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Lead Detail Dialog */}
        <LeadDetailDialog
          lead={selectedLead}
          siteName={selectedLead ? getSiteName(selectedLead) : ""}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        />
      </div>
    </Layout>
  );
}
