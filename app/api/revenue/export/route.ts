import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

const EARNED_STATUSES = ["confirmed", "completed"];

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const url = new URL(req.url);
  const year = Number(url.searchParams.get("year") ?? new Date().getFullYear());
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31T23:59:59Z`;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("client_name, destination, travel_dates, gross_value, commission_pct, status, created_at")
    .eq("user_id", user.id)
    .in("status", EARNED_STATUSES)
    .gte("created_at", yearStart)
    .lte("created_at", yearEnd)
    .order("created_at", { ascending: true });

  const rows = (bookings ?? []) as {
    client_name: string;
    destination: string;
    travel_dates: string | null;
    gross_value: number;
    commission_pct: number;
    status: string;
    created_at: string;
  }[];

  const lines: string[] = [
    "Date Added,Client,Destination,Travel Dates,Status,Gross Value (USD),Commission %,Commission Earned (USD)",
  ];

  for (const b of rows) {
    const earned = ((Number(b.gross_value) * Number(b.commission_pct)) / 100).toFixed(2);
    const date = new Date(b.created_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
    const cols = [
      date,
      `"${b.client_name.replace(/"/g, '""')}"`,
      `"${b.destination.replace(/"/g, '""')}"`,
      `"${(b.travel_dates ?? "").replace(/"/g, '""')}"`,
      b.status,
      Number(b.gross_value).toFixed(2),
      `${b.commission_pct}%`,
      earned,
    ];
    lines.push(cols.join(","));
  }

  // Totals row
  const totalGross = rows.reduce((s, b) => s + Number(b.gross_value), 0);
  const totalComm = rows.reduce((s, b) => s + (Number(b.gross_value) * Number(b.commission_pct)) / 100, 0);
  lines.push(`,,,,TOTAL,${totalGross.toFixed(2)},,${totalComm.toFixed(2)}`);

  const csv = lines.join("\n");
  const filename = `travelbackend-revenue-${year}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
