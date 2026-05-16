import { createServiceClient } from "@/lib/supabase/server";
import {
  buildDay3FollowUp,
  buildDay7FollowUp,
  buildDay14FollowUp,
  type FollowUpContext,
} from "@/lib/email/follow-up-templates";

export const runtime = "nodejs";
export const maxDuration = 30;

// Called daily at 7am UTC by Vercel cron.
// Finds active follow-up sequences where Day 3 / 7 / 14 has elapsed and
// the corresponding draft hasn't been created yet, then generates drafts.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();

  const { data: sequences, error } = await supabase
    .from("follow_up_sequences")
    .select("*, business_profiles(business_name, user_id)")
    .eq("status", "active");

  if (error || !sequences) {
    return Response.json({ error: "Failed to fetch sequences" }, { status: 500 });
  }

  let drafted = 0;

  for (const seq of sequences as FollowUpSequence[]) {
    const sentAt = new Date(seq.proposal_sent_at);
    const daysSince = Math.floor((now.getTime() - sentAt.getTime()) / 86_400_000);

    // Fetch advisor profile once per sequence
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("business_name")
      .eq("user_id", seq.user_id)
      .single();

    const ctx: FollowUpContext = {
      clientFirstName: seq.client_name.split(" ")[0],
      destination: seq.destination,
      businessName: (profile as { business_name: string } | null)?.business_name ?? "Your Travel Advisor",
    };

    const draftsToCreate: { draftType: string; dayKey: string; builder: () => { subject: string; body: string } }[] = [];

    if (daysSince >= 3 && seq.day3_status === "pending") {
      draftsToCreate.push({ draftType: "follow_up_day3", dayKey: "day3_status", builder: () => buildDay3FollowUp(ctx) });
    }
    if (daysSince >= 7 && seq.day7_status === "pending") {
      draftsToCreate.push({ draftType: "follow_up_day7", dayKey: "day7_status", builder: () => buildDay7FollowUp(ctx) });
    }
    if (daysSince >= 14 && seq.day14_status === "pending") {
      draftsToCreate.push({ draftType: "follow_up_day14", dayKey: "day14_status", builder: () => buildDay14FollowUp(ctx) });
    }

    for (const { draftType, dayKey, builder } of draftsToCreate) {
      const { subject, body } = builder();

      const { error: insertErr } = await supabase.from("email_drafts").insert({
        user_id: seq.user_id,
        booking_id: seq.booking_id,
        sequence_id: seq.id,
        draft_type: draftType,
        client_name: seq.client_name,
        client_email: seq.client_email,
        destination: seq.destination,
        subject,
        body,
        status: "pending",
      });

      if (!insertErr) {
        await supabase
          .from("follow_up_sequences")
          .update({ [dayKey]: "drafted" })
          .eq("id", seq.id);
        drafted++;
      }
    }

    // If all three days are done, mark sequence completed
    const updated = { ...seq };
    for (const { dayKey } of draftsToCreate) {
      (updated as Record<string, string>)[dayKey] = "drafted";
    }
    const allDone = ["day3_status", "day7_status", "day14_status"].every(
      (k) => ["sent", "skipped", "drafted"].includes((updated as Record<string, string>)[k])
    );
    if (allDone && daysSince >= 14) {
      await supabase.from("follow_up_sequences").update({ status: "completed" }).eq("id", seq.id);
    }
  }

  return Response.json({ drafted });
}

interface FollowUpSequence {
  id: string;
  user_id: string;
  booking_id: string;
  client_name: string;
  client_email: string;
  destination: string;
  proposal_sent_at: string;
  day3_status: string;
  day7_status: string;
  day14_status: string;
  status: string;
}
