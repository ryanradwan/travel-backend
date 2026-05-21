"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Circle, Loader2, SkipForward, Copy, CheckCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { WORKFLOWS, type WorkflowId } from "@/lib/workflows/definitions";
import ProposalActions from "@/components/proposals/ProposalActions";
import MarkdownContent from "@/components/ui/MarkdownContent";

interface StepState {
  status: "pending" | "running" | "complete" | "skipped";
  output?: string;
}

interface WorkflowRunnerProps {
  workflowId: WorkflowId;
  prefillInput?: string;
}

export default function WorkflowRunner({ workflowId, prefillInput }: WorkflowRunnerProps) {
  const workflow = WORKFLOWS[workflowId];
  const [phase, setPhase] = useState<"input" | "running" | "done">("input");
  const [input, setInput] = useState(prefillInput ?? "");
  const [steps, setSteps] = useState<Record<number, StepState>>({});
  const [finalOutput, setFinalOutput] = useState("");
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const updateStep = (stepNum: number, update: Partial<StepState>) => {
    setSteps((prev) => ({
      ...prev,
      [stepNum]: { ...prev[stepNum], ...update },
    }));
  };

  async function runWorkflow() {
    if (!input.trim()) return;
    setPhase("running");
    setError(null);
    setFinalOutput("");

    const initial: Record<number, StepState> = {};
    workflow.steps.forEach((s) => { initial[s.number] = { status: "pending" }; });
    setSteps(initial);

    abortRef.current = new AbortController();

    let currentTaskId: string | null = null;
    const previousOutputs: Record<number, string> = {};
    let outputSoFar = "";

    try {
      for (const step of workflow.steps) {
        if (abortRef.current.signal.aborted) break;

        updateStep(step.number, { status: "running" });

        const stepRes = await fetch("/api/workflows/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId,
            stepNumber: step.number,
            input,
            previousOutputs,
            taskId: currentTaskId,
          }),
          signal: abortRef.current.signal,
        });

        const data = await stepRes.json() as { taskId: string; stepOutput: string; skipped: boolean; error?: string };

        if (!stepRes.ok) {
          throw new Error(data.error ?? "Step failed");
        }


        currentTaskId = data.taskId;

        if (data.skipped) {
          updateStep(step.number, { status: "skipped", output: data.stepOutput });
        } else {
          previousOutputs[step.number] = data.stepOutput;
          updateStep(step.number, { status: "complete", output: data.stepOutput });
          outputSoFar += `\n\n## ${step.name}\n${data.stepOutput}`;
          setFinalOutput(outputSoFar);
        }
      }

      if (currentTaskId) setTaskId(currentTaskId);
      setPhase("done");

    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setPhase("input");
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("input");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setPhase("input");
    setSteps({});
    setFinalOutput("");
    setError(null);
    setInput("");
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (phase === "input") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">{workflow.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{workflow.description}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="card mb-6">
          <label className="label">{workflow.inputPrompt}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input mt-1 resize-none"
            rows={5}
            placeholder="The more detail you give, the better the output…"
          />
        </div>

        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-navy mb-3">What TravelBackend will do</h3>
          <ol className="space-y-2">
            {workflow.steps.map((step) => (
              <li key={step.number} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium mt-0.5">
                  {step.number}
                </span>
                <div>
                  <span className="font-medium text-navy">{step.name}</span>
                  {step.requiresConnector && (
                    <span className="ml-2 text-xs text-gray-400">({step.requiresConnector})</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-400 mt-4">This counts as 1 task.</p>
        </div>

        <Button
          variant="teal"
          size="lg"
          className="w-full"
          disabled={!input.trim()}
          onClick={runWorkflow}
        >
          Run workflow →
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{workflow.name}</h1>
          {phase === "running" && (
            <p className="text-sm text-gray-500 mt-0.5">Running — do not close this page</p>
          )}
          {phase === "done" && (
            <p className="text-sm text-teal mt-0.5">Complete</p>
          )}
        </div>
        {phase === "done" && (
          <Button variant="outline" size="sm" onClick={reset}>
            Run again
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step tracker */}
        <div className="card h-fit">
          <h3 className="text-sm font-semibold text-navy mb-4">Progress</h3>
          <ol className="space-y-3">
            {workflow.steps.map((step) => {
              const state = steps[step.number];
              const status = state?.status ?? "pending";
              return (
                <li key={step.number} className="flex items-center gap-2.5">
                  <StepIcon status={status} />
                  <span className={cn(
                    "text-sm",
                    status === "running" && "text-navy font-medium",
                    status === "complete" && "text-gray-600",
                    status === "skipped" && "text-gray-400 line-through",
                    status === "pending" && "text-gray-400",
                  )}>
                    {step.name}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Output panel */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-navy">Output</h3>
              {finalOutput && (
                <button
                  onClick={copyOutput}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors"
                >
                  {copied ? <CheckCheck size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy all"}
                </button>
              )}
            </div>

            {!finalOutput && phase === "running" && (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
                <Loader2 size={16} className="animate-spin" />
                Working through the steps…
              </div>
            )}

            {finalOutput && (
              <div className="overflow-auto max-h-[60vh]">
                <MarkdownContent content={finalOutput} />
              </div>
            )}
            {finalOutput && phase === "done" && (
              <ProposalActions content={finalOutput} taskId={taskId} />
            )}
          </div>
        </div>
      </div>

      {/* Pipeline notification — itinerary only */}
      {phase === "done" && workflowId === "itinerary" && (
        <div className="mt-4 bg-teal/5 border border-teal/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={15} className="text-teal" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">Pipeline entry created</p>
              <p className="text-xs text-gray-500 mt-0.5">Add the deal value to track commission in Revenue & Analytics.</p>
            </div>
          </div>
          <a
            href="/dashboard/pipeline"
            className="text-xs bg-teal text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
          >
            View in Pipeline →
          </a>
        </div>
      )}
    </div>
  );
}

function StepIcon({ status }: { status: StepState["status"] }) {
  switch (status) {
    case "complete":
      return <CheckCircle2 size={16} className="text-teal flex-shrink-0" />;
    case "running":
      return <Loader2 size={16} className="text-navy animate-spin flex-shrink-0" />;
    case "skipped":
      return <SkipForward size={16} className="text-gray-300 flex-shrink-0" />;
    default:
      return <Circle size={16} className="text-gray-200 flex-shrink-0" />;
  }
}
