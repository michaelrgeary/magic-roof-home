import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  Deno.env.get("SITE_URL") || "http://localhost:5173",
  "https://id-preview--f09d1af7-7077-4ab0-88b7-9992a1e45830.lovable.app",
];

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin || "") ? origin! : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// Rate limiting: 10 requests per minute per user
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (userLimit.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT - userLimit.count };
}

// Plan limits
const PLAN_LIMITS = {
  basic: 1,
  pro: Infinity,
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PUBLISH-SITE] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("Authentication required - no auth header");
      return new Response(
        JSON.stringify({ error: "Authentication required", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Invalid token", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid or expired token", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Rate limit check
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later.", code: "RATE_LIMITED" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfter || 60),
          },
          status: 429,
        }
      );
    }

    // Parse request body
    const { siteId, domain, domainType } = await req.json();
    
    if (!siteId) {
      return new Response(
        JSON.stringify({ error: "Site ID is required", code: "INVALID_REQUEST" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Publish request", { siteId, domain, domainType });

    // Verify user owns this site
    const { data: site, error: siteError } = await supabaseClient
      .from("sites")
      .select("id, user_id, published")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      logStep("Site not found", { siteId, error: siteError?.message });
      return new Response(
        JSON.stringify({ error: "Site not found", code: "NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (site.user_id !== user.id) {
      logStep("Unauthorized access attempt", { siteId, siteOwner: site.user_id, requestUser: user.id });
      return new Response(
        JSON.stringify({ error: "You do not own this site", code: "FORBIDDEN" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription status
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription || subscription.status !== "active") {
      logStep("No active subscription", { userId: user.id, subscription });
      return new Response(
        JSON.stringify({
          error: "Active subscription required to publish sites",
          code: "NO_SUBSCRIPTION",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = subscription.plan as "basic" | "pro";
    const siteLimit = PLAN_LIMITS[plan];
    logStep("Subscription verified", { plan, siteLimit });

    // If site is already published, this is an update - allow it
    if (site.published) {
      logStep("Re-publishing existing site", { siteId });
    } else {
      // Check published site count for new publications
      const { count, error: countError } = await supabaseClient
        .from("sites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("published", true);

      if (countError) {
        logStep("Error counting sites", { error: countError.message });
        throw new Error("Failed to check site limit");
      }

      const currentCount = count || 0;
      logStep("Current published sites", { currentCount, limit: siteLimit });

      if (currentCount >= siteLimit) {
        logStep("Site limit reached", { currentCount, limit: siteLimit, plan });
        return new Response(
          JSON.stringify({
            error: `Site limit reached. Your ${plan} plan allows ${siteLimit} published site${siteLimit > 1 ? "s" : ""}.`,
            code: "LIMIT_REACHED",
            currentCount,
            limit: siteLimit,
            plan,
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Publish the site
    const { data: updatedSite, error: updateError } = await supabaseClient
      .from("sites")
      .update({
        published: true,
        published_at: new Date().toISOString(),
        domain: domain || null,
        domain_type: domainType || "subdomain",
      })
      .eq("id", siteId)
      .select()
      .single();

    if (updateError) {
      logStep("Failed to publish site", { error: updateError.message });
      throw new Error("Failed to publish site");
    }

    logStep("Site published successfully", { siteId, domain: updatedSite.domain });

    return new Response(
      JSON.stringify({
        success: true,
        site: {
          id: updatedSite.id,
          domain: updatedSite.domain,
          published: updatedSite.published,
          published_at: updatedSite.published_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
