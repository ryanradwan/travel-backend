"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { getResend, FROM_ADDRESS } from "@/lib/email/resend";

interface Inquiry {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  inquiry_text: string;
  destination: string | null;
  travel_dates: string | null;
  budget: string | null;
  group_size: string | null;
  draft_response: string | null;
}

export async function sendInquiryResponse(id: string, body: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!inquiry) redirect("/dashboard/inbox");
  const inq = inquiry as Inquiry;

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .single();

  const businessName = (profile as { business_name: string } | null)?.business_name ?? "Your Travel Advisor";

  try {
    const resend = getResend();
    await resend.emails.send({
      from: `${businessName} <${FROM_ADDRESS}>`,
      replyTo: user.email!,
      to: inq.client_email,
      subject: `Your travel inquiry${inq.destination ? ` — ${inq.destination}` : ""}`,
      html: buildEmailHtml(body, businessName),
    });
  } catch {
    redirect("/dashboard/inbox?error=send_failed");
  }

  await supabase
    .from("inquiries")
    .update({ status: "responded", responded_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/dashboard/inbox");
}

export async function archiveInquiry(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("inquiries")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/inbox");
}

export async function retriageInquiry(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("inquiry_text, client_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!inquiry) return;
  const inq = inquiry as { inquiry_text: string; client_name: string };

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .single();

  const businessName = (profile as { business_name: string } | null)?.business_name ?? "Travel Advisor";

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are an AI assistant for a travel advisor at "${businessName}".
Return ONLY a valid JSON object with these fields:
{ "category": "honeymoon|family|adventure|corporate|solo|group|luxury|budget|other", "destination": string|null, "travel_dates": string|null, "budget": string|null, "group_size": string|null, "ai_summary": "2-3 sentence summary", "draft_response": "150-200 word personalised response email signed off as ${businessName}" }

Client name: ${inq.client_name}
Inquiry: ${inq.inquiry_text}`,
      }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const triage = JSON.parse(jsonStr);

    await supabase
      .from("inquiries")
      .update({ ...triage, status: "draft_ready" })
      .eq("id", id);
  } catch {
    // silently fail — user can try again
  }

  revalidatePath("/dashboard/inbox");
}

function buildEmailHtml(body: string, businessName: string): string {
  const paragraphs = body
    .split("\n\n")
    .map((p) => `<p style="color:#374151;line-height:1.7;margin:0 0 16px;font-size:15px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#F4F7FA;margin:0;padding:20px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">
  <div style="background:#0B2D56;padding:24px 32px;">
    <p style="color:white;margin:0;font-size:13px;font-weight:600;">${businessName}</p>
  </div>
  <div style="padding:32px;">${paragraphs}</div>
  <div style="background:#F4F7FA;padding:16px 32px;border-top:1px solid #E5E7EB;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;">Sent via <a href="https://travelbackend.com" style="color:#0E7C7B;">TravelBackend.com</a></p>
  </div>
</div></body></html>`;
}
