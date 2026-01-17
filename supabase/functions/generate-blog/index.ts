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
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

// Rate limit: 3 blog generations per hour per user
const BLOG_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
};

const systemPrompt = `You are an expert SEO content writer specializing in the roofing industry. Your job is to write engaging, informative blog posts that help roofing contractors attract local customers.

WRITING GUIDELINES:
- Write 600-900 words
- Use proper markdown formatting with headings (##, ###)
- Include an engaging introduction that hooks the reader
- Break content into scannable sections with subheadings
- Include actionable tips and advice
- End with a call-to-action mentioning the company
- Write in a professional but approachable tone
- Include relevant local keywords naturally
- Focus on providing genuine value to homeowners

STRUCTURE:
1. Compelling introduction (2-3 sentences)
2. Main content with 3-4 subheadings
3. Practical tips or actionable advice
4. Conclusion with soft call-to-action

DO NOT:
- Use excessive exclamation marks
- Be overly salesy or promotional
- Use clichés like "look no further"
- Include placeholder text or [brackets]

When suggesting topics, consider:
- Current season and weather patterns
- Common roofing issues in the area
- Local building codes and regulations
- Energy efficiency trends
- Storm and weather preparedness`;

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract user ID from auth token for rate limiting
    const authHeader = req.headers.get("authorization");
    let userId = "anonymous";
    
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) {
        console.log("Auth extraction failed, using anonymous rate limit");
      }
    }

    // Rate limiting by user ID (only for generate_post action)
    const body = await req.json();
    const { action, businessName, location, serviceAreas, services, existingTopics } = body;

    if (action === "generate_post") {
      const rateLimitKey = `blog:${userId}`;
      const rateCheck = checkRateLimit(rateLimitKey, BLOG_RATE_LIMIT);

      if (!rateCheck.allowed) {
        console.log(`Blog generation rate limit exceeded for user: ${userId}`);
        return new Response(
          JSON.stringify({ 
            error: "Blog generation limit reached. You can generate up to 3 posts per hour.",
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
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Blog generation request:", { action, businessName, location });

    let userPrompt: string;

    if (action === "suggest_topics") {
      // Get current month/season
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const season = getSeason(now.getMonth());

      userPrompt = `Suggest 5 blog post topics for a roofing company with these details:
- Company: ${businessName || "Local Roofing Company"}
- Location: ${location || "the local area"}
- Service Areas: ${serviceAreas?.join(", ") || "local communities"}
- Services: ${services?.join(", ") || "roof repairs, installations, inspections"}
- Current Month: ${month}
- Current Season: ${season}
${existingTopics?.length ? `- Already written about: ${existingTopics.join(", ")}` : ""}

Return a JSON array of 5 topic suggestions. Each should have:
- title: Compelling blog title (include location if relevant)
- description: 1-2 sentence summary
- keywords: Array of 3-5 SEO keywords

Format as valid JSON only, no other text.`;
    } else if (action === "generate_post") {
      const { topic, title, keywords } = await req.json();

      userPrompt = `Write a blog post for ${businessName || "a roofing company"} in ${location || "the local area"}.

Topic: ${topic || title}
Target Keywords: ${keywords?.join(", ") || "roofing, roof repair, local roofer"}
Services Offered: ${services?.join(", ") || "roof repairs, installations, inspections"}
Service Areas: ${serviceAreas?.join(", ") || "local communities"}

Write a complete blog post in markdown format. Include the company name "${businessName}" in the conclusion's call-to-action.

Return valid JSON with:
- title: The blog post title
- content: The full markdown content
- metaDescription: A 150-160 character meta description for SEO
- suggestedSlug: A URL-friendly slug`;
    } else {
      throw new Error("Invalid action. Use 'suggest_topics' or 'generate_post'");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("Error details:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Try to parse as JSON, handle markdown code blocks
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      // Return raw content if not valid JSON
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}
