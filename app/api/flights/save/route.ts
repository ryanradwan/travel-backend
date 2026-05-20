import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, flightSummary, searchParams } = await req.json();
  if (!clientId || !flightSummary) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify client belongs to this user
  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single();

  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const route = `${searchParams.origin} → ${searchParams.destination}`;
  const dates = searchParams.returnDate
    ? `${searchParams.departureDate} – ${searchParams.returnDate}`
    : searchParams.departureDate;

  const taskOutput = `## Flight Quote — ${route}\n**Client:** ${client.name}\n**Dates:** ${dates}\n**Passengers:** ${searchParams.adults} · **Cabin:** ${searchParams.cabin}\n\n${flightSummary}`;

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    client_id: clientId,
    task_type: "flight_quote",
    input: `Flight search: ${route} on ${dates} for ${searchParams.adults} pax`,
    output: taskOutput,
    status: "completed",
    total_steps: 1,
    current_step: 1,
    tokens_used: 0,
    completed_at: new Date().toISOString(),
  });

  if (error) return Response.json({ error: "Failed to save" }, { status: 500 });

  return Response.json({ success: true, clientName: client.name });
}
