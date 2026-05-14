"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  proposal_sent: "#93c5fd",
  follow_up: "#fde68a",
  approved: "#c4b5fd",
  confirmed: "#0E7C7B",
  completed: "#6ee7b7",
  cancelled: "#fca5a5",
};

const STATUS_LABELS: Record<string, string> = {
  proposal_sent: "Proposal Sent",
  follow_up: "Following Up",
  approved: "Approved",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface Booking {
  status: string;
  gross_value: number;
  commission_value: number;
}

export default function PipelineChart({ bookings }: { bookings: Booking[] }) {
  // Group by status for bar chart
  const byStatus = Object.entries(STATUS_LABELS).map(([status, label]) => {
    const items = bookings.filter(b => b.status === status);
    return {
      status: label,
      count: items.length,
      value: items.reduce((s, b) => s + Number(b.gross_value), 0),
      color: STATUS_COLORS[status],
    };
  }).filter(s => s.count > 0);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-navy mb-4">Pipeline by stage</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal count */}
        <div>
          <p className="text-xs text-gray-400 mb-3">Number of deals</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byStatus} barSize={28}>
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="count" name="Deals" radius={[4, 4, 0, 0]}>
                {byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline value */}
        <div>
          <p className="text-xs text-gray-400 mb-3">Value by stage (USD)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byStatus} barSize={28}>
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={50}
                tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="value" name="Value (USD)" radius={[4, 4, 0, 0]}>
                {byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
