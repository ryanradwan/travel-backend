import { getStripe, PLANS, type PlanKey } from "./client";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Create or retrieve a Stripe customer for this user
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  businessName?: string
): Promise<string> {
  const supabase = createServiceClient();

  const userResult = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  const existingId = (userResult.data as { stripe_customer_id: string | null } | null)?.stripe_customer_id;
  if (existingId) return existingId;

  const customer = await getStripe().customers.create({
    email,
    name: businessName,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

// Create a Stripe Checkout session for a new subscription (with 7-day trial)
export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: PlanKey,
  billing: "monthly" | "annual",
  priceId: string,
  businessName?: string,
  referralCode?: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email, businessName);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        supabase_user_id: userId,
        plan,
        billing,
        referral_code: referralCode ?? "",
      },
    },
    success_url: `${appUrl}/dashboard?welcome=1`,
    cancel_url: `${appUrl}/dashboard/settings/billing?canceled=1`,
    allow_promotion_codes: true,
    metadata: { supabase_user_id: userId, plan, billing },
  });

  return session.url!;
}

// Create a Stripe Billing Portal session (manage subscription, cancel, update card)
export async function createBillingPortalSession(userId: string): Promise<string> {
  const supabase = createClient();
  const userResult = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  const customerId = (userResult.data as { stripe_customer_id: string | null } | null)?.stripe_customer_id;
  if (!customerId) throw new Error("No Stripe customer found.");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/settings/billing`,
  });

  return session.url;
}

// Create a one-time top-up checkout session
export async function createTopUpSession(
  userId: string,
  email: string,
  priceId: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?topup=success`,
    cancel_url: `${appUrl}/dashboard/settings/billing`,
    metadata: { supabase_user_id: userId, type: "topup" },
    payment_intent_data: {
      metadata: { supabase_user_id: userId, type: "topup" },
    },
  });

  return session.url!;
}

// Get current subscription details for a user
export async function getSubscriptionDetails(userId: string) {
  const supabase = createClient();
  const result = await supabase
    .from("users")
    .select("subscription_tier, subscription_status, trial_ends_at, stripe_subscription_id")
    .eq("id", userId)
    .single();

  return result.data as {
    subscription_tier: string;
    subscription_status: string;
    trial_ends_at: string | null;
    stripe_subscription_id: string | null;
  } | null;
}

export { PLANS };
