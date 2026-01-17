import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.30.1";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  Deno.env.get("SITE_URL") || "http://localhost:5173",
  "https://id-preview--f09d1af7-7077-4ab0-88b7-9992a1e45830.lovable.app",
  "https://magic-roof-shine.lovable.app",
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

// Rate limit: 20 messages per minute per user
const CHAT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60 * 1000,
};

const onboardingPrompt = `You are a friendly assistant helping a roofing contractor set up their website. Your job is to gather information through a natural conversation.

CONVERSATION FLOW:
1. First, ask for their company name
2. Ask how long they've been in business
3. Ask what cities/areas they serve
4. Ask what roofing services they offer (repairs, new installs, inspections, storm damage, etc.)
5. Ask what makes their company different from other roofers
6. Ask if they have a contractor's license number to display
7. Ask about certifications or manufacturer partnerships (GAF, Owens Corning, etc.)
8. When done, say something like "Great! I've got everything I need. Check out your preview on the right!"

GUIDELINES:
- Ask ONE question at a time
- Be friendly and casual - these are busy contractors, not tech people
- Use their company name once you know it
- If they give partial answers, ask follow-up questions
- If they want to skip something, that's okay, move on
- Keep responses SHORT - 1-2 sentences max
- Don't be robotic or use bullet points`;

const editPrompt = `You are a friendly assistant helping a roofing contractor edit their existing website. You have access to their current site configuration.

CURRENT SITE CONFIG:
{{CURRENT_CONFIG}}

YOUR ROLE:
- Help them make changes to their existing site
- Understand what they want to change
- Make updates to the config based on their requests
- Confirm changes before finalizing

COMMON EDIT REQUESTS:
- Changing headlines, taglines, or about text
- Adding/removing services
- Updating phone number, email, or address
- Adding/removing service areas
- Updating credentials or certifications
- Changing what makes them different
- Adding/editing testimonials and reviews

TESTIMONIAL HANDLING:
- When users ask to add a review/testimonial, gather: name, star rating (1-5), review text, and optionally location
- Example: "Add a 5-star review from John Smith in Springfield saying 'Excellent work!'" 
  → Creates: { "name": "John Smith", "rating": 5, "text": "Excellent work!", "location": "Springfield" }
- Always include testimonials array in the updated config
- Keep existing testimonials unless user asks to remove them

GUIDELINES:
- Reference their current values when relevant: "Your current tagline is 'X'. What would you like to change it to?"
- Be helpful and proactive - suggest related changes
- Keep responses SHORT - 1-2 sentences max
- Ask clarifying questions if the request is unclear
- When they're done, confirm the changes made

IMPORTANT: After understanding what they want to change, output the COMPLETE updated config (not just changes) in the site_config block.`;

const configOutputInstructions = `

After gathering enough info OR making edits, output a JSON block wrapped in <site_config> tags with the complete config. Also output a <changes> block listing what was added/changed.

Example output for NEW site:
<site_config>
{
  "businessName": "ABC Roofing",
  "tagline": "Quality You Can Trust",
  "phone": "(555) 123-4567",
  "heroHeadline": "Expert Roofing Services in Springfield",
  "heroSubheadline": "Family-owned since 2005, serving Central Illinois with quality craftsmanship",
  "yearEstablished": "2005",
  "services": [
    {"name": "Roof Repairs", "description": "Fast, reliable leak and damage repairs", "icon": "wrench"},
    {"name": "New Installation", "description": "Complete roof replacement with premium materials", "icon": "home"}
  ],
  "serviceAreas": ["Springfield", "Chatham", "Rochester"],
  "about": "We are a family-owned roofing company...",
  "credentials": [
    {"name": "Licensed Contractor", "number": "IL-12345"},
    {"name": "GAF Master Elite"}
  ],
  "testimonials": [
    {"name": "John M.", "rating": 5, "text": "Excellent work on our roof!", "location": "Springfield"}
  ]
}
</site_config>
<changes>
- Set company name to "ABC Roofing"
- Added tagline
- Set phone number
- Added 2 services
- Added 3 service areas
- Added 1 testimonial
</changes>

Example output for adding testimonial:
<site_config>
{...complete updated config including new testimonial in testimonials array...}
</site_config>
<changes>
- Added 5-star review from John Smith: "They did amazing work on our roof!"
</changes>

Only output these blocks when you have made changes or gathered enough information.`;

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

    // Rate limiting by user ID
    const rateLimitKey = `chat:${userId}`;
    const rateCheck = checkRateLimit(rateLimitKey, CHAT_RATE_LIMIT);

    if (!rateCheck.allowed) {
      console.log(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many messages. Please wait a moment and try again.",
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

    const { messages, mode, currentConfig } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log("Processing chat request:", { mode, messageCount: messages.length, userId });

    // Build system prompt based on mode
    let systemPrompt: string;
    if (mode === "edit" && currentConfig) {
      systemPrompt = editPrompt.replace("{{CURRENT_CONFIG}}", JSON.stringify(currentConfig, null, 2)) + configOutputInstructions;
    } else {
      systemPrompt = onboardingPrompt + configOutputInstructions;
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Convert messages to Anthropic format (filter out system messages, they go in system param)
    const anthropicMessages = messages
      .filter((msg: { role: string }) => msg.role !== "system")
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    console.log("Sending request to Anthropic with", anthropicMessages.length, "messages");

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    // Create a readable stream to send SSE events
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              const text = event.delta.text;
              // Format as SSE event compatible with OpenAI format for frontend compatibility
              const sseData = JSON.stringify({
                choices: [{
                  delta: { content: text }
                }]
              });
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            }
          }
          // Send done signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    
    // Handle specific Anthropic errors
    if (error instanceof Error) {
      if (error.message.includes("rate_limit") || error.message.includes("429")) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (error.message.includes("authentication") || error.message.includes("401")) {
        return new Response(
          JSON.stringify({ error: "API authentication failed. Please check your API key." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});