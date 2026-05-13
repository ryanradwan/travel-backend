import Link from "next/link";
import { type Task } from "@/types/database";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

const statusIcon = {
  completed: <CheckCircle2 size={14} className="text-green-500" />,
  failed: <XCircle size={14} className="text-red-500" />,
  pending: <Clock size={14} className="text-gray-400" />,
  running: <Loader2 size={14} className="text-teal animate-spin" />,
  rolled_back: <XCircle size={14} className="text-orange-500" />,
};

interface RecentTasksProps {
  tasks: Task[];
}

export default function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-navy">Recent Tasks</h3>
        <Link href="/dashboard/tasks" className="text-xs text-teal hover:underline">
          View all →
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No tasks yet.</p>
          <Link href="/dashboard/chat" className="text-teal text-sm font-medium hover:underline mt-1 inline-block">
            Run your first task →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/tasks/${task.id}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="mt-0.5 flex-shrink-0">
                {statusIcon[task.status]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy font-medium truncate group-hover:text-teal transition-colors">
                  {task.input.slice(0, 80)}{task.input.length > 80 ? "…" : ""}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateTime(task.created_at)}
                  {task.apps_used.length > 0 && ` · ${task.apps_used.join(", ")}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
