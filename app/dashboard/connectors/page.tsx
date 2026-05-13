import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConnectorsPage from "@/components/connectors/ConnectorsPage";

interface ConnectorsPageProps {
  searchParams: { connected?: string; error?: string };
}

export default async function ConnectorsDashboardPage({ searchParams }: ConnectorsPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: connectors } = await supabase
    .from("connectors")
    .select("connector_name, status, connected_at, last_health_status")
    .eq("user_id", user.id);

  return (
    <ConnectorsPage
      connectors={(connectors ?? []) as {
        connector_name: string;
        status: "connected" | "disconnected" | "unhealthy" | "expired";
        connected_at: string | null;
        last_health_status: boolean | null;
      }[]}
      connectedParam={searchParams.connected}
      errorParam={searchParams.error}
    />
  );
}
