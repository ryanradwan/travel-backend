import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { getMemoryContext, extractAndSaveMemories } from "@/lib/agent/memory";
import { requiresComplianceCheck, detectDestination, buildComplianceBlock } from "@/lib/agent/compliance";
import { checkCreditsQuota, incrementCreditsUsage, createTask, failTask } from "@/lib/agent/tasks";
import { classifyIntent } from "@/lib/agent/intent";
import { type ChatMessage } from "@/lib/agent/types";
import { needsWebSearch, searchWeb, buildSearchContext } from "@/lib/tools/web-search";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

interface AttachedFile {
  name: string;
  type: string;
  data: string; // base64
}

// Build a Claude content block from an attached file
function buildFileBlock(file: AttachedFile): Anthropic.ContentBlockParam {
  if (file.type.startsWith("image/")) {
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    return {
      type: "image",
      source: { type: "base64", media_type: mediaType, data: file.data },
    };
  }

  if (file.type === "application/pdf") {
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: file.data },
    } as Anthropic.ContentBlockParam;
  }

  // Plain text / CSV — decode and include as text
  try {
    const decoded = Buffer.from(file.data, "base64").toString("utf-8");
    return { type: "text", text: `[Attached file: ${file.name}]\n\n${decoded}` };
  } catch {
    return { type: "text", text: `[Attached file: ${file.name} — could not read content]` };
  }
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { messages: ChatMessage[]; workflow?: string; files?: AttachedFile[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, workflow = "general", files = [] } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  const userInput = messages[messages.length - 1].content;
  const intent = classifyIntent(userInput);
  const isBillableTask = intent === "task" || workflow !== "general";

  if (isBillableTask) {
    const quota = await checkCreditsQuota(user.id);
    if (!quota.allowed) {
      const msg = quota.limit === -1
        ? "Your account access has been paused. Please check your billing settings."
        : `You've used all ${quota.limit} credits for this month. Upgrade your plan to continue running tasks.`;
      return Response.json({ error: msg }, { status: 402 });
    }
  }

  const [profileResult, memoryContext] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("user_id", user.id).single(),
    getMemoryContext(user.id),
  ]);

  const profile = profileResult.data as {
    business_name: string; business_type: string; location: string;
    specialty_destinations: string[]; target_clients: string | null;
    team_size: number; years_in_business: number;
  } | null;

  const needsCompliance = requiresComplianceCheck(userInput);
  const destination = needsCompliance ? detectDestination(userInput) : null;

  let taskId: string | null = null;
  if (isBillableTask) {
    taskId = await createTask(user.id, userInput, workflow);
    if (!taskId) return Response.json({ error: "Failed to start task. Please try again." }, { status: 500 });
  }

  const baseSystemPrompt = buildSystemPrompt(profile, memoryContext, needsCompliance);
  const encoder = new TextEncoder();

  // Run web search before streaming if the query needs live data
  const shouldSearch = needsWebSearch(userInput);
  let systemPrompt = baseSystemPrompt;

  // Build Claude messages — attach files as content blocks on the final user message
  const claudeMessages: Anthropic.MessageParam[] = messages.map((m, idx) => {
    const isLastUser = m.role === "user" && idx === messages.length - 1;

    if (isLastUser && files.length > 0) {
      const fileBlocks = files.map(buildFileBlock);
      const content: Anthropic.ContentBlockParam[] = [
        ...fileBlocks,
        ...(m.content ? [{ type: "text" as const, text: m.content }] : []),
      ];
      return { role: "user", content };
    }

    return { role: m.role as "user" | "assistant", content: m.content };
  });

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        // Run web search and inject results before Claude responds
        if (shouldSearch) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "searching", query: userInput })}\n\n`));
          const searchResults = await searchWeb(userInput);
          if (searchResults) {
            systemPrompt = baseSystemPrompt + buildSearchContext(userInput, searchResults);
          }
        }

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

        if (needsCompliance && destination) {
          const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          const complianceText = buildComplianceBlock(destination, null, false, today).fullBlock;
          fullResponse += complianceText;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: complianceText })}\n\n`));
        }

        const totalTokens = inputTokens + outputTokens;

        if (isBillableTask && taskId) {
          // Save task output and deduct 1 credit
          const supabase2 = createClient();
          await supabase2.from("tasks").update({
            status: "completed",
            output: fullResponse,
            tokens_used: totalTokens,
            completed_at: new Date().toISOString(),
          }).eq("id", taskId);
          await incrementCreditsUsage(user.id, 1);
          extractAndSaveMemories(user.id, taskId, userInput, fullResponse).catch(() => {});
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", taskId, isTask: true, creditsUsed: 1, tokensUsed: totalTokens })}\n\n`));
        } else {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", isTask: false })}\n\n`));
        }

      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        if (isBillableTask && taskId) await failTask(taskId, errMsg);
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
  if (error.includes("rate_limit") || error.includes("429")) return "TravelBackend is busy right now — please try again in a moment.";
  if (error.includes("timeout") || error.includes("ETIMEDOUT")) return "The request took too long. Please try again with a shorter message.";
  if (error.includes("context_length") || error.includes("too long")) return "Your conversation is very long. Start a new chat to continue.";
  if (error.includes("API key") || error.includes("authentication")) return "There's a configuration issue. Please contact support.";
  return "Something went wrong. Your task usage was not charged. Please try again.";
}
