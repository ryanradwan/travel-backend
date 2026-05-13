import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referralCode } = await req.json();
  if (!referralCode || typeof referralCode !== "string") {
    return Response.json({ error: "Invalid referral code" }, { status: 400 });
  }

  const service = createServiceClient();

  // Check if user already used a referral
  const existingResult = await service
    .from("referrals")
    .select("id")
    .eq("referred_id", user.id)
    .single();

  if (existingResult.data) {
    return Response.json({ error: "You've already used a referral code." }, { status: 400 });
  }

  // Find the referrer by code
  const referrerResult = await service
    .from("users")
    .select("id")
    .eq("referral_code", referralCode.toUpperCase())
    .single();

  const referrerId = (referrerResult.data as { id: string } | null)?.id;

  if (!referrerId) {
    return Response.json({ error: "Referral code not found." }, { status: 404 });
  }

  if (referrerId === user.id) {
    return Response.json({ error: "You can't use your own referral code." }, { status: 400 });
  }

  // Record the referral
  await service.from("referrals").insert({
    referrer_id: referrerId,
    referred_id: user.id,
    referral_code: referralCode.toUpperCase(),
    status: "pending",
  });

  // Store on the referred user record
  await service
    .from("users")
    .update({ referred_by: referrerId })
    .eq("id", user.id);

  return Response.json({ success: true, message: "Referral applied! You'll get 50% off your first month." });
}
