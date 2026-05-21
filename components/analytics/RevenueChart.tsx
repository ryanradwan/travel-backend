"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

interface RevenuePoint {
  month: string;
  commission: number;
}

function formatTick(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `$${v}`;
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0E7C7B" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0E7C7B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTick}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "Commission"]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          cursor={{ stroke: "#e5e7eb" }}
        />
        <Area
          type="monotone"
          dataKey="commission"
          stroke="#0E7C7B"
          strokeWidth={2}
          fill="url(#commGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#0E7C7B" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
