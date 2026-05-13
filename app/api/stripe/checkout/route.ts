import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createTopUpSession } from "@/lib/stripe/subscriptions";
import { type PlanKey } from "@/lib/stripe/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, plan, billing, priceId } = body;

  const profileResult = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .single();

  const businessName = (profileResult.data as { business_name: string } | null)?.business_name;

  try {
    if (type === "topup") {
      const url = await createTopUpSession(user.id, user.email!, priceId);
      return Response.json({ url });
    }

    const url = await createCheckoutSession(
      user.id,
      user.email!,
      plan as PlanKey,
      billing,
      priceId,
      businessName
    );

    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create checkout session";
    return Response.json({ error: msg }, { status: 500 });
  }
}
