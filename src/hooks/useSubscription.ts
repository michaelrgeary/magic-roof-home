import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Subscription = Tables<"subscriptions">;
export type SubscriptionInsert = TablesInsert<"subscriptions">;
export type SubscriptionUpdate = TablesUpdate<"subscriptions">;

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createSubscription = useMutation({
    mutationFn: async (subscription: Omit<SubscriptionInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({ ...subscription, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
      toast.success("Subscription created");
    },
    onError: (error) => {
      toast.error(`Failed to create subscription: ${error.message}`);
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async (updates: SubscriptionUpdate) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
    onError: (error) => {
      toast.error(`Failed to update subscription: ${error.message}`);
    },
  });

  const isActive = subscriptionQuery.data?.status === "active";
  const isPro = subscriptionQuery.data?.plan === "pro" && isActive;

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    error: subscriptionQuery.error,
    isActive,
    isPro,
    createSubscription,
    updateSubscription,
  };
}
