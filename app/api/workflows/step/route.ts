import { createClient } from "@/lib/supabase/server";
import { checkReportQuota, checkItineraryQuota, checkPackageQuota, incrementReportUsage, incrementItineraryUsage, incrementPackageUsage, incrementTokenUsage, createTask, failTask, updateTaskStep } from "@/lib/agent/tasks";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { getMemoryContext, extractAndSaveMemories } from "@/lib/agent/memory";
import { buildComplianceBlock, detectDestination } from "@/lib/agent/compliance";
import { WORKFLOWS, type WorkflowId } from "@/lib/workflows/definitions";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Extracts client name + destination from itinerary input and creates a pipeline entry
async function autoPipelineEntry(userId: string, input: string, taskId: string): Promise<void> {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Extract the client name and destination from this travel request. Return ONLY valid JSON: {"client_name":"Full Name or Unknown","destination":"City/Country"}. If client name is not mentioned use "New Client".\n\nRequest: ${input}`,
      }],
    });
    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const json = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const { client_name, destination } = JSON.parse(json);

    const supabase = createClient();
    await supabase.from("bookings").insert({
      user_id: userId,
      client_name: client_name || "New Client",
      destination: destination || "Unknown",
      gross_value: 0,
      commission_pct: 10,
      status: "proposal_sent",
      task_id: taskId,
      notes: "Auto-created from Client Itinerary workflow — add deal value to track in Revenue.",
    });
  } catch {
    // Silent fail — pipeline entry is a nice-to-have, not critical
  }
}

const STEP_PROMPTS: Record<WorkflowId, Record<number, (input: string, context: string) => string>> = {
  itinerary: {
    1: (input) => `Analyse this client travel request and extract key details. Format as a brief structured summary:\n\n${input}`,
    2: (input) => `Based on this travel request, research the destination thoroughly. Cover: best time to visit, must-see attractions, local transportation, accommodation areas, and any important logistics. Be specific and practical.\n\nRequest: ${input}`,
    3: (input) => `Check visa requirements relevant to this travel request. If the client's nationality isn't specified, assume US passport holder. Provide current visa requirements, application process, costs, and processing time. Always note this must be verified before advising the client.\n\nRequest: ${input}`,
    4: (input) => `Research realistic pricing for this trip. Provide estimated costs for: flights (round trip from major US cities), hotels (budget/mid/luxury per night), main activities and tours, meals per day, and local transportation. Give ranges not single figures.\n\nRequest: ${input}`,
    5: (input, context) => `Build a detailed day-by-day itinerary for this client request. Use the research context below. Make it specific, practical, and client-ready.\n\nRequest: ${input}\n\nResearch context: ${context}`,
    6: (input, context) => `Write a complete, professional travel proposal document for this client. Include: trip overview, day-by-day itinerary, pricing summary, what's included/excluded, next steps, and a professional sign-off.\n\nRequest: ${input}\n\nItinerary: ${context}`,
  },
  research: {
    1: (input) => `Write a comprehensive destination overview for: ${input}. Cover geography, population, capital, official language, currency, time zone, and a brief cultural introduction for travel advisors.`,
    2: (input) => `What is the current US State Department travel advisory level for ${input}? Describe the advisory level, key risks, and recommended precautions. Note the source and that advisors should verify before client communication.`,
    3: (input) => `Describe the best and worst times to visit ${input} month by month. Cover weather, rainfall, temperature, crowd levels, local events, and price seasonality.`,
    4: (input) => `Compile visa requirements for ${input} for: US, UK, Canadian, Australian, and European passport holders. Cover: visa required, how to apply, cost, processing time, and validity.`,
    5: (input) => `Research average travel costs for ${input}. Provide daily budget estimates in USD for: budget, mid-range, and luxury travelers. Break down by accommodation, meals, activities, and local transport.`,
    6: (input) => `Identify the top travel experiences in ${input}. Include: top 5 must-see attractions, 3 hidden gems, best day trips, top adventure activities, best food experiences, and key advisor selling points.`,
    7: (input) => `What major local holidays, festivals, and events happen in ${input} throughout the year? List month by month. Note which are great for travelers and which may cause disruption.`,
    8: (input, context) => `Compile a complete, professional destination reference report for ${input} that a travel advisor can use and share. Use all the research gathered. Format clearly with sections and tables.\n\nResearch gathered:\n${context}`,
  },
  package: {
    1: (input) => `Analyse this tour package concept and create a structured breakdown. Define: package name, duration, destinations, accommodation level, included services, excluded items, group size limits, and recommended selling price.\n\nConcept: ${input}`,
    2: (input) => `Write compelling tour package marketing copy for: ${input}. Include: a punchy headline, 2-3 sentence overview, key highlights, who this is perfect for, and a closing call-to-action.`,
    3: (input, context) => `Create a detailed day-by-day itinerary for this tour package. Include accommodation areas, included meals, tour activities with timings, and optional upgrades.\n\nPackage: ${input}\n\nContext: ${context}`,
    9: (input, context) => `Write a launch email for this tour package. Include: subject line (3 options), preview text, body copy with highlights, a clear CTA, and a P.S. line.\n\nPackage: ${input}\n\nDetails: ${context}`,
    10: (input, context) => `Write 3 social media posts to announce this tour package:\n1. Instagram (with hashtags)\n2. Facebook (more detail)\n3. Twitter/X (short)\n\nPackage: ${input}\n\nDetails: ${context}`,
  },
};

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { workflowId, stepNumber, input, previousOutputs, taskId: existingTaskId } = await req.json();

  const validWorkflows: WorkflowId[] = ["itinerary", "research", "package"];
  if (!validWorkflows.includes(workflowId)) {
    return Response.json({ error: "Invalid workflow" }, { status: 400 });
  }

  const workflow = WORKFLOWS[workflowId as WorkflowId];
  const step = workflow.steps.find((s) => s.number === stepNumber);
  if (!step) return Response.json({ error: "Invalid step" }, { status: 400 });

  // On first step — check quota and create task
  let taskId = existingTaskId;
  if (!existingTaskId) {
    // Each workflow has its own separate quota
    const quotaMap = {
      research: { check: () => checkReportQuota(user.id), label: "destination reports" },
      itinerary: { check: () => checkItineraryQuota(user.id), label: "itineraries" },
      package: { check: () => checkPackageQuota(user.id), label: "tour packages" },
    };
    const quotaEntry = quotaMap[workflowId as keyof typeof quotaMap];
    if (quotaEntry) {
      const quota = await quotaEntry.check();
      if (!quota.allowed) {
        const msg = quota.limit === -1
          ? "Your account access has been paused. Please check your billing settings."
          : `You've used all ${quota.limit} ${quotaEntry.label} this month. Upgrade your plan to run more.`;
        return Response.json({ error: msg }, { status: 402 });
      }
    }
    taskId = await createTask(user.id, input, workflowId, workflow.steps.length);
    if (!taskId) return Response.json({ error: "Failed to start workflow." }, { status: 500 });
  }

  // Skip connector steps if not connected
  if (step.requiresConnector) {
    const { data: connectors } = await supabase
      .from("connectors")
      .select("connector_name")
      .eq("user_id", user.id)
      .eq("status", "connected")
      .eq("connector_name", step.requiresConnector);

    if (!connectors?.length) {
      await updateTaskStep(taskId, step.number, step.name, "completed");
      return Response.json({
        taskId,
        stepOutput: `Skipped — ${step.requiresConnector} not connected.`,
        skipped: true,
      });
    }
  }

  // Run AI step
  const stepPromptFn = STEP_PROMPTS[workflowId as WorkflowId]?.[stepNumber];
  if (!stepPromptFn) {
    await updateTaskStep(taskId, step.number, step.name, "completed");
    return Response.json({ taskId, stepOutput: "Step completed.", skipped: false });
  }

  try {
    await updateTaskStep(taskId, step.number, step.name, "running");

    const [profileResult, memoryContext] = await Promise.all([
      supabase.from("business_profiles").select("*").eq("user_id", user.id).single(),
      getMemoryContext(user.id),
    ]);

    const systemPrompt = buildSystemPrompt(profileResult.data as Parameters<typeof buildSystemPrompt>[0], memoryContext, true);
    const contextFromPrev = Object.entries(previousOutputs ?? {})
      .map(([n, out]) => `Step ${n}: ${String(out).slice(0, 400)}`)
      .join("\n\n");

    const prompt = stepPromptFn(input, contextFromPrev);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const stepTokens = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);
    await incrementTokenUsage(user.id, stepTokens);
    await updateTaskStep(taskId, step.number, step.name, "completed");

    // On last AI step — complete the task
    const isLastStep = stepNumber === workflow.steps[workflow.steps.length - 1].number;
    const isLastAiStep = !workflow.steps.slice(workflow.steps.indexOf(step)).some(
      (s) => s.number > stepNumber && STEP_PROMPTS[workflowId as WorkflowId]?.[s.number]
    );

    if (isLastStep || isLastAiStep) {
      const allOutputs = { ...(previousOutputs ?? {}), [stepNumber]: text };
      let fullOutput = Object.entries(allOutputs)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([n, out]) => {
          const s = workflow.steps.find((st) => st.number === Number(n));
          return s ? `## ${s.name}\n${out}` : String(out);
        })
        .join("\n\n");

      const destination = detectDestination(input);
      if (destination) {
        const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        fullOutput += buildComplianceBlock(destination, null, false, today).fullBlock;
      }

      // Increment the correct quota counter and complete the task
      const supabaseComplete = createClient();
      await supabaseComplete.from("tasks").update({
        status: "completed",
        output: fullOutput,
        tokens_used: 0,
        completed_at: new Date().toISOString(),
      }).eq("id", taskId);

      if (workflowId === "research") {
        await incrementReportUsage(user.id);
      } else if (workflowId === "itinerary") {
        await incrementItineraryUsage(user.id);
        // Auto-create a pipeline entry for this itinerary
        autoPipelineEntry(user.id, input, taskId).catch(() => {});
      } else if (workflowId === "package") {
        await incrementPackageUsage(user.id);
      }
      extractAndSaveMemories(user.id, taskId, input, fullOutput).catch(() => {});
    }

    return Response.json({ taskId, stepOutput: text, skipped: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await failTask(taskId, msg);
    return Response.json({ error: "Step failed. Your task usage was not charged." }, { status: 500 });
  }
}
