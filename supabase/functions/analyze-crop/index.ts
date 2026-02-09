import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VERSION = "2026-02-09-speed-boost";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log(`[analyze-crop] start v=${VERSION} method=${req.method}`);

    const { image } = await req.json();

    if (!image) {
      throw new Error("Image is required");
    }

    const imageStr = String(image);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // NOTE: Google provider often rejects data: URLs for image_url.
    // The browser upload flow produces data:image/...;base64,... so we use an OpenAI vision model for that case.
    const isDataUrl = imageStr.startsWith("data:image/");
    // Use fast models: nano for base64 data URLs, flash-lite for regular URLs
    const model = isDataUrl ? "openai/gpt-5-nano" : "google/gemini-2.5-flash-lite";

    console.log("[analyze-crop] analyzing", {
      v: VERSION,
      model,
      isDataUrl,
      imagePrefix: imageStr.slice(0, 30),
      imageLength: imageStr.length,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an agricultural AI. Analyze crop images concisely. Return: disease name, severity (low/medium/high), symptoms, cause, and treatment. Be brief and practical."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this crop image for any diseases or issues. Provide a detailed diagnosis."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageStr
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      console.error("[analyze-crop] missing analysis in response", {
        v: VERSION,
        model,
        keys: Object.keys(data ?? {}),
      });
      throw new Error("AI returned no analysis");
    }

    console.log("[analyze-crop] analysis complete", { v: VERSION, model });

    return new Response(
      JSON.stringify({ analysis, meta: { version: VERSION, model } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-crop:", { v: VERSION, error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
