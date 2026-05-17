import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, TrendingUp, CheckCircle2, Percent, Download } from "lucide-react";

export const metadata = { title: "Revenue — TravelBackend.com" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EARNED_STATUSES = ["confirmed", "completed"];

interface Booking {
  id: string;
  client_name: string;
  destination: string;
  gross_value: number;
  commission_pct: number;
  status: string;
  travel_dates: string | null;
  created_at: string;
}

function commission(b: Booking) {
  return (Number(b.gross_value) * Number(b.commission_pct)) / 100;
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const currentYear = new Date().getFullYear();
  const selectedYear = Number(searchParams.year ?? currentYear);
  const yearStart = `${selectedYear}-01-01`;
  const yearEnd = `${selectedYear}-12-31`;

  // Fetch all bookings for the selected year
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, client_name, destination, gross_value, commission_pct, status, travel_dates, created_at")
    .eq("user_id", user.id)
    .gte("created_at", yearStart)
    .lte("created_at", yearEnd + "T23:59:59Z")
    .order("created_at", { ascending: false });

  const all = (bookings ?? []) as Booking[];
  const earned = all.filter((b) => EARNED_STATUSES.includes(b.status));

  // Header metrics
  const ytdGross = earned.reduce((s, b) => s + Number(b.gross_value), 0);
  const ytdCommission = earned.reduce((s, b) => s + commission(b), 0);
  const confirmedCount = earned.length;
  const avgCommissionPct =
    earned.length > 0
      ? Math.round(earned.reduce((s, b) => s + Number(b.commission_pct), 0) / earned.length)
      : 0;

  // Monthly breakdown — all 12 months
  const monthly = MONTHS.map((month, i) => {
    const monthBookings = earned.filter((b) => {
      const d = new Date(b.created_at);
      return d.getMonth() === i;
    });
    return {
      month,
      count: monthBookings.length,
      gross: monthBookings.reduce((s, b) => s + Number(b.gross_value), 0),
      commission: monthBookings.reduce((s, b) => s + commission(b), 0),
    };
  });

  // Top destinations by commission
  const byDest = earned.reduce<Record<string, { count: number; commission: number; gross: number }>>(
    (acc, b) => {
      const key = b.destination;
      if (!acc[key]) acc[key] = { count: 0, commission: 0, gross: 0 };
      acc[key].count++;
      acc[key].commission += commission(b);
      acc[key].gross += Number(b.gross_value);
      return acc;
    },
    {}
  );
  const topDests = Object.entries(byDest)
    .sort((a, b) => b[1].commission - a[1].commission)
    .slice(0, 5);

  // Year options: current year and 2 years back
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Revenue & Commission</h1>
          <p className="text-gray-500 text-sm mt-1">
            Confirmed and completed bookings only · {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {yearOptions.map((y) => (
              <Link
                key={y}
                href={`/dashboard/revenue?year=${y}`}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  y === selectedYear
                    ? "bg-white text-navy shadow-sm"
                    : "text-gray-500 hover:text-navy"
                }`}
              >
                {y}
              </Link>
            ))}
          </div>
          {/* CSV export */}
          <a
            href={`/api/revenue/export?year=${selectedYear}`}
            className="flex items-center gap-2 text-sm font-medium text-navy border border-border px-3 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            Export CSV
          </a>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign size={18} className="text-teal" />}
          label={`${selectedYear} Commission Earned`}
          value={`$${ytdCommission.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          sub="confirmed + completed"
          color="bg-teal/5"
        />
        <MetricCard
          icon={<TrendingUp size={18} className="text-blue-500" />}
          label={`${selectedYear} Gross Revenue`}
          value={`$${ytdGross.toLocaleString()}`}
          sub="trip value booked"
          color="bg-blue-50"
        />
        <MetricCard
          icon={<CheckCircle2 size={18} className="text-green-500" />}
          label="Confirmed Bookings"
          value={confirmedCount.toString()}
          sub={`${selectedYear} total`}
          color="bg-green-50"
        />
        <MetricCard
          icon={<Percent size={18} className="text-purple-500" />}
          label="Avg Commission"
          value={`${avgCommissionPct}%`}
          sub="across all bookings"
          color="bg-purple-50"
        />
      </div>

      {/* Monthly breakdown */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Monthly Breakdown</h2>
        </div>
        {earned.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-400 text-sm">No confirmed or completed bookings in {selectedYear}.</p>
            <p className="text-gray-400 text-xs mt-1">
              Add bookings in the{" "}
              <Link href="/dashboard/pipeline" className="text-teal hover:underline">
                Pipeline
              </Link>{" "}
              and mark them as Confirmed or Completed to track revenue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Month</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Bookings</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Gross Revenue</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Commission Earned</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">% of Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthly.map(({ month, count, gross, commission: comm }) => (
                  <tr key={month} className={`hover:bg-gray-50 ${count === 0 ? "opacity-40" : ""}`}>
                    <td className="px-5 py-3 font-medium text-navy">{month}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{count || "—"}</td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {gross > 0 ? `$${gross.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-teal">
                      {comm > 0 ? `$${comm.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400 text-xs">
                      {ytdCommission > 0 && comm > 0
                        ? `${Math.round((comm / ytdCommission) * 100)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-gray-50 font-semibold">
                  <td className="px-5 py-3 text-navy">Total</td>
                  <td className="px-5 py-3 text-right text-navy">{confirmedCount}</td>
                  <td className="px-5 py-3 text-right text-navy">${ytdGross.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-teal">${ytdCommission.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Top destinations + booking list side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top destinations */}
        <div className="card">
          <h2 className="font-semibold text-navy mb-4">Top Destinations</h2>
          {topDests.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topDests.map(([dest, data], i) => {
                const pct = ytdCommission > 0 ? (data.commission / ytdCommission) * 100 : 0;
                return (
                  <div key={dest}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                        <span className="text-sm font-medium text-navy truncate max-w-[130px]">{dest}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-teal">
                          ${data.commission.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-400">{data.count} booking{data.count !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-teal transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmed bookings list */}
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-navy">Confirmed Bookings</h2>
            <span className="text-xs text-gray-400">{selectedYear}</span>
          </div>
          {earned.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-gray-400 text-sm">No confirmed bookings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Destination</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Gross</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Comm %</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {earned.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-navy">{b.client_name}</td>
                      <td className="px-4 py-3 text-gray-600">{b.destination}</td>
                      <td className="px-4 py-3 text-right text-gray-600">${Number(b.gross_value).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{b.commission_pct}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-teal">
                        ${commission(b).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tax note */}
      <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 flex items-start gap-3">
        <DollarSign size={16} className="text-navy mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-navy">Tax planning</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Commission figures above reflect confirmed and completed bookings only.
            Use <strong>Export CSV</strong> to download a full breakdown for your accountant or for quarterly tax planning.
            Consult a tax professional for advice specific to your business.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon, label, value, sub, color,
}: {
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
