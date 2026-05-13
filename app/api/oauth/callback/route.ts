import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code || !stateParam) {
    return NextResponse.redirect(`${appUrl}/dashboard/connectors?error=oauth_failed`);
  }

  let state: { connectorId: string; userId: string };
  try {
    state = JSON.parse(stateParam);
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/connectors?error=invalid_state`);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${appUrl}/dashboard/connectors?error=not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${appUrl}/api/oauth/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/dashboard/connectors?error=token_exchange_failed`);
    }

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Store tokens encrypted (simple base64 for now — use Supabase Vault in production)
    const supabase = createServiceClient();
    await supabase.from("connectors").upsert({
      user_id: state.userId,
      connector_name: state.connectorId,
      status: "connected",
      access_token_encrypted: Buffer.from(tokens.access_token).toString("base64"),
      refresh_token_encrypted: tokens.refresh_token
        ? Buffer.from(tokens.refresh_token).toString("base64")
        : null,
      token_expires_at: expiresAt,
      connected_at: new Date().toISOString(),
      last_health_check: new Date().toISOString(),
      last_health_status: true,
    }, { onConflict: "user_id,connector_name" });

    return NextResponse.redirect(`${appUrl}/dashboard/connectors?connected=${state.connectorId}`);
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/connectors?error=oauth_error`);
  }
}
