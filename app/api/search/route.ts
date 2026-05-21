import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) return Response.json({ clients: [], bookings: [], tasks: [] });

  const pattern = `%${q}%`;

  const [clientsRes, bookingsRes, tasksRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, email, nationality")
      .eq("user_id", user.id)
      .or(`name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(5),

    supabase
      .from("bookings")
      .select("id, client_name, destination, status, gross_value")
      .eq("user_id", user.id)
      .or(`client_name.ilike.${pattern},destination.ilike.${pattern}`)
      .limit(5),

    supabase
      .from("tasks")
      .select("id, input, task_type, status, created_at")
      .eq("user_id", user.id)
      .ilike("input", pattern)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return Response.json({
    clients: clientsRes.data ?? [],
    bookings: bookingsRes.data ?? [],
    tasks: tasksRes.data ?? [],
  });
}
