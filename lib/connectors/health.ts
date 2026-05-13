"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface ConnectorHealthResult {
  connectorName: string;
  healthy: boolean;
  reason?: string;
}

// Run health checks every 24 hours — called from a cron job in production
// For now: checks token expiry and basic connectivity
export async function checkConnectorHealth(userId: string): Promise<ConnectorHealthResult[]> {
  const supabase = createServiceClient();

  const { data: connectors } = await supabase
    .from("connectors")
    .select("connector_name, status, token_expires_at, access_token_encrypted")
    .eq("user_id", userId);

  if (!connectors) return [];

  const results: ConnectorHealthResult[] = [];

  for (const connector of connectors as {
    connector_name: string;
    status: string;
    token_expires_at: string | null;
    access_token_encrypted: string | null;
  }[]) {
    let healthy = true;

    // Check token expiry
    if (connector.token_expires_at) {
      const expiresAt = new Date(connector.token_expires_at);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (expiresAt < now) {
        healthy = false;
        // Token expired
      } else if (expiresAt < oneHourFromNow) {
        // Token expires within 1 hour — mark for refresh
      }
    }

    // Check if we have credentials at all
    if (!connector.access_token_encrypted && connector.status === "connected") {
      healthy = false;
    }

    const wasHealthy = connector.status === "connected";
    const statusChanged = wasHealthy !== healthy;

    if (statusChanged) {
      await supabase
        .from("connectors")
        .update({
          status: healthy ? "connected" : "unhealthy",
          last_health_check: new Date().toISOString(),
          last_health_status: healthy,
        })
        .eq("user_id", userId)
        .eq("connector_name", connector.connector_name);
    } else {
      await supabase
        .from("connectors")
        .update({
          last_health_check: new Date().toISOString(),
          last_health_status: healthy,
        })
        .eq("user_id", userId)
        .eq("connector_name", connector.connector_name);
    }

    results.push({ connectorName: connector.connector_name, healthy });
  }

  return results;
}

// Mark a connector as needing reconnection
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function markConnectorUnhealthy(userId: string, connectorName: string, _reason: string) {
  const supabase = createServiceClient();
  await supabase
    .from("connectors")
    .update({ status: "unhealthy", last_health_status: false })
    .eq("user_id", userId)
    .eq("connector_name", connectorName);
}
