"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS } from "@/lib/email/resend";
import { wrapInEmailHtml } from "@/lib/email/follow-up-templates";

interface EmailDraft {
  id: string;
  user_id: string;
  booking_id: string | null;
  sequence_id: string | null;
  draft_type: string;
  client_name: string;
  client_email: string;
  destination: string | null;
  subject: string;
  body: string;
  status: string;
}

// Send an email draft and mark it as sent
export async function approveEmailDraft(id: string, editedBody?: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch draft (RLS ensures ownership)
  const { data: draft } = await supabase
    .from("email_drafts")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  if (!draft) redirect("/dashboard/follow-ups");
  const d = draft as EmailDraft;

  // Get business name for from display + reply-to
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .single();

  const businessName = (profile as { business_name: string } | null)?.business_name ?? "Your Travel Advisor";
  const body = editedBody ?? d.body;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: `${businessName} via TravelBackend <${FROM_ADDRESS}>`,
      replyTo: user.email!,
      to: d.client_email,
      subject: d.subject,
      html: wrapInEmailHtml(body, d.subject, businessName),
    });
  } catch {
    redirect("/dashboard/follow-ups?error=send_failed");
  }

  // Mark draft sent
  await supabase
    .from("email_drafts")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  // Update sequence day status to "sent"
  if (d.sequence_id && d.draft_type.startsWith("follow_up_day")) {
    const dayKey = d.draft_type.replace("follow_up_", "") + "_status"; // e.g. day3_status
    await supabase
      .from("follow_up_sequences")
      .update({ [dayKey]: "sent" })
      .eq("id", d.sequence_id);
  }

  revalidatePath("/dashboard/follow-ups");
}

// Skip a draft without sending
export async function skipEmailDraft(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: draft } = await supabase
    .from("email_drafts")
    .select("sequence_id, draft_type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  await supabase
    .from("email_drafts")
    .update({ status: "skipped" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (draft) {
    const d = draft as { sequence_id: string | null; draft_type: string };
    if (d.sequence_id && d.draft_type.startsWith("follow_up_day")) {
      const dayKey = d.draft_type.replace("follow_up_", "") + "_status";
      await supabase
        .from("follow_up_sequences")
        .update({ [dayKey]: "skipped" })
        .eq("id", d.sequence_id);
    }
  }

  revalidatePath("/dashboard/follow-ups");
}
