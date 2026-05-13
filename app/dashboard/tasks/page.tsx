import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { formatDateTime, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_ICON = {
  completed: <CheckCircle2 size={15} className="text-green-500" />,
  failed: <XCircle size={15} className="text-red-500" />,
  pending: <Clock size={15} className="text-gray-400" />,
  running: <Loader2 size={15} className="text-teal animate-spin" />,
  rolled_back: <XCircle size={15} className="text-orange-500" />,
};

const STATUS_LABEL = {
  completed: "Completed",
  failed: "Failed",
  pending: "Pending",
  running: "Running",
  rolled_back: "Rolled back",
};

const TYPE_LABEL: Record<string, string> = {
  itinerary: "Client Itinerary",
  research: "Destination Report",
  package: "Tour Package",
  general: "Question / Task",
};

export default async function TaskHistoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, input, task_type, status, tokens_used, apps_used, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const taskList = (tasks ?? []) as {
    id: string; input: string; task_type: string;
    status: keyof typeof STATUS_ICON; tokens_used: number;
    apps_used: string[]; created_at: string; completed_at: string | null;
  }[];

  const completedCount = taskList.filter((t) => t.status === "completed").length;
  const failedCount = taskList.filter((t) => t.status === "failed").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Task History</h1>
        <p className="text-gray-500 text-sm mt-1">
          {completedCount} completed · {failedCount} failed · last 50 tasks shown
        </p>
      </div>

      {taskList.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No tasks yet.</p>
          <p className="text-gray-400 text-xs mt-1">Run a workflow or ask TripDesk something to get started.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {taskList.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-navy font-medium line-clamp-1">{truncate(task.input, 60)}</p>
                    {task.apps_used.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{task.apps_used.join(", ")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{TYPE_LABEL[task.task_type] ?? task.task_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICON[task.status] ?? STATUS_ICON.pending}
                      <span className={cn("text-xs", task.status === "completed" ? "text-green-700" : task.status === "failed" ? "text-red-600" : "text-gray-500")}>
                        {STATUS_LABEL[task.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">
                    {formatDateTime(task.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="text-xs text-teal hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
