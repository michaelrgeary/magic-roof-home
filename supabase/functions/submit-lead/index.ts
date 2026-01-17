import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  Deno.env.get("SITE_URL") || "http://localhost:5173",
  "https://id-preview--f09d1af7-7077-4ab0-88b7-9992a1e45830.lovable.app",
];

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin || "") ? origin! : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// In-memory rate limiting store
// Format: { [key]: { count: number, resetTime: number } }
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         req.headers.get("x-real-ip") ||
         req.headers.get("cf-connecting-ip") ||
         "unknown";
}

// Rate limit: 5 leads per minute per IP
const LEAD_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIP = getClientIP(req);
    const rateLimitKey = `lead:${clientIP}`;
    const rateCheck = checkRateLimit(rateLimitKey, LEAD_RATE_LIMIT);

    if (!rateCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please wait a moment and try again.",
          retryAfter: Math.ceil(rateCheck.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000))
          } 
        }
      );
    }

    const { site_id, name, phone, email, message, source } = await req.json();

    // Validate required fields
    if (!site_id || !name || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: site_id, name, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic validation
    if (typeof name !== "string" || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof phone !== "string" || phone.length > 20) {
      return new Response(
        JSON.stringify({ error: "Invalid phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (email && (typeof email !== "string" || email.length > 255)) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (message && (typeof message !== "string" || message.length > 1000)) {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify site exists and is published
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, published")
      .eq("id", site_id)
      .single();

    if (siteError || !site) {
      console.error("Site not found:", site_id);
      return new Response(
        JSON.stringify({ error: "Invalid site" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert lead
    const { data, error } = await supabase
      .from("leads")
      .insert({
        site_id,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        message: message?.trim() || null,
        source: source || "quote_form",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert lead:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Lead submitted successfully: ${data.id} from IP ${clientIP}`);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateCheck.remaining)
        } 
      }
    );
  } catch (error) {
    console.error("Submit lead error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
