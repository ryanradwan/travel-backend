import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UsageCard from "@/components/dashboard/UsageCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTasks from "@/components/dashboard/RecentTasks";
import ConnectorStatus from "@/components/dashboard/ConnectorStatus";
import { type Task, type TaskUsage, type Connector } from "@/types/database";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const month = new Date().toISOString().slice(0, 7);

  const [
    userResult,
    profileResult,
    usageResult,
    tasksResult,
    connectorsResult,
  ] = await Promise.all([
    supabase.from("users").select("subscription_tier").eq("id", user.id).single(),
    supabase.from("business_profiles").select("business_name").eq("user_id", user.id).single(),
    supabase.from("task_usage").select("*").eq("user_id", user.id).eq("month", month).single(),
    supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("connectors").select("*").eq("user_id", user.id),
  ]);

  const userData = userResult.data as { subscription_tier: string } | null;
  const profile = profileResult.data as { business_name: string } | null;
  const usage = usageResult.data as TaskUsage | null;
  const tasks = (tasksResult.data ?? []) as Task[];
  const connectors = (connectorsResult.data ?? []) as Connector[];

  const tier = userData?.subscription_tier ?? "starter";
  const firstName = profile?.business_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">
          Good {getGreeting()}, {firstName}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          What would you like to get done today?
        </p>
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTasks tasks={tasks} />
        </div>
        <div className="space-y-6">
          <UsageCard usage={usage} tier={tier} />
          <ConnectorStatus connectors={connectors} />
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
