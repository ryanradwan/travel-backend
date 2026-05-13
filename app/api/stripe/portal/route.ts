import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe/subscriptions";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await createBillingPortalSession(user.id);
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to open billing portal";
    return Response.json({ error: msg }, { status: 500 });
  }
}
