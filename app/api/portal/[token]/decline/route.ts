import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const supabase = createClient();

  const { error } = await supabase
    .from("proposals")
    .update({ status: "declined", declined_at: new Date().toISOString() })
    .eq("share_token", params.token);

  if (error) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
