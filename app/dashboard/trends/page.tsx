import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sparkles, RefreshCw, TrendingUp, Clock } from "lucide-react";
import { generateTrendReport } from "./actions";
import { type TrendDestination } from "@/lib/email/trend-report-email";

export const metadata = { title: "Destination Trends — TravelBackend.com" };

interface TrendReport {
  id: string;
  week_of: string;
  report_data: TrendDestination[];
  email_sent: boolean;
  created_at: string;
}

const REGION_COLORS: Record<string, string> = {
  "Southeast Asia":     "bg-orange-100 text-orange-700",
  "Mediterranean":      "bg-blue-100 text-blue-700",
  "East Africa":        "bg-yellow-100 text-yellow-700",
  "Central America":    "bg-green-100 text-green-700",
  "Middle East":        "bg-amber-100 text-amber-700",
  "South Asia":         "bg-pink-100 text-pink-700",
  "Western Europe":     "bg-indigo-100 text-indigo-700",
  "Eastern Europe":     "bg-purple-100 text-purple-700",
  "North America":      "bg-cyan-100 text-cyan-700",
  "South America":      "bg-lime-100 text-lime-700",
  "Oceania":            "bg-teal-100 text-teal-700",
  "Caribbean":          "bg-sky-100 text-sky-700",
};

function regionColor(region: string) {
  return REGION_COLORS[region] ?? "bg-gray-100 text-gray-600";
}

function weekLabel(weekOf: string) {
  return new Date(weekOf).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function getMondayOf(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export default async function TrendsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("trend_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("week_of", { ascending: false })
    .limit(8);

  const list = (reports ?? []) as TrendReport[];
  const latest = list[0] ?? null;
  const history = list.slice(1);

  const thisWeek = getMondayOf(new Date());
  const hasThisWeek = latest?.week_of === thisWeek;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy">Destination Trends</h1>
          <p className="text-gray-500 text-sm mt-1">
            Weekly AI-generated report — 5 destinations gaining momentum right now
          </p>
        </div>
        {!hasThisWeek && (
          <form action={generateTrendReport}>
            <button
              type="submit"
              className="flex items-center gap-2 bg-teal text-white text-sm font-semibold px-4 py-2.5 rounded hover:bg-teal/90 transition-colors"
            >
              <Sparkles size={15} />
              Generate this week&apos;s report
            </button>
          </form>
        )}
        {hasThisWeek && (
          <div className="flex items-center gap-2 text-xs text-gray-400 border border-border rounded-lg px-3 py-2">
            <RefreshCw size={13} />
            Fresh report arrives Monday
          </div>
        )}
      </div>

      {/* Empty state */}
      {!latest && (
        <div className="card text-center py-16">
          <TrendingUp size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-navy font-semibold text-lg mb-2">No trend report yet</p>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Generate your first report and see 5 destinations that are gaining momentum right now —
            personalised to your business and client types.
          </p>
          <form action={generateTrendReport}>
            <button
              type="submit"
              className="flex items-center gap-2 bg-teal text-white text-sm font-semibold px-5 py-3 rounded hover:bg-teal/90 transition-colors mx-auto"
            >
              <Sparkles size={15} />
              Generate first report
            </button>
          </form>
        </div>
      )}

      {/* Latest report */}
      {latest && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Week of {weekLabel(latest.week_of)}
              {hasThisWeek && (
                <span className="ml-2 bg-teal/10 text-teal text-xs px-2 py-0.5 rounded-full normal-case font-medium">
                  This week
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {latest.report_data.map((trend, i) => (
              <TrendCard key={i} trend={trend} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Previous reports */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} /> Previous Reports
          </h2>
          <div className="card overflow-hidden p-0">
            {history.map((report, i) => (
              <details key={report.id} className={i > 0 ? "border-t border-border" : ""}>
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 list-none">
                  <span className="text-sm font-medium text-navy">Week of {weekLabel(report.week_of)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {report.report_data.map((t) => t.destination).slice(0, 3).join(", ")}
                      {report.report_data.length > 3 ? " +" + (report.report_data.length - 3) + " more" : ""}
                    </span>
                    <span className="text-gray-300 text-xs">▼</span>
                  </div>
                </summary>
                <div className="px-5 pb-5 space-y-4">
                  {report.report_data.map((trend, j) => (
                    <TrendCard key={j} trend={trend} rank={j + 1} compact />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-navy/5 border border-navy/10 rounded-xl p-5">
        <p className="text-sm font-semibold text-navy mb-2">How trend reports work</p>
        <ul className="text-sm text-gray-500 space-y-1.5">
          <li>· Reports are personalised to your specialty destinations and client types from your business profile.</li>
          <li>· A new report is generated and emailed to you every Monday morning.</li>
          <li>· You can also generate a report on demand any time using the button above.</li>
          <li>· Use the &quot;How to sell it&quot; angle directly in client conversations or proposals.</li>
        </ul>
      </div>
    </div>
  );
}

function TrendCard({ trend, rank, compact = false }: { trend: TrendDestination; rank: number; compact?: boolean }) {
  return (
    <div className="card border border-border">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-9 h-9 rounded-full bg-navy flex items-center justify-center">
          <span className="text-white text-sm font-bold">#{rank}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-bold text-navy">{trend.destination}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${regionColor(trend.region)}`}>
              {trend.region}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <span className="font-medium text-gray-700">Why it&apos;s trending: </span>
            {trend.why_trending}
          </p>

          <div className="bg-teal/5 border border-teal/20 rounded-lg px-4 py-3 mb-3">
            <p className="text-xs font-semibold text-teal mb-1">How to sell it</p>
            <p className="text-sm text-gray-600 leading-relaxed">{trend.sell_angle}</p>
          </div>

          {!compact && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Ideal for</p>
                <p className="text-sm font-medium text-navy">{trend.ideal_for}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Trip length</p>
                <p className="text-sm font-medium text-navy">{trend.avg_trip_length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Best season</p>
                <p className="text-sm font-medium text-navy">{trend.best_season}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
