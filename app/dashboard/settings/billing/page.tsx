import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BillingPage from "@/components/billing/BillingPage";

// Price IDs are set in env vars after Stripe products are created
function getPriceIds() {
  return {
    starter: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? "",
      annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? "",
    },
    professional: {
      monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID ?? "",
      annual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID ?? "",
    },
    agency: {
      monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID ?? "",
      annual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID ?? "",
    },
  };
}

export default async function BillingSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const month = new Date().toISOString().slice(0, 7);

  const [userResult, usageResult] = await Promise.all([
    supabase
      .from("users")
      .select("subscription_tier, subscription_status, trial_ends_at, stripe_customer_id, referral_code")
      .eq("id", user.id)
      .single(),
    supabase
      .from("task_usage")
      .select("tokens_used, tokens_limit")
      .eq("user_id", user.id)
      .eq("month", month)
      .single(),
  ]);

  const userData = userResult.data as {
    subscription_tier: string;
    subscription_status: string;
    trial_ends_at: string | null;
    stripe_customer_id: string | null;
    referral_code: string | null;
  } | null;

  const usageData = usageResult.data as { tokens_used: number; tokens_limit: number } | null;
  const tier = userData?.subscription_tier ?? "starter";
  const defaultLimit = tier === "professional" ? 2000000 : tier === "agency" ? -1 : 500000;
  const tokensUsed = usageData?.tokens_used ?? 0;
  const tokensLimit = usageData?.tokens_limit ?? defaultLimit;
  const usagePct = tokensLimit === -1 ? 0 : Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));

  return (
    <BillingPage
      currentTier={tier}
      currentStatus={userData?.subscription_status ?? "trialing"}
      trialEndsAt={userData?.trial_ends_at ?? null}
      creditsUsed={usagePct}
      hasStripeCustomer={!!userData?.stripe_customer_id}
      priceIds={getPriceIds()}
      referralCode={userData?.referral_code ?? null}
    />
  );
}
