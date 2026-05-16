import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TrendingUp, Target, Clock, XCircle } from "lucide-react";
import MonthlyChart from "@/components/analytics/MonthlyChart";

export const metadata = { title: "Analytics — TripDesk.ai" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FUNNEL_STAGES = [
  { key: "proposal_sent", label: "Proposal Sent",  color: "bg-blue-400" },
  { key: "follow_up",     label: "Following Up",   color: "bg-yellow-400" },
  { key: "approved",      label: "Approved",        color: "bg-purple-400" },
  { key: "confirmed",     label: "Confirmed",       color: "bg-teal" },
  { key: "completed",     label: "Completed",       color: "bg-green-400" },
];

interface Booking {
  id: string;
  destination: string;
  status: string;
  gross_value: number;
  commission_pct: number;
  created_at: string;
  confirmed_at: string | null;
}


export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, destination, status, gross_value, commission_pct, created_at, confirmed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const all = (bookings ?? []) as Booking[];
  const won = all.filter((b) => ["confirmed", "completed"].includes(b.status));
  const lost = all.filter((b) => b.status === "cancelled");
  const active = all.filter((b) => !["confirmed", "completed", "cancelled"].includes(b.status));

  // KPI calculations
  const conversionRate = all.length > 0 ? Math.round((won.length / all.length) * 100) : 0;
  const winRate = (won.length + lost.length) > 0
    ? Math.round((won.length / (won.length + lost.length)) * 100)
    : 0;
  const avgDealValue = won.length > 0
    ? Math.round(won.reduce((s, b) => s + Number(b.gross_value), 0) / won.length)
    : 0;

  // Avg days to close (only bookings with confirmed_at)
  const closedWithDate = won.filter((b) => b.confirmed_at);
  const avgDaysToClose = closedWithDate.length > 0
    ? Math.round(
        closedWithDate.reduce((s, b) => {
          const days = (new Date(b.confirmed_at!).getTime() - new Date(b.created_at).getTime()) / 86_400_000;
          return s + Math.max(0, days);
        }, 0) / closedWithDate.length
      )
    : null;

  // Funnel counts
  const funnelData = FUNNEL_STAGES.map(({ key, label, color }) => ({
    key, label, color,
    count: all.filter((b) => b.status === key).length,
  }));
  const funnelMax = all.length || 1;

  // Destination conversion table
  const destMap = all.reduce<Record<string, { total: number; won: number; gross: number }>>((acc, b) => {
    if (!acc[b.destination]) acc[b.destination] = { total: 0, won: 0, gross: 0 };
    acc[b.destination].total++;
    if (["confirmed", "completed"].includes(b.status)) {
      acc[b.destination].won++;
      acc[b.destination].gross += Number(b.gross_value);
    }
    return acc;
  }, {});

  const destinations = Object.entries(destMap)
    .map(([dest, d]) => ({
      dest,
      total: d.total,
      won: d.won,
      rate: d.total > 0 ? Math.round((d.won / d.total) * 100) : 0,
      avgValue: d.won > 0 ? Math.round(d.gross / d.won) : 0,
    }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total);

  // Monthly trend (last 12 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const month = MONTHS[d.getMonth()];
    const year = d.getFullYear();
    const inMonth = (b: Booking) => {
      const bd = new Date(b.created_at);
      return bd.getFullYear() === year && bd.getMonth() === d.getMonth();
    };
    return {
      month: i === 11 ? "Now" : month,
      proposals: all.filter(inMonth).length,
      won: won.filter(inMonth).length,
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Conversion Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          All-time · {all.length} total proposals tracked
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Target size={18} className="text-teal" />}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          sub={`${won.length} of ${all.length} proposals won`}
          color="bg-teal/5"
        />
        <KpiCard
          icon={<TrendingUp size={18} className="text-blue-500" />}
          label="Win Rate"
          value={`${winRate}%`}
          sub="won vs. cancelled deals"
          color="bg-blue-50"
        />
        <KpiCard
          icon={<TrendingUp size={18} className="text-green-500" />}
          label="Avg Confirmed Value"
          value={avgDealValue > 0 ? `$${avgDealValue.toLocaleString()}` : "—"}
          sub="per confirmed booking"
          color="bg-green-50"
        />
        <KpiCard
          icon={<Clock size={18} className="text-purple-500" />}
          label="Avg Days to Close"
          value={avgDaysToClose !== null ? `${avgDaysToClose}d` : "—"}
          sub={avgDaysToClose !== null ? "proposal to confirmation" : "tracked going forward"}
          color="bg-purple-50"
        />
      </div>

      {/* Pipeline funnel + monthly trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Funnel */}
        <div className="card">
          <h2 className="font-semibold text-navy mb-5">Pipeline Funnel</h2>
          {all.length === 0 ? (
            <p className="text-gray-400 text-sm">No bookings yet. Add deals in the Pipeline to start tracking.</p>
          ) : (
            <div className="space-y-3">
              {funnelData.map(({ key, label, color, count }) => {
                const pct = Math.round((count / funnelMax) * 100);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-semibold text-navy">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${color}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-border mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-400 flex items-center gap-1.5">
                    <XCircle size={14} /> Cancelled / Lost
                  </span>
                  <span className="text-sm font-semibold text-red-400">{lost.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                <span>{active.length} still active</span>
                <span>{won.length} confirmed · {lost.length} lost</span>
              </div>
            </div>
          )}
        </div>

        {/* Monthly trend */}
        <div className="card">
          <h2 className="font-semibold text-navy mb-1">Monthly Volume</h2>
          <p className="text-xs text-gray-400 mb-4">Last 12 months — proposals vs. confirmed</p>
          {all.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <>
              <MonthlyChart data={monthlyData} />
              <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Proposals
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-teal inline-block" /> Confirmed
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Destination conversion table */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Conversion by Destination</h2>
          <p className="text-xs text-gray-400 mt-0.5">Which destinations close best</p>
        </div>
        {destinations.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-400 text-sm">No destination data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Destination</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Proposals</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Confirmed</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Close Rate</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Avg Deal Value</th>
                  <th className="px-5 py-3 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {destinations.map(({ dest, total, won: w, rate, avgValue }) => (
                  <tr key={dest} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-navy">{dest}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{total}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{w}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${rate >= 50 ? "text-teal" : rate >= 25 ? "text-yellow-600" : "text-gray-400"}`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {avgValue > 0 ? `$${avgValue.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-teal"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty state tip */}
      {all.length === 0 && (
        <div className="bg-navy/5 border border-navy/10 rounded-xl p-5">
          <p className="text-sm font-semibold text-navy mb-1">How to get started</p>
          <p className="text-sm text-gray-500">
            Add your proposals and bookings in the{" "}
            <a href="/dashboard/pipeline" className="text-teal hover:underline">Pipeline</a>.
            As you move deals through stages, this page will automatically show your conversion rates,
            best-performing destinations, and trends over time.
          </p>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="card">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
