import { createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { buildTrendReportEmail, type TrendDestination } from "@/lib/email/trend-report-email";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Called every Monday at 7am UTC by Vercel cron
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://travelbackend.com";

  // Monday of the current week
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekOf = monday.toISOString().slice(0, 10);

  // Get all active users with business profiles
  const { data: profiles } = await supabase
    .from("business_profiles")
    .select("user_id, business_name, specialty_destinations, target_clients");

  if (!profiles?.length) return Response.json({ generated: 0 });

  // Get emails for all users
  const userIds = profiles.map((p: { user_id: string }) => p.user_id);
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      if (userIds.includes(u.id) && u.email) emailMap[u.id] = u.email;
    }
  }

  let generated = 0;

  for (const profile of profiles as Profile[]) {
    // Skip if already generated this week
    const { data: existing } = await supabase
      .from("trend_reports")
      .select("id")
      .eq("user_id", profile.user_id)
      .eq("week_of", weekOf)
      .single();

    if (existing) continue;

    const trends = await generateTrends(profile, weekOf);
    if (!trends) continue;

    const { data: inserted } = await supabase
      .from("trend_reports")
      .insert({ user_id: profile.user_id, week_of: weekOf, report_data: trends })
      .select("id")
      .single();

    if (!inserted) continue;
    generated++;

    // Send email
    const userEmail = emailMap[profile.user_id];
    if (userEmail) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from: `TravelBackend <${FROM_EMAIL}>`,
          to: userEmail,
          subject: `Your weekly destination trends — ${new Date(weekOf).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
          html: buildTrendReportEmail(trends, profile.business_name, weekOf, appUrl),
        });
        await supabase.from("trend_reports").update({ email_sent: true }).eq("id", (inserted as { id: string }).id);
      } catch {
        // Email failed — report is still saved, advisor can view in dashboard
      }
    }
  }

  return Response.json({ generated, weekOf });
}

async function generateTrends(profile: Profile, weekOf: string): Promise<TrendDestination[] | null> {
  const month = new Date(weekOf).toLocaleDateString("en-US", { month: "long" });
  const specialties = profile.specialty_destinations?.join(", ") || "worldwide destinations";
  const clientTypes = profile.target_clients?.join(", ") || "general travellers";

  const prompt = `You are a travel industry expert helping a travel advisor at "${profile.business_name}" stay ahead of trends.

Generate a weekly destination trend report for ${month}. This advisor specialises in: ${specialties}. Their typical clients are: ${clientTypes}.

Return ONLY a valid JSON array of exactly 5 destination objects. No markdown, no explanation. Each object must have exactly these fields:
{
  "destination": "City or Country name",
  "region": "Geographic region (e.g. Southeast Asia, Mediterranean, East Africa)",
  "why_trending": "2-3 sentences explaining why this destination is gaining momentum right now — seasonality, events, media coverage, value, new routes, etc.",
  "sell_angle": "2-3 sentences on exactly how to position and pitch this to clients. Be specific and actionable.",
  "ideal_for": "Client type this suits best (e.g. Honeymoon couples, Family groups, Solo adventurers)",
  "avg_trip_length": "Typical trip duration (e.g. 7-10 days)",
  "best_season": "Best time to visit relative to now"
}

Mix the 5 destinations across different regions and travel styles. At least 2 should be relevant to the advisor's specialties. Include one underrated/emerging destination that clients would not expect.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr) as TrendDestination[];
    return Array.isArray(parsed) && parsed.length === 5 ? parsed : null;
  } catch {
    return null;
  }
}

interface Profile {
  user_id: string;
  business_name: string;
  specialty_destinations: string[] | null;
  target_clients: string[] | null;
}
