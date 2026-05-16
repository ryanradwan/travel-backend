import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  FileText, Globe, Package, MessageSquare,
  TrendingUp, CheckCircle2, Plug, Zap, ArrowRight,
  Clock, DollarSign, AlertTriangle
} from "lucide-react";
import RecentTasks from "@/components/dashboard/RecentTasks";
import ConnectorStatus from "@/components/dashboard/ConnectorStatus";
import TravelAdvisoryFeed from "@/components/dashboard/TravelAdvisoryFeed";
import { type Task, type TaskUsage, type Connector } from "@/types/database";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const month = new Date().toISOString().slice(0, 7);

  const [userResult, profileResult, usageResult, tasksResult, connectorsResult, bookingsResult, proposalsResult] =
    await Promise.all([
      supabase.from("users").select("subscription_tier, trial_ends_at").eq("id", user.id).single(),
      supabase.from("business_profiles").select("business_name").eq("user_id", user.id).single(),
      supabase.from("task_usage").select("*").eq("user_id", user.id).eq("month", month).single(),
      supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("connectors").select("*").eq("user_id", user.id),
      supabase.from("bookings").select("id, client_name, destination, gross_value, commission_value, status").eq("user_id", user.id).not("status", "in", '("completed","cancelled")').order("created_at", { ascending: false }).limit(4),
      supabase.from("proposals").select("id, status").eq("user_id", user.id).in("status", ["sent", "viewed"]),
    ]);

  const userData = userResult.data as { subscription_tier: string; trial_ends_at: string | null } | null;
  const profile = profileResult.data as { business_name: string } | null;
  const usage = usageResult.data as TaskUsage | null;
  const tasks = (tasksResult.data ?? []) as Task[];
  const connectors = (connectorsResult.data ?? []) as Connector[];
  const bookings = (bookingsResult.data ?? []) as { id: string; client_name: string; destination: string; gross_value: number; commission_value: number; status: string }[];
  const pendingProposals = (proposalsResult.data ?? []).length;

  const tier = userData?.subscription_tier ?? "starter";
  const businessName = profile?.business_name ?? "your business";
  const firstName = businessName.split(" ")[0];

  const used = usage?.tasks_used ?? 0;
  const limit = usage?.tasks_limit ?? 30;
  const isUnlimited = tier === "agency" || tier === "enterprise";
  const usagePct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isLow = !isUnlimited && usagePct >= 80;

  const connectedCount = connectors.filter(c => c.status === "connected").length;
  const unhealthyCount = connectors.filter(c => c.status === "needs_reconnect" || c.status === "error").length;

  const pipelineValue = bookings.reduce((s, b) => s + Number(b.gross_value), 0);

  // Trial banner
  const trialEndsAt = userData?.trial_ends_at ? new Date(userData.trial_ends_at) : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : null;
  const showTrialBanner = trialDaysLeft !== null && trialDaysLeft <= 3;

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Trial expiry banner */}
      {showTrialBanner && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-700 font-medium">
              Your free trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong>. Add a payment method to keep access.
            </p>
          </div>
          <Link href="/dashboard/settings/billing" className="text-sm font-semibold text-orange-700 hover:text-orange-900 transition-colors flex-shrink-0">
            Upgrade now →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{today}</p>
          <h1 className="text-2xl font-bold text-navy mt-0.5">
            Good {greeting}, {firstName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with {businessName} today.</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-navy/10 text-navy px-3 py-1.5 rounded-full font-semibold capitalize">{tier} plan</span>
          {tier !== "agency" && tier !== "enterprise" && (
            <Link href="/dashboard/settings/billing" className="text-xs bg-teal text-white px-3 py-1.5 rounded-full font-semibold hover:opacity-90 transition-opacity">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap size={16} className={isLow ? "text-orange-500" : "text-teal"} />}
          label="Tasks this month"
          value={isUnlimited ? `${used} used` : `${used} / ${limit}`}
          sub={isUnlimited ? "Unlimited plan" : `${limit - used} remaining`}
          accent={isLow ? "border-orange-300 bg-orange-50" : ""}
          href="/dashboard/tasks"
        >
          {!isUnlimited && (
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${isLow ? "bg-orange-400" : "bg-teal"}`} style={{ width: `${usagePct}%` }} />
            </div>
          )}
        </StatCard>

        <StatCard
          icon={<DollarSign size={16} className="text-blue-500" />}
          label="Active pipeline"
          value={`$${pipelineValue.toLocaleString()}`}
          sub={`${bookings.length} open deal${bookings.length !== 1 ? "s" : ""}`}
          href="/dashboard/pipeline"
        />

        <StatCard
          icon={<Clock size={16} className={pendingProposals > 0 ? "text-purple-500" : "text-gray-400"} />}
          label="Awaiting approval"
          value={pendingProposals.toString()}
          sub={pendingProposals > 0 ? "proposal(s) sent to clients" : "No pending proposals"}
          accent={pendingProposals > 0 ? "border-purple-200 bg-purple-50" : ""}
          href="/dashboard/tasks"
        />

        <StatCard
          icon={<Plug size={16} className={unhealthyCount > 0 ? "text-red-500" : "text-green-500"} />}
          label="Connectors"
          value={`${connectedCount} active`}
          sub={unhealthyCount > 0 ? `${unhealthyCount} need attention` : "All healthy"}
          accent={unhealthyCount > 0 ? "border-red-200 bg-red-50" : ""}
          href="/dashboard/connectors"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Run a workflow</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/workflows/itinerary" icon={<FileText size={20} />} label="Client Itinerary" desc="Turn enquiry into proposal" color="bg-blue-500" />
          <QuickAction href="/dashboard/workflows/research" icon={<Globe size={20} />} label="Destination Report" desc="Full destination research" color="bg-teal" />
          <QuickAction href="/dashboard/workflows/package" icon={<Package size={20} />} label="Tour Package" desc="Build & publish a package" color="bg-purple-500" />
          <QuickAction href="/dashboard/chat" icon={<MessageSquare size={20} />} label="Ask TripDesk" desc="Free travel question" color="bg-orange-500" />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — recent tasks + pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <RecentTasks tasks={tasks} />

          {/* Pipeline snapshot */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-navy">Open Pipeline</h3>
              <Link href="/dashboard/pipeline" className="text-xs text-teal hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-6">
                <TrendingUp size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No open deals yet.</p>
                <Link href="/dashboard/pipeline?add=1" className="text-xs text-teal hover:underline mt-1 inline-block">
                  Add your first booking →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <Link key={b.id} href="/dashboard/pipeline" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy group-hover:text-teal transition-colors truncate">{b.client_name}</p>
                      <p className="text-xs text-gray-400">{b.destination}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold text-navy">${Number(b.gross_value).toLocaleString()}</p>
                      <p className="text-xs text-teal">+${Number(b.commission_value).toLocaleString()} comm.</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — advisories + connectors */}
        <div className="space-y-6">
          <ConnectorStatus connectors={connectors} />
          <Suspense fallback={<AdvisoryFeedSkeleton />}>
            <TravelAdvisoryFeed />
          </Suspense>
        </div>
      </div>

      {/* Onboarding checklist — show if connectors = 0 and tasks = 0 */}
      {connectedCount === 0 && used === 0 && (
        <div className="card border-teal border-2">
          <h3 className="text-sm font-bold text-navy mb-1">Get started in 3 steps</h3>
          <p className="text-xs text-gray-500 mb-4">You&apos;re set up — here&apos;s how to get the most out of TripDesk.</p>
          <div className="space-y-3">
            {[
              { step: 1, label: "Run your first workflow", desc: "Try the Client Itinerary — takes 2 minutes.", href: "/dashboard/workflows/itinerary", done: used > 0 },
              { step: 2, label: "Connect Gmail or Google Drive", desc: "So TripDesk can save and send on your behalf.", href: "/dashboard/connectors", done: connectedCount > 0 },
              { step: 3, label: "Set your brand colours and logo", desc: "For branded PDF proposals and the client portal.", href: "/dashboard/settings/brand", done: false },
            ].map(({ step, label, desc, href, done }) => (
              <Link key={step} href={href} className="flex items-start gap-3 group">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${done ? "bg-green-500 text-white" : "bg-teal text-white"}`}>
                  {done ? <CheckCircle2 size={12} /> : step}
                </div>
                <div>
                  <p className={`text-sm font-medium group-hover:text-teal transition-colors ${done ? "text-gray-400 line-through" : "text-navy"}`}>{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent = "", href, children }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  accent?: string; href: string; children?: React.ReactNode;
}) {
  return (
    <Link href={href} className={`card hover:shadow-card-hover transition-all group block ${accent}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center">
          {icon}
        </div>
        <ArrowRight size={12} className="text-gray-300 group-hover:text-teal transition-colors" />
      </div>
      <p className="text-xl font-bold text-navy">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      {children}
    </Link>
  );
}

function QuickAction({ href, icon, label, desc, color }: {
  href: string; icon: React.ReactNode; label: string; desc: string; color: string;
}) {
  return (
    <Link href={href} className="card hover:shadow-card-hover hover:border-teal transition-all group flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-navy group-hover:text-teal transition-colors">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}

function AdvisoryFeedSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between py-2">
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-8" />
        </div>
      ))}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
