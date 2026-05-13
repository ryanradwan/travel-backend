import { createServiceClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/sequences";

// Called internally after a new user's email is verified
// Triggered by Supabase webhook or post-onboarding redirect
export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

  const supabase = createServiceClient();

  const [userResult, profileResult] = await Promise.all([
    supabase.from("users").select("email").eq("id", userId).single(),
    supabase.from("business_profiles").select("business_name").eq("user_id", userId).single(),
  ]);

  const email = (userResult.data as { email: string } | null)?.email;
  const businessName = (profileResult.data as { business_name: string } | null)?.business_name ?? "your business";

  if (!email) return Response.json({ error: "User not found" }, { status: 404 });

  const firstName = businessName.split(" ")[0];

  try {
    await sendWelcomeEmail({ to: email, firstName, businessName });
    return Response.json({ success: true });
  } catch (err) {
    // Never block user flow if email fails
    console.error("Welcome email failed:", err);
    return Response.json({ success: false, error: "Email send failed" });
  }
}
