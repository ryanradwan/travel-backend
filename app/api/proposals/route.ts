import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, clientName, clientEmail, title, content } = await req.json();
  if (!title || !content || !clientName) return Response.json({ error: "title, clientName, and content required" }, { status: 400 });

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      task_id: taskId ?? null,
      client_name: clientName,
      client_email: clientEmail ?? null,
      title,
      content,
      status: "sent",
    })
    .select("id, share_token")
    .single();

  if (error) return Response.json({ error: "Failed to create proposal" }, { status: 500 });

  return Response.json({ success: true, proposalId: data.id, shareToken: data.share_token });
}
