import { createClient } from "@/lib/supabase/server";
import { checkTaskQuota } from "@/lib/agent/tasks";
import { executeWorkflow } from "@/lib/workflows/executor";
import { type WorkflowId } from "@/lib/workflows/definitions";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workflowId, input } = await req.json();

  if (!workflowId || !input) {
    return Response.json({ error: "workflowId and input are required" }, { status: 400 });
  }

  const validWorkflows: WorkflowId[] = ["itinerary", "research", "package"];
  if (!validWorkflows.includes(workflowId)) {
    return Response.json({ error: "Invalid workflow" }, { status: 400 });
  }

  // All workflows are billable tasks
  const quota = await checkTaskQuota(user.id);
  if (!quota.allowed) {
    const msg = quota.limit === -1
      ? "Your account access has been paused. Please check your billing settings."
      : `You've used all ${quota.limit} tasks this month. Upgrade your plan or add top-up credits.`;
    return Response.json({ error: msg }, { status: 402 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      await executeWorkflow(
        workflowId as WorkflowId,
        input,
        user.id,
        (event) => send(event)
      );

      controller.close();
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
