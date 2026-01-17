import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Re-export SiteConfig from templates for convenience
export type { SiteConfig } from "@/components/templates/types";

export type Site = Tables<"sites">;
export type SiteInsert = TablesInsert<"sites">;
export type SiteUpdate = TablesUpdate<"sites">;


export function useSites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sitesQuery = useQuery({
    queryKey: ["sites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createSite = useMutation({
    mutationFn: async (site: Omit<SiteInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("sites")
        .insert({ ...site, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", user?.id] });
      toast.success("Site created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create site: ${error.message}`);
    },
  });

  const updateSite = useMutation({
    mutationFn: async ({ id, ...updates }: SiteUpdate & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("sites")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", user?.id] });
      toast.success("Site updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update site: ${error.message}`);
    },
  });

  const deleteSite = useMutation({
    mutationFn: async (siteId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("sites")
        .delete()
        .eq("id", siteId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites", user?.id] });
      toast.success("Site deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete site: ${error.message}`);
    },
  });

  const publishSite = useMutation({
    mutationFn: async ({ 
      siteId, 
      publish, 
      domain, 
      domainType 
    }: { 
      siteId: string; 
      publish: boolean; 
      domain?: string;
      domainType?: "subdomain" | "purchased" | "existing";
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (publish) {
        // Use Edge Function for publishing (server-side validation)
        const { data, error } = await supabase.functions.invoke("publish-site", {
          body: { siteId, domain, domainType },
        });

        if (error) throw error;
        
        if (data.error) {
          const err = new Error(data.error) as Error & { code?: string; details?: unknown };
          err.code = data.code;
          err.details = data;
          throw err;
        }

        return data.site;
      } else {
        // Unpublishing can remain client-side (less restrictive)
        const { data, error } = await supabase
          .from("sites")
          .update({ 
            published: false,
            published_at: null
          })
          .eq("id", siteId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sites", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["site"] });
      toast.success(data.published ? "Site published!" : "Site unpublished");
    },
    onError: (error: Error & { code?: string; details?: unknown }) => {
      // Don't show toast for limit errors - let UI handle them
      if (error.code === "LIMIT_REACHED" || error.code === "NO_SUBSCRIPTION") {
        return;
      }
      toast.error(`Failed to update publish status: ${error.message}`);
    },
  });

  return {
    sites: sitesQuery.data ?? [],
    isLoading: sitesQuery.isLoading,
    error: sitesQuery.error,
    createSite,
    updateSite,
    deleteSite,
    publishSite,
  };
}

// Hook to get a single site by ID
export function useSite(siteId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      if (!siteId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("id", siteId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!siteId && !!user?.id,
  });
}
