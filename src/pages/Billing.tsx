import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionStatus } from "@/components/billing/SubscriptionStatus";
import { PricingCards } from "@/components/billing/PricingCards";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Billing() {
  const navigate = useNavigate();
  const { signOut, isAuthenticated } = useAuth();
  const { subscription, isActive } = useSubscription();
  const currentPlan = isActive ? subscription?.plan : null;

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut} hideFooter>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground mb-8">
          Manage your subscription and billing information
        </p>

        <div className="space-y-8">
          {/* Current Subscription Status */}
          <SubscriptionStatus onUpgrade={() => {}} />

          {/* Plan Comparison */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {isActive ? "Compare Plans" : "Choose a Plan"}
            </h2>
            <PricingCards currentPlan={currentPlan} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
