"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { type TrendDestination } from "@/lib/email/trend-report-email";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function getMondayOf(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export async function generateTrendReport(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const weekOf = getMondayOf(new Date());

  // Check if already generated this week
  const { data: existing } = await supabase
    .from("trend_reports")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_of", weekOf)
    .single();

  if (existing) {
    revalidatePath("/dashboard/trends");
    return;
  }

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name, specialty_destinations, target_clients")
    .eq("user_id", user.id)
    .single();

  const p = profile as {
    business_name: string;
    specialty_destinations: string[] | null;
    target_clients: string | string[] | null;
  } | null;

  const month = new Date().toLocaleDateString("en-US", { month: "long" });
  const specialties = p?.specialty_destinations?.join(", ") || "worldwide destinations";
  const clientTypes = Array.isArray(p?.target_clients)
    ? p.target_clients.join(", ")
    : (p?.target_clients || "general travellers");
  const businessName = p?.business_name ?? "your travel business";

  const prompt = `You are a travel industry expert helping a travel advisor at "${businessName}" stay ahead of trends.

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
    const trends = JSON.parse(jsonStr) as TrendDestination[];

    if (!Array.isArray(trends) || trends.length !== 5) return;

    await supabase.from("trend_reports").insert({
      user_id: user.id,
      week_of: weekOf,
      report_data: trends,
    });

    revalidatePath("/dashboard/trends");
  } catch {
    // silently fail — user can retry
  }
}
