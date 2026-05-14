import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const supabase = createClient();
  const { message } = await req.json().catch(() => ({ message: "" }));

  const { data: proposal, error } = await supabase
    .from("proposals")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      client_message: message || null,
    })
    .eq("share_token", params.token)
    .select("user_id, title, client_name, client_email")
    .single();

  if (error || !proposal) return Response.json({ error: "Not found" }, { status: 404 });

  // Notify the advisor via email if Resend is configured
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (appUrl && process.env.RESEND_API_KEY) {
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("contact_email")
      .eq("user_id", proposal.user_id)
      .single();

    const advisorEmail = (profile as { contact_email: string | null } | null)?.contact_email;
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", proposal.user_id)
      .single();

    const notifyEmail = advisorEmail || (userData as { email: string } | null)?.email;

    if (notifyEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TripDesk <notifications@tripdesk.ai>",
          to: notifyEmail,
          subject: `✅ ${proposal.client_name} approved your proposal`,
          html: `<p><strong>${proposal.client_name}</strong> has approved your proposal: <strong>${proposal.title}</strong>.</p>${message ? `<p>Their message: <em>${message}</em></p>` : ""}<p><a href="${appUrl}/dashboard/pipeline">View in your pipeline →</a></p>`,
        }),
      }).catch(() => {});
    }
  }

  return Response.json({ success: true });
}
