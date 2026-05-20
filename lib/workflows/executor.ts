import Anthropic from "@anthropic-ai/sdk";
import { WORKFLOWS, type WorkflowId } from "./definitions";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { getMemoryContext, extractAndSaveMemories } from "@/lib/agent/memory";
import { buildComplianceBlock, detectDestination } from "@/lib/agent/compliance";
import { createTask, completeTask, failTask, updateTaskStep } from "@/lib/agent/tasks";
import { createClient } from "@/lib/supabase/server";
import { searchFlights, formatFlightsForProposal } from "@/lib/amadeus/flights";
import { isAmadeusConfigured } from "@/lib/amadeus/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Extract flight params from free-text input using a lightweight Claude call
async function extractFlightParams(input: string): Promise<{
  origin: string; destination: string; departureDate: string;
  returnDate?: string; adults: number;
} | null> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Extract flight details from this travel request. Today is ${today}. Return ONLY valid JSON with: {"origin":"IATA code of departure airport","destination":"IATA code of arrival airport","departureDate":"YYYY-MM-DD","returnDate":"YYYY-MM-DD or null","adults":number}. If you cannot determine a field, use null. Use the nearest major airport.\n\nRequest: ${input}`,
      }],
    });
    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr);
    if (!parsed.origin || !parsed.destination || !parsed.departureDate) return null;
    return {
      origin: parsed.origin,
      destination: parsed.destination,
      departureDate: parsed.departureDate,
      returnDate: parsed.returnDate ?? undefined,
      adults: parsed.adults ?? 2,
    };
  } catch {
    return null;
  }
}

export interface WorkflowProgressEvent {
  type: "step_start" | "step_complete" | "step_skip" | "output" | "done" | "error";
  step?: number;
  stepName?: string;
  text?: string;
  error?: string;
  taskId?: string;
}

// Prompts for each AI step per workflow
const STEP_PROMPTS: Record<WorkflowId, Record<number, (input: string, context: string) => string>> = {
  itinerary: {
    1: (input) => `Analyse this client travel request and extract key details. Format as a brief structured summary:\n\n${input}`,
    2: (input) => `Based on this travel request, research the destination thoroughly. Cover: best time to visit, must-see attractions, local transportation, accommodation areas, and any important logistics. Be specific and practical.\n\nRequest: ${input}`,
    3: (input) => `Check visa requirements relevant to this travel request. If the client's nationality isn't specified, assume US passport holder. Provide current visa requirements, application process, costs, and processing time. Always note this must be verified before advising the client.\n\nRequest: ${input}`,
    4: (input) => `Research realistic pricing for this trip. Provide estimated costs for: flights (round trip from major US cities), hotels (budget/mid/luxury per night), main activities and tours, meals per day, and local transportation. Give ranges not single figures. Note these are estimates for planning purposes.\n\nRequest: ${input}`,
    5: (input, context) => `Build a detailed day-by-day itinerary for this client request. Use the research context below. Make it specific, practical, and client-ready — include hotel area recommendations, meal suggestions, timing, and booking tips.\n\nRequest: ${input}\n\nResearch context: ${context}`,
    6: (input, context) => `Write a complete, professional travel proposal document for this client. Include: trip overview, day-by-day itinerary, pricing summary table, what's included/excluded, next steps (deposit amount, booking deadline), and a professional sign-off. Make it ready to send to the client.\n\nRequest: ${input}\n\nItinerary: ${context}`,
  },
  research: {
    1: (input) => `Write a comprehensive destination overview for: ${input}. Cover geography, population, capital, official language, currency, time zone, and a brief cultural introduction for travel advisors.`,
    2: (input) => `What is the current US State Department travel advisory level for ${input}? Describe the advisory level, key risks, and recommended precautions. Note the source (travel.state.gov) and that advisors should verify before client communication.`,
    3: (input) => `Describe the best and worst times to visit ${input} month by month. Cover weather, rainfall, temperature, crowd levels, local events, and price seasonality. Give a clear recommendation for different traveler types.`,
    4: (input) => `Compile visa requirements for ${input}. Include requirements for: US passport holders, UK, Canadian, Australian, and European passport holders. Cover: visa required (yes/no), how to apply, cost, processing time, and validity. Note that requirements change and must be verified.`,
    5: (input) => `Research average travel costs for ${input}. Provide daily budget estimates in USD for: budget traveler, mid-range traveler, and luxury traveler. Break down by accommodation, meals, activities, and local transport. Note these are estimates and prices vary by season.`,
    6: (input) => `Identify the top travel experiences in ${input} for a US travel advisor's client base. Include: top 5 must-see attractions, 3 hidden gems most tourists miss, best day trips, top adventure activities, best food and dining experiences, and key advisor selling points.`,
    7: (input) => `What major local holidays, festivals, and events happen in ${input} throughout the year? List month by month. Note which events are great for travelers to experience and which may cause closures or crowds to avoid.`,
    8: (input, context) => `Compile a complete, professional destination reference report for ${input} that a travel advisor can use and share with their team. Use all the research gathered. Format it clearly with sections, tables where appropriate, and include a disclaimer that all dynamic information (prices, advisories, visa rules) should be verified before advising clients.\n\nResearch gathered:\n${context}`,
  },
  package: {
    1: (input) => `Analyse this tour package concept and create a structured breakdown. Define: package name, duration, destinations covered, accommodation level, included services (flights, hotels, tours, meals, transfers), excluded items, group size limits, and recommended selling price with margin notes.\n\nConcept: ${input}`,
    2: (input) => `Write compelling tour package marketing copy for: ${input}. Include: a punchy headline, 2-3 sentence overview, key highlights (bullet points), who this is perfect for, and a closing call-to-action. Write in an engaging, aspirational tone that sells the experience.`,
    3: (input, context) => `Create a detailed day-by-day itinerary for this tour package. Be specific — include accommodation areas, included meals, tour activities with approximate timings, free time suggestions, and any optional upgrades. Format it clearly for a product page.\n\nPackage: ${input}\n\nContext: ${context}`,
    4: (input) => `Write a creative brief for a Canva promotional graphic for this tour package: ${input}. Describe: the main image concept, text overlay (headline + price from), color palette suggestion, and any icons or design elements. This brief will be used to create the graphic.`,
    9: (input, context) => `Write a launch email for this tour package to send to a travel business's email list. Include: subject line (3 options), preview text, compelling body copy with key highlights and dates, a clear call-to-action, and a P.S. line. Keep it punchy and action-oriented.\n\nPackage: ${input}\n\nDetails: ${context}`,
    10: (input, context) => `Write 3 social media posts to announce this tour package launch:\n1. Instagram caption (with hashtags)\n2. Facebook post (slightly longer, more detail)\n3. Short Twitter/X post\n\nMake each platform-appropriate and include a call-to-action.\n\nPackage: ${input}\n\nDetails: ${context}`,
  },
};

