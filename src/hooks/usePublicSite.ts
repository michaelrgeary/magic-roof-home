import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePublicSite(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-site", slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("domain", slug)
        .eq("published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
