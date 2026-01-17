import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs for plans
const PRODUCT_IDS = {
  basic: "prod_To2R4ld1pyoSQd",
  pro: "prod_To2SFQaADgkcgl",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let plan: string | null = null;
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      const productId = subscription.items.data[0].price.product;
      logStep("Subscription product", { productId });

      if (productId === PRODUCT_IDS.pro) {
        plan = "pro";
      } else if (productId === PRODUCT_IDS.basic) {
        plan = "basic";
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        plan, 
        endDate: subscriptionEnd 
      });

      // Update or create subscription record in Supabase
      const { data: existingSub } = await supabaseClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSub) {
        await supabaseClient
          .from("subscriptions")
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: customerId,
            plan: plan as "basic" | "pro",
            status: "active",
            current_period_end: subscriptionEnd,
          })
          .eq("user_id", user.id);
      } else {
        await supabaseClient
          .from("subscriptions")
          .insert({
            user_id: user.id,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: customerId,
            plan: plan as "basic" | "pro",
            status: "active",
            current_period_end: subscriptionEnd,
          });
      }
    } else {
      logStep("No active subscription found");
      
      // Check for canceled/past_due subscriptions
      const allSubs = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
      });
      
      if (allSubs.data.length > 0) {
        const sub = allSubs.data[0];
        const productId = sub.items.data[0].price.product;
        
        if (productId === PRODUCT_IDS.pro) {
          plan = "pro";
        } else if (productId === PRODUCT_IDS.basic) {
          plan = "basic";
        }

        // Update subscription status in Supabase
        await supabaseClient
          .from("subscriptions")
          .update({
            status: sub.status as "active" | "canceled" | "past_due",
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq("user_id", user.id);
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
