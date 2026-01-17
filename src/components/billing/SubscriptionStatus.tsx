import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_PLANS } from "@/lib/stripe-plans";
import { Loader2, CreditCard, Calendar, ExternalLink, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const { subscription, isLoading, isActive, isPro } = useSubscription();
  const [isManaging, setIsManaging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentPlan = subscription?.plan;
  const planDetails = currentPlan ? STRIPE_PLANS[currentPlan] : null;

  const handleManageBilling = async () => {
    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setIsManaging(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      
      toast.success("Subscription status refreshed");
      // The hook will automatically refetch
      window.location.reload();
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh status");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // No subscription
  if (!subscription || !isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            Subscribe to start building your roofing websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a plan to unlock all features and start creating professional 
            roofing websites that convert visitors into leads.
          </p>
          <div className="flex gap-2">
            <Button onClick={onUpgrade}>
              View Plans
            </Button>
            <Button variant="outline" onClick={handleRefreshStatus} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Current Plan
              <Badge variant={isPro ? "default" : "secondary"}>
                {planDetails?.name || currentPlan}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isPro ? "Unlimited sites, premium features" : "1 site included"}
            </CardDescription>
          </div>
          {!isPro && (
            <Button onClick={onUpgrade} size="sm">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Monthly:</span>
            <span className="font-medium">${planDetails?.price}/mo</span>
          </div>
          {subscription.current_period_end && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next billing:</span>
              <span className="font-medium">
                {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleManageBilling} disabled={isManaging}>
            {isManaging ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Manage Billing
          </Button>
          <Button variant="ghost" onClick={handleRefreshStatus} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh Status
          </Button>
        </div>

        {subscription.status === "past_due" && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            Your payment is past due. Please update your payment method to continue service.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
