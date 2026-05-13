import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [taskResult, stepsResult] = await Promise.all([
    supabase.from("tasks").select("*").eq("id", params.id).eq("user_id", user.id).single(),
    supabase.from("task_steps").select("*").eq("task_id", params.id).order("step_number"),
  ]);

  if (!taskResult.data) notFound();

  const task = taskResult.data as {
    id: string; input: string; output: string | null;
    task_type: string; status: string; tokens_used: number;
    apps_used: string[]; error_message: string | null;
    created_at: string; completed_at: string | null;
  };

  const steps = (stepsResult.data ?? []) as {
    step_number: number; step_name: string; status: string;
    started_at: string | null; completed_at: string | null;
    error_message: string | null;
  }[];

  const TYPE_LABEL: Record<string, string> = {
    itinerary: "Client Itinerary",
    research: "Destination Report",
    package: "Tour Package",
    general: "Question / Task",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/tasks" className="text-sm text-gray-400 hover:text-navy">← Task history</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl font-bold text-navy line-clamp-2">{task.input}</h1>
          <span className={`ml-4 flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
            task.status === "completed" ? "bg-green-100 text-green-700" :
            task.status === "failed" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-500"
          }`}>
            {task.status}
          </span>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span>{TYPE_LABEL[task.task_type] ?? task.task_type}</span>
          <span>{formatDateTime(task.created_at)}</span>
          {task.tokens_used > 0 && <span>{task.tokens_used.toLocaleString()} tokens</span>}
        </div>
      </div>

      {task.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong> {task.error_message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps */}
        {steps.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-navy mb-4">Steps</h3>
            <ol className="space-y-2">
              {steps.map((step) => (
                <li key={step.step_number} className="flex items-center gap-2">
                  {step.status === "completed"
                    ? <CheckCircle2 size={14} className="text-teal flex-shrink-0" />
                    : step.status === "failed"
                      ? <XCircle size={14} className="text-red-500 flex-shrink-0" />
                      : <Clock size={14} className="text-gray-300 flex-shrink-0" />
                  }
                  <span className="text-sm text-gray-600">{step.step_name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Output */}
        <div className={steps.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
          {task.output ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-navy">Output</h3>
                <Link
                  href={`/dashboard/chat`}
                  className="text-xs text-teal hover:underline flex items-center gap-1"
                >
                  Rerun similar task →
                </Link>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap max-h-[60vh] overflow-auto text-sm leading-relaxed">
                {task.output}
              </div>
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-400 text-sm">
              No output recorded for this task.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
