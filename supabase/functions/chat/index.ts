import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a friendly assistant helping a roofing contractor set up their website. Your job is to gather information through a natural conversation.

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
- Don't be robotic or use bullet points

After gathering enough info (at least company name, services, and what makes them different), output a JSON block wrapped in <site_config> tags with the extracted data. Example:

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
  ]
}
</site_config>

Only output the <site_config> block when you have gathered enough information and are wrapping up the conversation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

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
          ...messages,
        ],
        stream: true,
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
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
