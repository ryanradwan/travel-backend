import { createClient } from "@/lib/supabase/server";
import { type AgentMemory } from "@/types/database";

export async function getMemoryContext(userId: string): Promise<string> {
  const supabase = createClient();

  const { data: memories } = await supabase
    .from("agent_memory")
    .select("memory_type, key, value, confidence")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (!memories || memories.length === 0) return "";

  const grouped: Record<string, typeof memories> = {};
  for (const m of memories) {
    if (!grouped[m.memory_type]) grouped[m.memory_type] = [];
    grouped[m.memory_type].push(m);
  }

  const lines: string[] = ["[Agent Memory — what I know about this business:]"];

  if (grouped.preference?.length) {
    lines.push("\nBusiness preferences:");
    grouped.preference.forEach((m) => lines.push(`  - ${m.key}: ${m.value}`));
  }
  if (grouped.client_insight?.length) {
    lines.push("\nClient insights:");
    grouped.client_insight.forEach((m) => lines.push(`  - ${m.key}: ${m.value}`));
  }
  if (grouped.workflow_pattern?.length) {
    lines.push("\nWorkflow patterns:");
    grouped.workflow_pattern.forEach((m) => lines.push(`  - ${m.key}: ${m.value}`));
  }
  if (grouped.destination_knowledge?.length) {
    lines.push("\nDestination knowledge:");
    grouped.destination_knowledge.forEach((m) => lines.push(`  - ${m.key}: ${m.value}`));
  }

  return lines.join("\n");
}

export async function upsertMemory(
  userId: string,
  type: AgentMemory["memory_type"],
  key: string,
  value: string,
  taskId?: string,
  confidence: number = 0.8
): Promise<void> {
  const supabase = createClient();

  await supabase.from("agent_memory").upsert(
    {
      user_id: userId,
      memory_type: type,
      key,
      value,
      confidence,
      source_task_id: taskId ?? null,
    },
    { onConflict: "user_id,memory_type,key" }
  );
}

export async function extractAndSaveMemories(
  userId: string,
  taskId: string,
  taskInput: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _taskOutput: string
): Promise<void> {
  // Lightweight keyword-based memory extraction
  // Full LLM-based extraction is handled in the agent pipeline
  const lower = taskInput.toLowerCase();

  if (lower.includes("prefer") || lower.includes("always") || lower.includes("never")) {
    await upsertMemory(userId, "preference", `task_preference_${taskId.slice(0, 8)}`, taskInput, taskId, 0.7);
  }

  const destinationMatch = taskInput.match(/\b(italy|france|spain|japan|thailand|bali|mexico|greece|portugal|morocco|peru|kenya|australia|new zealand|costa rica|caribbean)\b/gi);
  if (destinationMatch) {
    const uniqueDests = Array.from(new Set(destinationMatch.map((d) => d.toLowerCase())));
    for (const dest of uniqueDests) {
      await upsertMemory(userId, "destination_knowledge", `researched_${dest}`, `User has researched ${dest}`, taskId, 0.9);
    }
  }
}
