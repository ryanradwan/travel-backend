import Link from "next/link";
import { type Connector } from "@/types/database";
import { CheckCircle2, AlertCircle, Circle, Plug } from "lucide-react";

const CONNECTOR_META: Record<string, { label: string; icon: string }> = {
  gmail: { label: "Gmail", icon: "✉️" },
  google_drive: { label: "Google Drive", icon: "📁" },
  google_calendar: { label: "Calendar", icon: "📅" },
  google_docs: { label: "Google Docs", icon: "📄" },
  whatsapp: { label: "WhatsApp", icon: "💬" },
  canva: { label: "Canva", icon: "🎨" },
  skyscanner: { label: "Skyscanner", icon: "✈️" },
  mailchimp: { label: "Mailchimp", icon: "📧" },
};

const STARTER_NAMES = ["gmail", "google_drive", "google_calendar", "google_docs", "whatsapp", "canva", "skyscanner", "mailchimp"];

export default function ConnectorStatus({ connectors }: { connectors: Connector[] }) {
  const connectorMap = Object.fromEntries(connectors.map((c) => [c.connector_name, c]));
  const connectedCount = connectors.filter(c => c.status === "connected").length;
  const needsAttention = connectors.filter(c => ["needs_reconnect", "error", "expired"].includes(c.status));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plug size={14} className="text-navy" />
          <div>
            <h3 className="text-sm font-semibold text-navy">App Connectors</h3>
            <p className="text-xs text-gray-400 mt-0.5">{connectedCount} of 8 connected</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {needsAttention.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <AlertCircle size={12} className="text-red-500" />
              <p className="text-xs font-medium text-red-700">{needsAttention.length} need reconnecting</p>
            </div>
          )}
          <Link href="/dashboard/connectors" className="text-xs text-teal hover:underline font-medium">
            Manage →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
        {STARTER_NAMES.map((name) => {
          const connector = connectorMap[name];
          const status = connector?.status ?? "disconnected";
          const meta = CONNECTOR_META[name];
          const isConnected = status === "connected";
          const isError = ["needs_reconnect", "error", "expired"].includes(status);

          return (
            <Link
              key={name}
              href="/dashboard/connectors"
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all hover:shadow-sm ${
                isConnected
                  ? "bg-green-50 border-green-200 hover:border-green-400"
                  : isError
                  ? "bg-red-50 border-red-200 hover:border-red-400"
                  : "bg-gray-50 border-gray-200 hover:border-teal"
              }`}
            >
              <span className="text-xl leading-none">{meta?.icon}</span>
              <span className={`text-xs font-medium text-center leading-tight ${isConnected ? "text-green-800" : isError ? "text-red-700" : "text-gray-500"}`}>
                {meta?.label}
              </span>
              {isConnected
                ? <CheckCircle2 size={11} className="text-green-500" />
                : isError
                ? <AlertCircle size={11} className="text-red-400" />
                : <Circle size={11} className="text-gray-300" />
              }
            </Link>
          );
        })}
      </div>

      {connectedCount === 0 && (
        <p className="text-center text-xs text-teal font-medium hover:underline mt-3">
          <Link href="/dashboard/connectors">Connect your apps to unlock automations →</Link>
        </p>
      )}
    </div>
  );
}
