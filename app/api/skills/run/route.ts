import { createClient } from "@/lib/supabase/server";
import { checkTokenQuota, incrementTokenUsage } from "@/lib/agent/tasks";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { getMemoryContext } from "@/lib/agent/memory";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { skillId, inputs } = await req.json() as {
    skillId: string;
    inputs: Record<string, string>;
  };

  // Load skill — verify ownership
  const { data: skillRow } = await supabase
    .from("custom_skills")
    .select("name, prompt_template, inputs, outputs")
    .eq("id", skillId)
    .eq("user_id", user.id)
    .single();

  if (!skillRow) return Response.json({ error: "Skill not found" }, { status: 404 });

  // Check token quota
  const quota = await checkTokenQuota(user.id);
  if (!quota.allowed) {
    const msg = quota.limit === -1
      ? "Your account access has been paused. Please check your billing."
      : "You've used your monthly AI usage. Upgrade to run more skills.";
    return Response.json({ error: msg }, { status: 402 });
  }

  // Fill template — replace {{variable}} with provided values
  let prompt = skillRow.prompt_template as string;
  for (const [key, value] of Object.entries(inputs)) {
    prompt = prompt.replaceAll(`{{${key}}}`, value);
  }

  const [profileResult, memoryContext] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("user_id", user.id).single(),
    getMemoryContext(user.id),
  ]);

  const systemPrompt = buildSystemPrompt(
    profileResult.data as Parameters<typeof buildSystemPrompt>[0],
    memoryContext,
    false
  );

  // Stream the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
          stream: true,
        });

        let totalTokens = 0;

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
          if (event.type === "message_delta" && event.usage) {
            totalTokens = event.usage.output_tokens;
          }
          if (event.type === "message_start" && event.message.usage) {
            totalTokens += event.message.usage.input_tokens;
          }
        }

        await incrementTokenUsage(user.id, totalTokens);

        // Log as a task
        await supabase.from("tasks").insert({
          user_id: user.id,
          task_type: "custom_skill",
          input: `Skill: ${skillRow.name}\nInputs: ${JSON.stringify(inputs)}`,
          status: "completed",
          tokens_used: totalTokens,
          total_steps: 1,
          current_step: 1,
          completed_at: new Date().toISOString(),
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Skill failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
