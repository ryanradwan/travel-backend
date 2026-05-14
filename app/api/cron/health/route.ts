import { createServiceClient } from "@/lib/supabase/server";
import { checkConnectorHealth } from "@/lib/connectors/health";

export const runtime = "nodejs";
export const maxDuration = 30;

// Called daily at 6am UTC by Vercel cron (vercel.json)
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get all users with active connectors
  const { data: connectorUsers } = await supabase
    .from("connectors")
    .select("user_id")
    .eq("status", "connected");

  if (!connectorUsers) return Response.json({ checked: 0 });

  const uniqueUserIds = Array.from(new Set(connectorUsers.map((c: { user_id: string }) => c.user_id)));

  let checked = 0;
  let unhealthy = 0;

  for (const userId of uniqueUserIds) {
    const results = await checkConnectorHealth(userId);

    for (const result of results) {
      if (!result.healthy) {
        unhealthy++;
        await supabase
          .from("connectors")
          .update({ status: "needs_reconnect" })
          .eq("user_id", userId)
          .eq("connector_name", result.connectorName);
      }
    }

    checked++;
  }

  return Response.json({ checked, unhealthy, timestamp: new Date().toISOString() });
}
