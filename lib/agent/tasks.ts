"use server";

import { createClient } from "@/lib/supabase/server";

const TIER_LIMITS: Record<string, number> = {
  starter: 30,
  professional: 100,
  agency: Infinity,
  enterprise: Infinity,
};

const REPORT_LIMITS: Record<string, number> = {
  starter: 5,
  professional: 15,
  agency: Infinity,
  enterprise: Infinity,
};

const ITINERARY_LIMITS: Record<string, number> = {
  starter: 5,
  professional: 15,
  agency: Infinity,
  enterprise: Infinity,
};

const PACKAGE_LIMITS: Record<string, number> = {
  starter: 5,
  professional: 15,
  agency: Infinity,
  enterprise: Infinity,
};

export async function checkTaskQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  tier: string;
}> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);

  const [userResult, usageResult] = await Promise.all([
    supabase.from("users").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).single(),
    supabase.from("task_usage").select("tasks_used, tasks_limit").eq("user_id", userId).eq("month", month).single(),
  ]);

  const userData = userResult.data as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
  const usageData = usageResult.data as { tasks_used: number; tasks_limit: number } | null;

  const tier = userData?.subscription_tier ?? "starter";
  const limit = TIER_LIMITS[tier] ?? 30;
  const used = usageData?.tasks_used ?? 0;

  // Check if subscription is active
  if (userData?.subscription_status === "canceled" || userData?.subscription_status === "paused") {
    return { allowed: false, used, limit, tier };
  }

  // Trial expired check
  if (userData?.subscription_status === "trialing" && userData.trial_ends_at) {
    if (new Date(userData.trial_ends_at) < new Date()) {
      return { allowed: false, used, limit, tier };
    }
  }

  if (limit === Infinity) return { allowed: true, used, limit: -1, tier };

  return { allowed: used < limit, used, limit, tier };
}

export async function checkReportQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  tier: string;
}> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);

  const [userResult, usageResult] = await Promise.all([
    supabase.from("users").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).single(),
    supabase.from("task_usage").select("reports_used, reports_limit").eq("user_id", userId).eq("month", month).single(),
  ]);

  const userData = userResult.data as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
  const usageData = usageResult.data as { reports_used: number; reports_limit: number } | null;

  const tier = userData?.subscription_tier ?? "starter";
  const limit = REPORT_LIMITS[tier] ?? 5;
  const used = usageData?.reports_used ?? 0;

  if (userData?.subscription_status === "canceled" || userData?.subscription_status === "paused") {
    return { allowed: false, used, limit, tier };
  }

  if (userData?.subscription_status === "trialing" && userData.trial_ends_at) {
    if (new Date(userData.trial_ends_at) < new Date()) {
      return { allowed: false, used, limit, tier };
    }
  }

  if (limit === Infinity) return { allowed: true, used, limit: -1, tier };
  return { allowed: used < limit, used, limit, tier };
}

export async function incrementReportUsage(userId: string): Promise<void> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("increment_report_usage", { p_user_id: userId, p_month: month });
}

export async function checkItineraryQuota(userId: string): Promise<{
  allowed: boolean; used: number; limit: number; tier: string;
}> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  const [userResult, usageResult] = await Promise.all([
    supabase.from("users").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).single(),
    supabase.from("task_usage").select("itineraries_used, itineraries_limit").eq("user_id", userId).eq("month", month).single(),
  ]);
  const userData = userResult.data as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
  const usageData = usageResult.data as { itineraries_used: number; itineraries_limit: number } | null;
  const tier = userData?.subscription_tier ?? "starter";
  const limit = ITINERARY_LIMITS[tier] ?? 10;
  const used = usageData?.itineraries_used ?? 0;
  if (userData?.subscription_status === "canceled" || userData?.subscription_status === "paused") return { allowed: false, used, limit, tier };
  if (userData?.subscription_status === "trialing" && userData.trial_ends_at && new Date(userData.trial_ends_at) < new Date()) return { allowed: false, used, limit, tier };
  if (limit === Infinity) return { allowed: true, used, limit: -1, tier };
  return { allowed: used < limit, used, limit, tier };
}

export async function incrementItineraryUsage(userId: string): Promise<void> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("increment_itinerary_usage", { p_user_id: userId, p_month: month });
}

export async function checkPackageQuota(userId: string): Promise<{
  allowed: boolean; used: number; limit: number; tier: string;
}> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  const [userResult, usageResult] = await Promise.all([
    supabase.from("users").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).single(),
    supabase.from("task_usage").select("packages_used, packages_limit").eq("user_id", userId).eq("month", month).single(),
  ]);
  const userData = userResult.data as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
  const usageData = usageResult.data as { packages_used: number; packages_limit: number } | null;
  const tier = userData?.subscription_tier ?? "starter";
  const limit = PACKAGE_LIMITS[tier] ?? 5;
  const used = usageData?.packages_used ?? 0;
  if (userData?.subscription_status === "canceled" || userData?.subscription_status === "paused") return { allowed: false, used, limit, tier };
  if (userData?.subscription_status === "trialing" && userData.trial_ends_at && new Date(userData.trial_ends_at) < new Date()) return { allowed: false, used, limit, tier };
  if (limit === Infinity) return { allowed: true, used, limit: -1, tier };
  return { allowed: used < limit, used, limit, tier };
}

export async function incrementPackageUsage(userId: string): Promise<void> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("increment_package_usage", { p_user_id: userId, p_month: month });
}

export async function createTask(
  userId: string,
  input: string,
  taskType: string,
  totalSteps: number = 1
): Promise<string | null> {
  const supabase = createClient();

  const result = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      input,
      task_type: taskType,
      status: "running",
      total_steps: totalSteps,
      current_step: 0,
    })
    .select("id")
    .single();

  return (result.data as { id: string } | null)?.id ?? null;
}

export async function completeTask(
  taskId: string,
  userId: string,
  output: string,
  tokensUsed: number,
  appsUsed: string[] = []
): Promise<void> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);

  // Mark task complete
  await supabase.from("tasks").update({
    status: "completed",
    output,
    tokens_used: tokensUsed,
    apps_used: appsUsed,
    completed_at: new Date().toISOString(),
  }).eq("id", taskId);

  // Deduct from usage — only on success
  await supabase.rpc("increment_task_usage", { p_user_id: userId, p_month: month });
}

export async function failTask(
  taskId: string,
  errorMessage: string
): Promise<void> {
  const supabase = createClient();

  await supabase.from("tasks").update({
    status: "failed",
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  }).eq("id", taskId);
  // No usage deducted on failure
}

export async function updateTaskStep(
  taskId: string,
  stepNumber: number,
  stepName: string,
  status: "running" | "completed" | "failed"
): Promise<void> {
  const supabase = createClient();

  await supabase.from("tasks").update({ current_step: stepNumber }).eq("id", taskId);

  if (status === "running") {
    await supabase.from("task_steps").insert({
      task_id: taskId,
      step_number: stepNumber,
      step_name: stepName,
      status: "running",
      started_at: new Date().toISOString(),
    });
  } else {
    await supabase.from("task_steps")
      .update({ status, completed_at: new Date().toISOString() })
      .eq("task_id", taskId)
      .eq("step_number", stepNumber);
  }
}
