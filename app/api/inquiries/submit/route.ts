import { createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CATEGORY_OPTIONS = "honeymoon, family, adventure, corporate, solo, group, luxury, budget, other";

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, client_name, client_email, client_phone, destination, travel_dates, travelers, budget, inquiry_text } = body;

  if (!token || !client_name || !client_email || !inquiry_text) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up advisor by inquiry token
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("user_id, business_name")
    .eq("inquiry_token", token)
    .single();

  if (!profile) {
    return Response.json({ error: "Invalid form link" }, { status: 404 });
  }

  const p = profile as { user_id: string; business_name: string };

  // Build the full inquiry text including form fields
  const fullText = [
    inquiry_text,
    destination ? `Destination: ${destination}` : null,
    travel_dates ? `Travel dates: ${travel_dates}` : null,
    travelers ? `Number of travelers: ${travelers}` : null,
    budget ? `Budget: ${budget}` : null,
  ].filter(Boolean).join("\n");

  // Insert inquiry record immediately
  const { data: inserted, error: insertErr } = await supabase
    .from("inquiries")
    .insert({
      user_id: p.user_id,
      source: "form",
      client_name,
      client_email,
      client_phone: client_phone || null,
      inquiry_text: fullText,
      destination: destination || null,
      travel_dates: travel_dates || null,
      group_size: travelers || null,
      budget: budget || null,
      status: "new",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    return Response.json({ error: "Failed to save inquiry" }, { status: 500 });
  }

  const inquiryId = (inserted as { id: string }).id;

  // Run AI triage — classify, extract, and draft response
  try {
    const triagePrompt = `You are an AI assistant for a travel advisor at "${p.business_name}".
A client has submitted a travel inquiry. Analyse it and return ONLY a valid JSON object — no markdown, no explanation — with exactly these fields:

{
  "category": one of: ${CATEGORY_OPTIONS},
  "destination": string or null (primary destination extracted from inquiry),
  "travel_dates": string or null (travel dates mentioned),
  "budget": string or null (budget mentioned),
  "group_size": string or null (number of travelers),
  "ai_summary": "2-3 sentence summary of what the client wants and any key details",
  "draft_response": "A warm, professional, personalised response email from the advisor. Address the client by first name. Reference their specific destination, dates, and interests. End with a clear next step (schedule a call or reply with questions). Sign off as ${p.business_name}. 150-200 words."
}

Client name: ${client_name}
Client inquiry:
${fullText}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: triagePrompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const triage = JSON.parse(jsonStr) as {
      category?: string;
      destination?: string;
      travel_dates?: string;
      budget?: string;
      group_size?: string;
      ai_summary?: string;
      draft_response?: string;
    };

    await supabase
      .from("inquiries")
      .update({
        category: triage.category ?? null,
        destination: triage.destination ?? destination ?? null,
        travel_dates: triage.travel_dates ?? travel_dates ?? null,
        budget: triage.budget ?? budget ?? null,
        group_size: triage.group_size ?? travelers ?? null,
        ai_summary: triage.ai_summary ?? null,
        draft_response: triage.draft_response ?? null,
        status: "draft_ready",
      })
      .eq("id", inquiryId);
  } catch {
    // Triage failed — inquiry is still saved as "new"; advisor can retriage manually
  }

  return Response.json({ success: true });
}
