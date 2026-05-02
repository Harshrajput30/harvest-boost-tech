import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const region = body?.region || "India";

    const now = new Date();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an agricultural policy assistant. Today's date is ${currentMonth} ${currentYear}. Generate the most recent government updates, schemes, subsidies, MSP announcements, advisories and notifications affecting farmers and crops. ALL dates MUST be from ${currentYear} (preferably the last 3 months ending in ${currentMonth} ${currentYear}). DO NOT use dates from previous years. Respond ONLY via the provided tool.`,
          },
          {
            role: "user",
            content: `Provide 8 latest government updates for farmers in ${region}, all dated within ${currentYear} (most recent first, ending around ${currentMonth} ${currentYear}). Include subsidies, schemes (PM-KISAN, PMFBY, etc.), MSP changes, weather/pest advisories, and crop-specific notifications relevant to the current Kharif/Rabi season. Use realistic, plausible info reflecting ${currentYear} policies.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_updates",
              description: "Return the list of government updates",
              parameters: {
                type: "object",
                properties: {
                  updates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["Scheme", "Subsidy", "MSP", "Advisory", "Notification", "Insurance"],
                        },
                        summary: { type: "string", description: "2-3 sentence summary" },
                        date: { type: "string", description: "e.g. 'April 2026'" },
                        ministry: { type: "string", description: "Issuing ministry/department" },
                        actionUrl: { type: "string", description: "Official URL if known, else empty" },
                      },
                      required: ["title", "category", "summary", "date", "ministry"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["updates"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_updates" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI failed: ${errorText}`);
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { updates: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in govt-updates:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});