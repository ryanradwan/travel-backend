import Link from "next/link";
import { type Connector } from "@/types/database";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const CONNECTOR_LABELS: Record<string, string> = {
  gmail: "Gmail",
  google_drive: "Google Drive",
  google_calendar: "Google Calendar",
  whatsapp: "WhatsApp",
  canva: "Canva",
  skyscanner: "Skyscanner",
};

const statusIcon = {
  connected: <CheckCircle2 size={14} className="text-green-500" />,
  disconnected: <XCircle size={14} className="text-gray-300" />,
  unhealthy: <AlertCircle size={14} className="text-orange-500" />,
  expired: <AlertCircle size={14} className="text-red-500" />,
};

interface ConnectorStatusProps {
  connectors: Connector[];
}

export default function ConnectorStatus({ connectors }: ConnectorStatusProps) {
  const starterNames = ["gmail", "google_drive", "google_calendar", "whatsapp", "canva", "skyscanner"];
  const connectorMap = Object.fromEntries(connectors.map((c) => [c.connector_name, c]));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-navy">Connectors</h3>
        <Link href="/dashboard/connectors" className="text-xs text-teal hover:underline">
          Manage →
        </Link>
      </div>

      <div className="space-y-2">
        {starterNames.map((name) => {
          const connector = connectorMap[name];
          const status = connector?.status ?? "disconnected";
          return (
            <div key={name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                {statusIcon[status]}
                <span className="text-sm text-navy">{CONNECTOR_LABELS[name]}</span>
              </div>
              {status !== "connected" && (
                <Link
                  href={`/dashboard/connectors?connect=${name}`}
                  className="text-xs text-teal hover:underline font-medium"
                >
                  {status === "expired" || status === "unhealthy" ? "Reconnect" : "Connect"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
