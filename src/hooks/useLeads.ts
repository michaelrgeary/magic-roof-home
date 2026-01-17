import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;
export type LeadInsert = TablesInsert<"leads">;
export type LeadUpdate = TablesUpdate<"leads">;

export function useLeads(siteId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ["leads", siteId],
    queryFn: async () => {
      if (!siteId || !user?.id) return [];
      
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!siteId && !!user?.id,
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: Lead["status"] }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", siteId] });
      toast.success("Lead status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update lead: ${error.message}`);
    },
  });

  // Get lead stats
  const stats = {
    total: leadsQuery.data?.length ?? 0,
    new: leadsQuery.data?.filter(l => l.status === "new").length ?? 0,
    contacted: leadsQuery.data?.filter(l => l.status === "contacted").length ?? 0,
    converted: leadsQuery.data?.filter(l => l.status === "converted").length ?? 0,
    lost: leadsQuery.data?.filter(l => l.status === "lost").length ?? 0,
  };

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    stats,
    updateLeadStatus,
  };
}

// Public hook for submitting leads (no auth required) - uses rate-limited edge function
export function useSubmitLead() {
  return useMutation({
    mutationFn: async (lead: Omit<LeadInsert, "id" | "created_at" | "status" | "sms_sent" | "read" | "notes">) => {
      const response = await supabase.functions.invoke("submit-lead", {
        body: lead,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to submit lead");
      }

      // Handle rate limiting response
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Your request has been submitted! We'll be in touch soon.");
    },
    onError: (error) => {
      if (error.message.includes("Too many requests")) {
        toast.error("Please wait a moment before submitting another request.");
      } else {
        toast.error(`Failed to submit request: ${error.message}`);
      }
    },
  });
}

// Hook to get all leads across all sites for the current user
export function useAllLeads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-leads", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get all user's site IDs
      const { data: sites, error: sitesError } = await supabase
        .from("sites")
        .select("id")
        .eq("user_id", user.id);

      if (sitesError) throw sitesError;
      if (!sites || sites.length === 0) return [];

      const siteIds = sites.map(s => s.id);

      // Then get all leads for those sites
      const { data, error } = await supabase
        .from("leads")
        .select("*, sites(template, config)")
        .in("site_id", siteIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
