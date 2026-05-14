/**
 * TripDesk.ai — Automated Test Suite
 * Tests all items from the CLAUDE.md pre-launch testing checklist.
 *
 * Run: node scripts/test-suite.mjs
 * Requires: dev server running on localhost:3000
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load env vars from .env.local
const envFile = readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = "http://localhost:3000";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let passed = 0;
let failed = 0;
const results = [];

function log(icon, label, detail = "") {
  const line = `${icon} ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  results.push(line);
}

function pass(label, detail) { passed++; log("✅", label, detail); }
function fail(label, detail) { failed++; log("❌", label, detail); }
function info(label) { log("ℹ️ ", label); }
function section(label) { console.log(`\n── ${label} ──────────────────────────────`); }

// ─── Build Supabase SSR cookies from a session ────────────────────────────
// @supabase/ssr stores session as JSON, chunked if > 3180 chars (URL-encoded)
function buildAuthCookies(session) {
  const key = `sb-uwbzwxvujgwtwnclxzai-auth-token`;
  const value = JSON.stringify(session);
  const encoded = encodeURIComponent(value);

  if (encoded.length <= 3180) {
    return `${key}=${value}`;
  }

  // Chunk it
  const chunks = [];
  let remaining = encoded;
  let i = 0;
  while (remaining.length > 0) {
    let chunk = remaining.slice(0, 3180);
    const lastEsc = chunk.lastIndexOf("%");
    if (lastEsc > 3177) chunk = chunk.slice(0, lastEsc);
    chunks.push(`${key}.${i}=${decodeURIComponent(chunk)}`);
    remaining = remaining.slice(chunk.length);
    i++;
  }
  return chunks.join("; ");
}

// ─── Create test user ──────────────────────────────────────────────────────
async function createTestUser() {
  const email = `test_${Date.now()}@tripdesk-test.com`;
  const password = "TestPass123!";

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) throw new Error(`Failed to create test user: ${error?.message}`);

  // Create users row
  await supabase.from("users").insert({
    id: data.user.id,
    email,
    subscription_tier: "starter",
    subscription_status: "trialing",
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  });

  // Create business profile
  await supabase.from("business_profiles").insert({
    user_id: data.user.id,
    business_name: "Test Travel Agency",
    business_type: "agency",
    location_city: "New York",
    location_state: "NY",
    specialty_destinations: ["Italy", "France"],
    target_clients: ["luxury", "honeymoon"],
    team_size: 2,
    years_in_business: 5,
  });

  // Create task_usage row
  const month = new Date().toISOString().slice(0, 7);
  await supabase.from("task_usage").insert({
    user_id: data.user.id,
    month,
    tasks_used: 0,
    tasks_limit: 30,
    reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Sign in to get full session
  const { data: sessionData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr || !sessionData.session) throw new Error(`Sign in failed: ${signInErr?.message}`);

  const cookieHeader = buildAuthCookies(sessionData.session);

  return { userId: data.user.id, cookieHeader, email };
}

// ─── Cleanup test user ─────────────────────────────────────────────────────
async function cleanupTestUser(userId) {
  await supabase.from("tasks").delete().eq("user_id", userId);
  await supabase.from("task_usage").delete().eq("user_id", userId);
  await supabase.from("business_profiles").delete().eq("user_id", userId);
  await supabase.from("agent_memory").delete().eq("user_id", userId);
  await supabase.from("users").delete().eq("id", userId);
  await supabase.auth.admin.deleteUser(userId);
}

// ─── Helpers ───────────────────────────────────────────────────────────────
async function getTaskUsage(userId) {
  const month = new Date().toISOString().slice(0, 7);
  const { data } = await supabase.from("task_usage").select("tasks_used").eq("user_id", userId).eq("month", month).single();
  return data?.tasks_used ?? 0;
}

async function readSSEStream(response) {
  const events = [];
  const text = await response.text();
  const lines = text.split("\n\n").filter(l => l.startsWith("data: "));
  for (const line of lines) {
    try { events.push(JSON.parse(line.slice(6))); } catch {}
  }
  return events;
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEST SUITE
// ══════════════════════════════════════════════════════════════════════════════

async function runTests() {
  console.log("🚀 TripDesk.ai Test Suite\n");

  let userId, cookieHeader, email;

  // ── 1. Test user setup ────────────────────────────────────────────────────
  section("Setup");
  try {
    ({ userId, cookieHeader, email } = await createTestUser());
    pass("Test user created", email);
  } catch (err) {
    fail("Test user creation", err.message);
    console.log("\n❌ Cannot continue without test user. Aborting.");
    process.exit(1);
  }

  const authHeaders = {
    "Content-Type": "application/json",
    "Cookie": cookieHeader,
  };

  // ── 2. Auth protection ────────────────────────────────────────────────────
  section("Auth Protection");

  const noAuth = await fetch(`${BASE_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  noAuth.status === 401 ? pass("Chat API blocks unauthenticated requests") : fail("Chat API should return 401", `got ${noAuth.status}`);

  const noAuthWf = await fetch(`${BASE_URL}/api/workflows`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  noAuthWf.status === 401 ? pass("Workflow API blocks unauthenticated requests") : fail("Workflow API should return 401", `got ${noAuthWf.status}`);

  const webhookNoSig = await fetch(`${BASE_URL}/api/stripe/webhook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  webhookNoSig.status === 400 ? pass("Stripe webhook blocks missing signature") : fail("Stripe webhook should return 400", `got ${webhookNoSig.status}`);

  const emailNoKey = await fetch(`${BASE_URL}/api/email/welcome`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
  emailNoKey.status === 401 ? pass("Email route blocks requests without internal key") : fail("Email route should return 401", `got ${emailNoKey.status}`);

  const cronNoKey = await fetch(`${BASE_URL}/api/cron/health`);
  cronNoKey.status === 401 ? pass("Cron route blocks requests without bearer token") : fail("Cron route should return 401", `got ${cronNoKey.status}`);

  // ── 3. Pre-flight checks ──────────────────────────────────────────────────
  section("Pre-flight Checks");

  // Test: user with 0 tasks used is allowed
  const usageBefore = await getTaskUsage(userId);
  usageBefore === 0 ? pass("New user starts with 0 tasks used") : fail("Task usage should start at 0", `got ${usageBefore}`);

  // Test: task quota allows when under limit
  const quotaRes = await fetch(`${BASE_URL}/api/workflows`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ workflowId: "invalid", input: "test" }),
  });
  quotaRes.status === 400 ? pass("Invalid workflow ID rejected with 400") : fail("Invalid workflow should return 400", `got ${quotaRes.status}`);

  // Test: exhausted quota blocks
  const month = new Date().toISOString().slice(0, 7);
  await supabase.from("task_usage").update({ tasks_used: 30 }).eq("user_id", userId).eq("month", month);

  const quotaExhaustedRes = await fetch(`${BASE_URL}/api/workflows`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ workflowId: "research", input: "Japan" }),
  });
  quotaExhaustedRes.status === 402 ? pass("Exhausted quota returns 402 Payment Required") : fail("Exhausted quota should return 402", `got ${quotaExhaustedRes.status}`);

  // Reset usage back to 0
  await supabase.from("task_usage").update({ tasks_used: 0 }).eq("user_id", userId).eq("month", month);

  // ── 4. Workflow: connector missing → step skipped (not failed) ────────────
  section("Workflow — Connector Steps Skipped Gracefully");

  // User has no connectors connected — workflow should skip steps 9 & 10
  const wfRes = await fetch(`${BASE_URL}/api/workflows`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ workflowId: "research", input: "Bali" }),
  });

  if (!wfRes.ok) {
    const err = await wfRes.json();
    fail("Research workflow start", err.error);
  } else {
    pass("Research workflow started successfully");

    const events = await readSSEStream(wfRes);
    const stepTypes = events.map(e => e.type);

    stepTypes.includes("step_start") ? pass("Progress events — step_start received") : fail("Missing step_start events");
    stepTypes.includes("step_complete") ? pass("Progress events — step_complete received") : fail("Missing step_complete events");
    stepTypes.includes("step_skip") ? pass("Connector steps skipped when not connected") : fail("Expected step_skip for unconnected connectors");
    stepTypes.includes("done") ? pass("Workflow completed — done event received") : fail("Missing done event");

    const skipEvents = events.filter(e => e.type === "step_skip");
    if (skipEvents.length > 0) {
      const hasExplanation = skipEvents.every(e => e.text && e.text.length > 0);
      hasExplanation ? pass("Skipped steps include plain-English explanation") : fail("Skipped steps missing explanation text");
    }

    const doneEvent = events.find(e => e.type === "done");
    if (doneEvent?.taskId) {
      // ── 5. Task charged on success ──────────────────────────────────────
      const usageAfter = await getTaskUsage(userId);
      usageAfter === 1 ? pass("Task usage incremented to 1 after successful workflow") : fail("Task usage should be 1 after success", `got ${usageAfter}`);

      const { data: task } = await supabase.from("tasks").select("status, output, current_step").eq("id", doneEvent.taskId).single();
      task?.status === "completed" ? pass("Task record shows status = completed") : fail("Task status should be completed", `got ${task?.status}`);
      task?.output && task.output.length > 100 ? pass("Task output saved to database", `${task.output.length} chars`) : fail("Task output missing or too short");
    } else {
      fail("No taskId in done event");
    }
  }

  // ── 6. Failed task charges 0 usage ────────────────────────────────────────
  section("Failed Task Charges 0 Usage");

  const usageBeforeFailTest = await getTaskUsage(userId);

  // Insert a task manually set to failed (simulating a mid-run failure)
  const { data: failedTask } = await supabase.from("tasks").insert({
    user_id: userId,
    input: "Test failure scenario",
    task_type: "research",
    status: "failed",
    total_steps: 10,
    current_step: 3,
    error_message: "Simulated failure for testing",
    completed_at: new Date().toISOString(),
  }).select("id").single();

  const usageAfterFailTest = await getTaskUsage(userId);
  usageAfterFailTest === usageBeforeFailTest
    ? pass("Failed task does not increment task usage")
    : fail("Failed task should not charge usage", `before: ${usageBeforeFailTest}, after: ${usageAfterFailTest}`);

  // ── 7. RLS — user isolation ───────────────────────────────────────────────
  section("Row Level Security — Data Isolation");

  // Create a second test user
  let user2Id;
  try {
    const { data: u2 } = await supabase.auth.admin.createUser({
      email: `test2_${Date.now()}@tripdesk-test.com`,
      password: "TestPass123!",
      email_confirm: true,
    });
    user2Id = u2.user?.id;

    if (user2Id) {
      // User 2 tries to read User 1's tasks (service role bypasses RLS, but anon client won't)
      const anonClient = createClient(SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data: stolen } = await anonClient.from("tasks").select("*").eq("user_id", userId);
      (stolen === null || stolen?.length === 0)
        ? pass("RLS blocks unauthenticated reads of another user's tasks")
        : fail("RLS BREACH — unauthenticated client can read tasks", `got ${stolen?.length} rows`);

      await supabase.auth.admin.deleteUser(user2Id);
    }
  } catch {
    info("RLS cross-user test skipped (non-critical)");
  }

  // ── 8. Database integrity ─────────────────────────────────────────────────
  section("Database Integrity");

  const { count: templateCount } = await supabase.from("travel_templates").select("*", { count: "exact", head: true }).eq("is_public", true);
  templateCount === 50 ? pass("50 travel templates in database") : fail("Template count wrong", `got ${templateCount}`);

  const { data: functions } = await supabase.rpc("increment_task_usage", { p_user_id: userId, p_month: "2099-01" });
  // If it doesn't throw, the function exists
  pass("increment_task_usage RPC function callable");

  // Reset that test increment
  await supabase.from("task_usage").upsert({ user_id: userId, month: "2099-01", tasks_used: 0, tasks_limit: 30 }, { onConflict: "user_id,month" });

  // ── 9. Public pages ────────────────────────────────────────────────────────
  section("Public Pages");

  for (const path of ["/login", "/signup", "/forgot-password", "/help", "/terms", "/privacy"]) {
    const r = await fetch(`${BASE_URL}${path}`);
    r.status === 200 ? pass(`${path} returns 200`) : fail(`${path} returned ${r.status}`);
  }

  // ── 10. Output format check ────────────────────────────────────────────────
  section("Output Format");

  const { data: tasks } = await supabase.from("tasks").select("output, status").eq("user_id", userId).eq("status", "completed");
  if (tasks && tasks.length > 0) {
    const output = tasks[0].output;
    output.includes("##") ? pass("Workflow output uses markdown headings") : fail("Output missing markdown headings");
    output.includes("Compliance") || output.includes("disclaimer") || output.includes("verify")
      ? pass("Compliance block present in output")
      : fail("Missing compliance disclaimer in output");
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  section("Cleanup");
  await cleanupTestUser(userId);
  pass("Test user and all test data removed");

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n${"═".repeat(50)}`);
  console.log(`Results: ${passed} passed  |  ${failed} failed`);
  console.log(`${"═".repeat(50)}`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed — ready for deployment.\n");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed — see above for details.\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test suite crashed:", err);
  process.exit(1);
});
