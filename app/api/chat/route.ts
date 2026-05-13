import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { getMemoryContext, extractAndSaveMemories } from "@/lib/agent/memory";
import { requiresComplianceCheck, detectDestination, buildComplianceBlock } from "@/lib/agent/compliance";
import { checkTaskQuota, createTask, completeTask, failTask } from "@/lib/agent/tasks";
import { classifyIntent } from "@/lib/agent/intent";
import { type ChatMessage } from "@/lib/agent/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages: ChatMessage[]; workflow?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, workflow = "general" } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  const userInput = messages[messages.length - 1].content;

  // Classify intent — questions are free, tasks count against the monthly limit
  const intent = classifyIntent(userInput);
  const isBillableTask = intent === "task" || (workflow !== "general");

  // Only check quota for billable tasks
  if (isBillableTask) {
    const quota = await checkTaskQuota(user.id);
    if (!quota.allowed) {
      const msg = quota.limit === -1
        ? "Your account access has been paused. Please check your billing settings."
        : `You've used all ${quota.limit} tasks for this month. Upgrade your plan or add top-up credits to continue.`;
      return Response.json({ error: msg }, { status: 402 });
    }
  }

  // Load business profile and memory context
  const [profileResult, memoryContext] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("user_id", user.id).single(),
    getMemoryContext(user.id),
  ]);

  const profile = profileResult.data as {
    business_name: string;
    business_type: string;
    location: string;
    specialty_destinations: string[];
    target_clients: string | null;
    team_size: number;
    years_in_business: number;
  } | null;

  const needsCompliance = requiresComplianceCheck(userInput);
  const destination = needsCompliance ? detectDestination(userInput) : null;

  // Only create a task record for billable tasks
  let taskId: string | null = null;
  if (isBillableTask) {
    taskId = await createTask(user.id, userInput, workflow);
    if (!taskId) {
      return Response.json({ error: "Failed to start task. Please try again." }, { status: 500 });
    }
  }

  const systemPrompt = buildSystemPrompt(profile, memoryContext, needsCompliance);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        const claudeMessages = messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        const claudeStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: systemPrompt,
          messages: claudeMessages,
        });

        for await (const chunk of claudeStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`));
          }
          if (chunk.type === "message_start" && chunk.message.usage) {
            inputTokens = chunk.message.usage.input_tokens;
          }
          if (chunk.type === "message_delta" && chunk.usage) {
            outputTokens = chunk.usage.output_tokens;
          }
        }

        // Append compliance block on travel-related outputs
        if (needsCompliance && destination) {
          const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          const complianceText = buildComplianceBlock(destination, null, false, today).fullBlock;
          fullResponse += complianceText;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: complianceText })}\n\n`));
        }

        const totalTokens = inputTokens + outputTokens;

        if (isBillableTask && taskId) {
          // Complete task and deduct 1 from monthly usage
          await completeTask(taskId, user.id, fullResponse, totalTokens);
          extractAndSaveMemories(user.id, taskId, userInput, fullResponse).catch(() => {});
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", taskId, isTask: true, tokensUsed: totalTokens })}\n\n`));
        } else {
          // Question — no usage charged, no task record
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", isTask: false })}\n\n`));
        }

      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";

        if (isBillableTask && taskId) {
          await failTask(taskId, errMsg);
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: getFriendlyError(errMsg) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function getFriendlyError(error: string): string {
  if (error.includes("rate_limit") || error.includes("429")) {
    return "TripDesk is busy right now — please try again in a moment.";
  }
  if (error.includes("timeout") || error.includes("ETIMEDOUT")) {
    return "The request took too long. Please try again with a shorter message.";
  }
  if (error.includes("context_length") || error.includes("too long")) {
    return "Your conversation is very long. Start a new chat to continue.";
  }
  if (error.includes("API key") || error.includes("authentication")) {
    return "There's a configuration issue. Please contact support.";
  }
  return "Something went wrong. Your task usage was not charged. Please try again.";
}
