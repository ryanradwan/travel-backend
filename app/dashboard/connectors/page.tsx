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

  const [connectorsResult, userResult] = await Promise.all([
    supabase
      .from("connectors")
      .select("connector_name, status, connected_at")
      .eq("user_id", user.id),
    supabase
      .from("users")
      .select("subscription_tier")
      .eq("id", user.id)
      .single(),
  ]);

  const tier = (userResult.data as { subscription_tier: string } | null)?.subscription_tier ?? "starter";

  return (
    <ConnectorsPage
      connectors={(connectorsResult.data ?? []) as {
        connector_name: string;
        status: "connected" | "disconnected" | "unhealthy" | "expired";
        connected_at: string | null;
      }[]}
      tier={tier}
      connectedParam={searchParams.connected}
      errorParam={searchParams.error}
    />
  );
}
