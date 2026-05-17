import { createServiceClient } from "@/lib/supabase/server";

// Called from webhook when a referred user converts to paid
export async function creditReferrer(referredUserId: string): Promise<void> {
  const supabase = createServiceClient();

  const referralResult = await supabase
    .from("referrals")
    .select("id, referrer_id, credit_applied")
    .eq("referred_id", referredUserId)
    .eq("status", "pending")
    .single();

  const referral = referralResult.data as {
    id: string;
    referrer_id: string;
    credit_applied: boolean;
  } | null;

  if (!referral || referral.credit_applied) return;

  // Add $20 credit as 4 top-up tasks to the referrer
  // (approximates $20 value — exact credit applied via Stripe coupon at next invoice)
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("add_task_credits", {
    p_user_id: referral.referrer_id,
    p_month: month,
    p_credits: 40, // ~$20 worth at $0.50/task
  });

  await supabase
    .from("referrals")
    .update({ status: "credited", credit_applied: true, converted_at: new Date().toISOString() })
    .eq("id", referral.id);
}

// Generate the referral share URL
export function getReferralUrl(referralCode: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://travelbackend.com";
  return `${appUrl}/signup?ref=${referralCode}`;
}
