import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type Stripe from "stripe";

export const runtime = "nodejs";

const TIER_TASK_LIMITS: Record<string, number> = {
  starter: 30,
  professional: 100,
  agency: -1,     // unlimited
  enterprise: -1,
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature failed";
    return Response.json({ error: msg }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      // ─── Subscription created (trial starts) ───────────────────────────
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, sub, "trialing");
        break;
      }

      // ─── Subscription updated (trial → active, plan change, etc.) ──────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, sub, sub.status as string);
        break;
      }

      // ─── Subscription cancelled/deleted ────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await supabase.from("users").update({
            subscription_status: "canceled",
          }).eq("id", userId);
        }
        break;
      }

      // ─── Payment succeeded — reset monthly task count ──────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

        if (!customerId) break;

        const userResult = await supabase
          .from("users")
          .select("id, subscription_tier")
          .eq("stripe_customer_id", customerId)
          .single();

        const user = userResult.data as { id: string; subscription_tier: string } | null;
        if (!user) break;

        // Only reset on recurring subscription payments (not one-time top-ups)
        if (invoice.billing_reason === "subscription_cycle") {
          const month = new Date().toISOString().slice(0, 7);
          const limit = TIER_TASK_LIMITS[user.subscription_tier] ?? 30;

          await supabase.from("task_usage").upsert({
            user_id: user.id,
            month,
            tasks_used: 0,
            tasks_limit: limit === -1 ? 9999 : limit,
            reset_date: new Date(new Date().setDate(1) + 32 * 86400000).toISOString().slice(0, 10),
          }, { onConflict: "user_id,month" });

          await supabase.from("users").update({
            subscription_status: "active",
          }).eq("id", user.id);
        }

        // Handle top-up credit purchase
        if (invoice.metadata?.type === "topup") {
          await handleTopUpCredit(supabase, user.id);
        }
        break;
      }

      // ─── Payment failed — start dunning flow ───────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

        if (!customerId) break;

        const userResult = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        const userId = (userResult.data as { id: string } | null)?.id;
        if (!userId) break;

        await supabase.from("users").update({
          subscription_status: "past_due",
        }).eq("id", userId);

        // Dunning schedule is handled by Stripe's built-in retry logic
        // (configured in Stripe Dashboard: Settings > Billing > Subscriptions > Smart Retries)
        break;
      }

      // ─── Trial will end soon (3 days before) ───────────────────────────
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          // Resend welcome email Day 6 is triggered here in Week 9-10
          console.log(`Trial ending soon for user ${userId}`);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleSubscriptionUpdate(
  supabase: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
  status: string
) {
  const userId = sub.metadata?.supabase_user_id;
  const plan = (sub.metadata?.plan as string) ?? "starter";

  if (!userId) return;

  const normalizedStatus = normalizeStatus(status);
  const limit = TIER_TASK_LIMITS[plan] ?? 30;

  await supabase.from("users").update({
    subscription_tier: plan,
    subscription_status: normalizedStatus,
    stripe_subscription_id: sub.id,
    trial_ends_at: sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null,
  }).eq("id", userId);

  // Ensure task_usage row exists for current month
  const month = new Date().toISOString().slice(0, 7);
  await supabase.from("task_usage").upsert({
    user_id: userId,
    month,
    tasks_limit: limit === -1 ? 9999 : limit,
    reset_date: new Date(new Date().setDate(1) + 32 * 86400000).toISOString().slice(0, 10),
  }, { onConflict: "user_id,month" });
}

async function handleTopUpCredit(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
) {
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("add_task_credits", { p_user_id: userId, p_month: month, p_credits: 10 });
}

function normalizeStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "canceled",
    paused: "paused",
  };
  return map[stripeStatus] ?? "active";
}
