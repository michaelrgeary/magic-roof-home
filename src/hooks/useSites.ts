import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Site = Tables<"sites">;
export type SiteInsert = TablesInsert<"sites">;
export type SiteUpdate = TablesUpdate<"sites">;

// Type for site config JSONB
export interface SiteConfig {
  businessName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  services?: string[];
  about?: string;
  heroImage?: string;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  testimonials?: Array<{
    name: string;
    text: string;
    rating: number;
  }>;
  gallery?: string[];
}

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
    mutationFn: async ({ siteId, publish }: { siteId: string; publish: boolean }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("sites")
        .update({ 
          published: publish,
          published_at: publish ? new Date().toISOString() : null
        })
        .eq("id", siteId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sites", user?.id] });
      toast.success(data.published ? "Site published!" : "Site unpublished");
    },
    onError: (error) => {
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
