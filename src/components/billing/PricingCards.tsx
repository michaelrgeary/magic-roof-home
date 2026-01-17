import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { STRIPE_PLANS, PlanId } from "@/lib/stripe-plans";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PricingCardsProps {
  currentPlan?: PlanId | null;
  onSubscribe?: () => void;
}

export function PricingCards({ currentPlan, onSubscribe }: PricingCardsProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const handleSubscribe = async (planId: PlanId) => {
    if (!isAuthenticated) {
      navigate("/auth?redirect=/pricing");
      return;
    }

    setLoadingPlan(planId);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        onSubscribe?.();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Basic Plan */}
      <Card className={`relative ${currentPlan === "basic" ? "border-primary" : ""}`}>
        {currentPlan === "basic" && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
            Your Plan
          </Badge>
        )}
        <CardHeader>
          <CardTitle className="text-2xl">{STRIPE_PLANS.basic.name}</CardTitle>
          <CardDescription>Perfect for single-location roofers</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">${STRIPE_PLANS.basic.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {STRIPE_PLANS.basic.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            {STRIPE_PLANS.basic.notIncluded.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                <X className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={currentPlan === "basic" ? "outline" : "default"}
            disabled={currentPlan === "basic" || loadingPlan !== null}
            onClick={() => handleSubscribe("basic")}
          >
            {loadingPlan === "basic" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {currentPlan === "basic" ? "Current Plan" : "Get Started"}
          </Button>
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className={`relative border-2 ${currentPlan === "pro" ? "border-primary" : "border-primary/50"}`}>
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          {currentPlan === "pro" ? "Your Plan" : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Best Value
            </>
          )}
        </Badge>
        <CardHeader>
          <CardTitle className="text-2xl">{STRIPE_PLANS.pro.name}</CardTitle>
          <CardDescription>For growing roofing companies</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">${STRIPE_PLANS.pro.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {STRIPE_PLANS.pro.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full glow-primary"
            disabled={currentPlan === "pro" || loadingPlan !== null}
            onClick={() => handleSubscribe("pro")}
          >
            {loadingPlan === "pro" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {currentPlan === "pro" ? "Current Plan" : "Upgrade to Pro"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
