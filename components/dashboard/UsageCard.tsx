import { type TaskUsage } from "@/types/database";
import Link from "next/link";

interface UsageCardProps {
  usage: TaskUsage | null;
  tier: string;
}

export default function UsageCard({ usage, tier }: UsageCardProps) {
  const used = usage?.tasks_used ?? 0;
  const limit = usage?.tasks_limit ?? 30;
  const isUnlimited = tier === "agency" || tier === "enterprise";
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const remaining = limit - used;
  const isLow = !isUnlimited && pct >= 80;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy">Task Usage This Month</h3>
        <span className="text-xs text-gray-500 capitalize">{tier} plan</span>
      </div>

      {isUnlimited ? (
        <p className="text-2xl font-bold text-teal">{used} <span className="text-sm text-gray-400 font-normal">tasks run</span></p>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-navy">{used}</span>
            <span className="text-gray-400 text-sm mb-0.5">/ {limit} tasks</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${isLow ? "bg-orange-400" : "bg-teal"}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className={`text-xs ${isLow ? "text-orange-600" : "text-gray-500"}`}>
            {isLow
              ? `Only ${remaining} tasks remaining — consider upgrading`
              : `${remaining} tasks remaining`}
          </p>
        </>
      )}

      {isLow && !isUnlimited && (
        <Link
          href="/dashboard/settings/billing"
          className="mt-3 inline-block text-xs font-medium text-teal hover:underline"
        >
          Upgrade plan →
        </Link>
      )}
    </div>
  );
}
