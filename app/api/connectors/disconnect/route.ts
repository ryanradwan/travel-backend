import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { connectorId } = await req.json();

  await supabase.from("connectors").update({
    status: "disconnected",
    access_token_encrypted: null,
    refresh_token_encrypted: null,
    token_expires_at: null,
    connected_at: null,
  }).eq("user_id", user.id).eq("connector_name", connectorId);

  return Response.json({ success: true });
}
