import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Product IDs for plans
const PRODUCT_IDS = {
  basic: "prod_To2R4ld1pyoSQd",
  pro: "prod_To2SFQaADgkcgl",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const getPlanFromProductId = (productId: string | Stripe.Product): "basic" | "pro" | null => {
  const id = typeof productId === "string" ? productId : productId.id;
  if (id === PRODUCT_IDS.pro) return "pro";
  if (id === PRODUCT_IDS.basic) return "basic";
  return null;
};

serve(async (req) => {
  // Webhooks should only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No signature provided");
      return new Response("No signature", { status: 400 });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logStep("ERROR: Signature verification failed", { error: errorMessage });
      return new Response(`Webhook signature verification failed: ${errorMessage}`, { status: 400 });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Initialize Supabase with service role for database writes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata,
        });

        const userId = session.metadata?.user_id;
        const planFromMeta = session.metadata?.plan as "basic" | "pro" | undefined;

        if (!userId) {
          logStep("WARNING: No user_id in session metadata");
          break;
        }

        // Get subscription details
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const productId = subscription.items.data[0]?.price.product;
          const plan = getPlanFromProductId(productId) || planFromMeta || "basic";

          const subscriptionData = {
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            plan,
            status: "active" as const,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          };

          // Upsert subscription record
          const { data: existingSub } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existingSub) {
            await supabase
              .from("subscriptions")
              .update(subscriptionData)
              .eq("user_id", userId);
            logStep("Updated existing subscription", { userId, plan });
          } else {
            await supabase.from("subscriptions").insert(subscriptionData);
            logStep("Created new subscription", { userId, plan });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const productId = subscription.items.data[0]?.price.product;
        const plan = getPlanFromProductId(productId);

        // Map Stripe status to our status enum
        let status: "active" | "canceled" | "past_due" = "active";
        if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
          status = "canceled";
        } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
          status = "past_due";
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: plan || undefined,
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR updating subscription", { error: error.message });
        } else {
          logStep("Subscription updated", { subscriptionId: subscription.id, status, plan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", {
          subscriptionId: subscription.id,
        });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR canceling subscription", { error: error.message });
        } else {
          logStep("Subscription canceled", { subscriptionId: subscription.id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
        });

        if (invoice.subscription) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            logStep("ERROR marking subscription past_due", { error: error.message });
          } else {
            logStep("Subscription marked as past_due", { subscriptionId: invoice.subscription });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
