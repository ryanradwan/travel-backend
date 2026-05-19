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

const CREDIT_LIMITS: Record<string, number> = {
  starter: 20,
  professional: 50,
  agency: Infinity,
  enterprise: Infinity,
};

const TOKEN_LIMITS: Record<string, number> = {
  starter: 500000,
  professional: 2000000,
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

export async function checkCreditsQuota(userId: string): Promise<{
  allowed: boolean; used: number; limit: number; tier: string;
}> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  const [userResult, usageResult] = await Promise.all([
    supabase.from("users").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).single(),
    supabase.from("task_usage").select("credits_used, credits_limit").eq("user_id", userId).eq("month", month).single(),
  ]);
  const userData = userResult.data as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
  const usageData = usageResult.data as { credits_used: number; credits_limit: number } | null;
  const tier = userData?.subscription_tier ?? "starter";
  const limit = CREDIT_LIMITS[tier] ?? 20;
  const used = usageData?.credits_used ?? 0;
  if (userData?.subscription_status === "canceled" || userData?.subscription_status === "paused") return { allowed: false, used, limit, tier };
  if (userData?.subscription_status === "trialing" && userData.trial_ends_at && new Date(userData.trial_ends_at) < new Date()) return { allowed: false, used, limit, tier };
  if (limit === Infinity) return { allowed: true, used, limit: -1, tier };
  return { allowed: used < limit, used, limit, tier };
}

export async function incrementCreditsUsage(userId: string, amount: number = 1): Promise<void> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("increment_credits_usage", { p_user_id: userId, p_month: month, p_amount: amount });
}

export async function checkTokenQuota(userId: string): Promise<{
  allowed: boolean; used: number; limit: number; pct: number; tier: string;
}> {
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  const [userResult, usageResult] = await Promise.all([
    supabase.from("users").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).single(),
    supabase.from("task_usage").select("tokens_used, tokens_limit").eq("user_id", userId).eq("month", month).single(),
  ]);
  const userData = userResult.data as { subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null;
  const usageData = usageResult.data as { tokens_used: number; tokens_limit: number } | null;
  const tier = userData?.subscription_tier ?? "starter";
  const limit = TOKEN_LIMITS[tier] ?? 500000;
  const used = usageData?.tokens_used ?? 0;
  if (userData?.subscription_status === "canceled" || userData?.subscription_status === "paused") return { allowed: false, used, limit, pct: 100, tier };
  if (userData?.subscription_status === "trialing" && userData.trial_ends_at && new Date(userData.trial_ends_at) < new Date()) return { allowed: false, used, limit, pct: 100, tier };
  if (limit === Infinity) return { allowed: true, used, limit: -1, pct: 0, tier };
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return { allowed: used < limit, used, limit, pct, tier };
}

export async function incrementTokenUsage(userId: string, tokens: number): Promise<void> {
  if (tokens <= 0) return;
  const supabase = createClient();
  const month = new Date().toISOString().slice(0, 7);
  await supabase.rpc("increment_token_usage", { p_user_id: userId, p_month: month, p_tokens: tokens });
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
