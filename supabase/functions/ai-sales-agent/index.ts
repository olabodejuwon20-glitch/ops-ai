import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, agentType, tone, leadContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      sales: `You are an elite AI Sales Agent for an enterprise SaaS company. Your goal is to qualify leads, understand buying intent, and guide prospects toward conversion.

CAPABILITIES:
- Detect buying intent (high/medium/low) from messages
- Generate personalized, compelling responses
- Recommend next actions (schedule demo, send proposal, follow up)
- Classify leads as hot/warm/cold based on engagement

TONE: ${tone || "professional"}

RULES:
- Always be helpful and never pushy
- Reference the prospect's specific needs
- Include a clear call-to-action in every response
- If the prospect shows high intent, suggest scheduling a demo
- Keep responses concise (2-4 paragraphs max)`,

      support: `You are an AI Support Agent. You help existing customers with product questions, troubleshooting, and feature requests.

TONE: ${tone || "friendly"}

RULES:
- Be empathetic and solution-oriented
- If you can't resolve, escalate to human support
- Provide step-by-step instructions when helpful
- Keep responses clear and actionable`,

      followup: `You are an AI Follow-up Agent. You craft intelligent follow-up messages based on previous conversation context.

TONE: ${tone || "professional"}

RULES:
- Reference the previous conversation naturally
- Add new value in each follow-up (new feature, case study, limited offer)
- Create urgency without being pushy
- Vary the approach across follow-ups (question, value-add, social proof)`,

      analyze: `You are an AI Lead Analyst. Analyze the incoming message and return a structured JSON analysis.

You MUST respond with valid JSON only, no other text. Use this exact structure:
{
  "intent": "buying" | "inquiry" | "support" | "complaint" | "spam",
  "intentScore": 0-100,
  "suggestedTag": "hot" | "warm" | "cold",
  "suggestedStatus": "new" | "contacted" | "qualified",
  "summary": "Brief 1-sentence summary",
  "keyTopics": ["topic1", "topic2"],
  "suggestedResponse": "A personalized response to send",
  "nextAction": "schedule_demo" | "send_proposal" | "follow_up" | "escalate" | "nurture"
}`,
    };

    const agent = agentType || "sales";
    const systemPrompt = systemPrompts[agent] || systemPrompts.sales;

    const contextPrefix = leadContext
      ? `\n\nLEAD CONTEXT:\nName: ${leadContext.name}\nCompany: ${leadContext.company}\nSource: ${leadContext.source}\nPrevious interactions: ${leadContext.history || "None"}\n\n`
      : "";

    const aiMessages = [
      { role: "system", content: systemPrompt + contextPrefix },
      ...(messages || [{ role: "user", content: "Hello" }]),
    ];

    // For analysis, use non-streaming
    if (agent === "analyze") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_lead",
                description: "Analyze lead message and return structured data",
                parameters: {
                  type: "object",
                  properties: {
                    intent: { type: "string", enum: ["buying", "inquiry", "support", "complaint", "spam"] },
                    intentScore: { type: "number" },
                    suggestedTag: { type: "string", enum: ["hot", "warm", "cold"] },
                    suggestedStatus: { type: "string", enum: ["new", "contacted", "qualified"] },
                    summary: { type: "string" },
                    keyTopics: { type: "array", items: { type: "string" } },
                    suggestedResponse: { type: "string" },
                    nextAction: { type: "string", enum: ["schedule_demo", "send_proposal", "follow_up", "escalate", "nurture"] },
                  },
                  required: ["intent", "intentScore", "suggestedTag", "suggestedStatus", "summary", "suggestedResponse", "nextAction"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_lead" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const analysis = toolCall ? JSON.parse(toolCall.function.arguments) : null;

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming for chat responses
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-sales-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
