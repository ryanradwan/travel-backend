import { createClient } from "@/lib/supabase/server";
import { CONNECTORS, type ConnectorId } from "@/lib/connectors/registry";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { connectorId } = await req.json();
  const connector = CONNECTORS[connectorId as ConnectorId];
  if (!connector) return Response.json({ error: "Unknown connector" }, { status: 400 });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  if (connector.authType === "oauth2" && connector.oauthProvider === "google") {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return Response.json({
        error: "Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.",
      }, { status: 503 });
    }

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${appUrl}/api/oauth/callback`,
      response_type: "code",
      scope: connector.scopes!.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: JSON.stringify({ connectorId, userId: user.id }),
    });

    return Response.json({ redirectUrl: `${GOOGLE_OAUTH_URL}?${params}` });
  }

  if (connector.authType === "manual") {
    // Mark as connected — manual connectors don't need OAuth
    await supabase.from("connectors").upsert({
      user_id: user.id,
      connector_name: connectorId,
      status: "connected",
      connected_at: new Date().toISOString(),
    }, { onConflict: "user_id,connector_name" });

    return Response.json({ success: true });
  }

  if (connector.authType === "api_key") {
    return Response.json({
      requiresApiKey: true,
      message: `Enter your ${connector.name} API key to connect.`,
    });
  }

  return Response.json({ error: "Unsupported auth type" }, { status: 400 });
}