export async function executeWorkflow(
  workflowId: WorkflowId,
  userInput: string,
  userId: string,
  onProgress: (event: WorkflowProgressEvent) => void
): Promise<void> {
  const workflow = WORKFLOWS[workflowId];
  const supabase = createClient();

  // Load business profile and memory
  const [profileResult, memoryContext] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("user_id", userId).single(),
    getMemoryContext(userId),
  ]);

  const profile = profileResult.data as {
    business_name: string; business_type: string; location: string;
    specialty_destinations: string[]; target_clients: string | null;
    team_size: number; years_in_business: number;
  } | null;

  // Check which connectors are active for this user
  const { data: connectors } = await supabase
    .from("connectors")
    .select("connector_name, status")
    .eq("user_id", userId)
    .eq("status", "connected");

  const connectedApps = new Set((connectors ?? []).map((c: { connector_name: string }) => c.connector_name));

  // Create task record
  const taskId = await createTask(userId, userInput, workflowId, workflow.steps.length);
  if (!taskId) {
    onProgress({ type: "error", error: "Failed to start workflow. Please try again." });
    return;
  }

  const systemPrompt = buildSystemPrompt(profile, memoryContext, true);
  const stepOutputs: Record<number, string> = {};
  let fullOutput = "";
  let liveFlightContext = ""; // populated before step 4 if Duffel is configured

  try {
    for (const step of workflow.steps) {
      // Check if step requires a connector that isn't connected
      if (step.requiresConnector && !connectedApps.has(step.requiresConnector)) {
        onProgress({
          type: "step_skip",
          step: step.number,
          stepName: step.name,
          text: `Skipped — ${step.requiresConnector} not connected. Connect it in Settings → Connectors to enable this step.`,
        });
        await updateTaskStep(taskId, step.number, step.name, "completed");
        continue;
      }

      // Before step 4 of the itinerary workflow, fetch live flight prices from Duffel
      if (workflowId === "itinerary" && step.number === 4 && isAmadeusConfigured()) {
        try {
          const params = await extractFlightParams(userInput);
          if (params) {
            const flights = await searchFlights({ ...params, max: 4 });
            if (flights.length > 0) {
              liveFlightContext = formatFlightsForProposal(flights, params.origin, params.destination);
            }
          }
        } catch {
          // Duffel unavailable — step 4 falls back to AI estimates
        }
      }

      onProgress({ type: "step_start", step: step.number, stepName: step.name });
      await updateTaskStep(taskId, step.number, step.name, "running");

      // AI-driven steps (no connector required, or connector is connected)
      const stepPromptFn = STEP_PROMPTS[workflowId]?.[step.number];

      if (stepPromptFn) {
        const contextFromPreviousSteps = Object.entries(stepOutputs)
          .map(([n, out]) => `Step ${n}: ${out.slice(0, 500)}`)
          .join("\n\n");

        // Inject live flight data for itinerary step 4
        const extraContext = workflowId === "itinerary" && step.number === 4 && liveFlightContext
          ? `\n\nLIVE FLIGHT DATA FROM AMADEUS GDS:\n${liveFlightContext}\n\nIMPORTANT: Use the above live prices in your pricing research output. Present these as real, bookable fares — not estimates.`
          : "";

        const prompt = stepPromptFn(userInput, contextFromPreviousSteps) + extraContext;

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        stepOutputs[step.number] = text;
        fullOutput += `\n\n## ${step.name}\n${text}`;

        onProgress({ type: "step_complete", step: step.number, stepName: step.name, text });
      } else {
        // Connector step that IS connected — acknowledge it
        const connectorMsg = `Connected to ${step.requiresConnector} — this step will be fully automated in the next build phase.`;
        onProgress({ type: "step_complete", step: step.number, stepName: step.name, text: connectorMsg });
      }

      await updateTaskStep(taskId, step.number, step.name, "completed");
    }

    // Add compliance block to final output
    const destination = detectDestination(userInput);
    if (destination) {
      const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const compliance = buildComplianceBlock(destination, null, false, today).fullBlock;
      fullOutput += compliance;
    }

    await completeTask(taskId, userId, fullOutput, 0);
    extractAndSaveMemories(userId, taskId, userInput, fullOutput).catch(() => {});

    onProgress({ type: "done", taskId });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await failTask(taskId, msg);
    onProgress({ type: "error", error: "Something went wrong during the workflow. Your task usage was not charged." });
  }
}
