import { cn } from "@/lib/utils";

interface AlertProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  className?: string;
}

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

export default function Alert({ type, message, className }: AlertProps) {
  return (
    <div className={cn("border rounded px-4 py-3 text-sm", styles[type], className)}>
      {message}
    </div>
  );
}
