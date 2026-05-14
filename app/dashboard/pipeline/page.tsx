import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, TrendingUp, DollarSign, CheckCircle2, Clock, X } from "lucide-react";
import { saveBooking, deleteBooking } from "./actions";
import PipelineChart from "@/components/pipeline/PipelineChart";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  proposal_sent: { label: "Proposal Sent", color: "bg-blue-100 text-blue-700" },
  follow_up: { label: "Following Up", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", color: "bg-purple-100 text-purple-700" },
  confirmed: { label: "Confirmed", color: "bg-teal/10 text-teal" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

interface PageProps { searchParams: { add?: string; edit?: string; error?: string } }

export default async function PipelinePage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (bookings ?? []) as {
    id: string; client_name: string; client_email: string | null;
    destination: string; travel_dates: string | null;
    gross_value: number; commission_pct: number; commission_value: number;
    status: string; notes: string | null; created_at: string;
  }[];

  // Metrics
  const active = list.filter(b => !["completed", "cancelled"].includes(b.status));
  const confirmed = list.filter(b => ["confirmed", "completed"].includes(b.status));
  const pipelineValue = active.reduce((s, b) => s + Number(b.gross_value), 0);
  const confirmedRevenue = confirmed.reduce((s, b) => s + Number(b.commission_value), 0);
  const conversionRate = list.length > 0
    ? Math.round((confirmed.length / list.length) * 100)
    : 0;

  const editBooking = searchParams.edit
    ? list.find(b => b.id === searchParams.edit)
    : null;

  const showForm = searchParams.add === "1" || !!editBooking;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">Track proposals, bookings, and revenue</p>
        </div>
        <Link href="/dashboard/pipeline?add=1" className="btn-teal flex items-center gap-2 text-sm px-4 py-2 rounded">
          <Plus size={16} /> Add booking
        </Link>
      </div>

      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Clock size={18} className="text-blue-500" />} label="Active pipeline" value={`$${pipelineValue.toLocaleString()}`} sub={`${active.length} open deals`} color="bg-blue-50" />
        <MetricCard icon={<DollarSign size={18} className="text-teal" />} label="Commission earned" value={`$${confirmedRevenue.toLocaleString()}`} sub="confirmed + completed" color="bg-teal/5" />
        <MetricCard icon={<CheckCircle2 size={18} className="text-green-500" />} label="Conversion rate" value={`${conversionRate}%`} sub={`${confirmed.length} of ${list.length} deals`} color="bg-green-50" />
        <MetricCard icon={<TrendingUp size={18} className="text-purple-500" />} label="Total bookings" value={list.length.toString()} sub="all time" color="bg-purple-50" />
      </div>

      {/* Chart */}
      {list.length > 0 && <PipelineChart bookings={list} />}

      {/* Add/Edit form */}
      {showForm && (
        <div className="card border-teal border-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-navy">{editBooking ? "Edit booking" : "Add booking to pipeline"}</h2>
            <Link href="/dashboard/pipeline" className="text-gray-400 hover:text-navy"><X size={18} /></Link>
          </div>
          <form action={saveBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editBooking && <input type="hidden" name="booking_id" value={editBooking.id} />}
            <div>
              <label className="label">Client name *</label>
              <input name="client_name" defaultValue={editBooking?.client_name} required className="input mt-1" placeholder="Sarah Johnson" />
            </div>
            <div>
              <label className="label">Destination *</label>
              <input name="destination" defaultValue={editBooking?.destination} required className="input mt-1" placeholder="Italy" />
            </div>
            <div>
              <label className="label">Client email</label>
              <input name="client_email" type="email" defaultValue={editBooking?.client_email ?? ""} className="input mt-1" placeholder="sarah@example.com" />
            </div>
            <div>
              <label className="label">Travel dates</label>
              <input name="travel_dates" defaultValue={editBooking?.travel_dates ?? ""} className="input mt-1" placeholder="Oct 12–22, 2026" />
            </div>
            <div>
              <label className="label">Trip value (USD)</label>
              <input name="gross_value" type="number" min="0" step="100" defaultValue={editBooking?.gross_value ?? 0} className="input mt-1" placeholder="8500" />
            </div>
            <div>
              <label className="label">Commission %</label>
              <input name="commission_pct" type="number" min="0" max="100" step="0.5" defaultValue={editBooking?.commission_pct ?? 10} className="input mt-1" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={editBooking?.status ?? "proposal_sent"} className="input mt-1">
                {Object.entries(STATUS_LABELS).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <input name="notes" defaultValue={editBooking?.notes ?? ""} className="input mt-1" placeholder="Any notes..." />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="btn-teal px-5 py-2 rounded text-sm font-medium">
                {editBooking ? "Save changes" : "Add to pipeline"}
              </button>
              <Link href="/dashboard/pipeline" className="px-5 py-2 rounded text-sm font-medium border border-border text-gray-500 hover:text-navy transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Bookings table */}
      {list.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No bookings yet</p>
          <p className="text-gray-400 text-xs mt-1 mb-4">Add your first deal to start tracking your pipeline and revenue.</p>
          <Link href="/dashboard/pipeline?add=1" className="btn-teal text-sm px-4 py-2 rounded inline-block">Add first booking</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Destination</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Dates</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Commission</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((b) => {
                  const st = STATUS_LABELS[b.status] ?? STATUS_LABELS.proposal_sent;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-navy">{b.client_name}</td>
                      <td className="px-4 py-3 text-gray-600">{b.destination}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{b.travel_dates ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-navy">${Number(b.gross_value).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-teal font-medium">${Number(b.commission_value).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/pipeline?edit=${b.id}`} className="text-xs text-gray-400 hover:text-navy transition-colors">Edit</Link>
                          <form action={deleteBooking}>
                            <input type="hidden" name="booking_id" value={b.id} />
                            <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
