import Link from "next/link";
import { type Connector } from "@/types/database";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";

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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-navy">App Connectors</h3>
          <p className="text-xs text-gray-400 mt-0.5">{connectedCount} of 8 connected</p>
        </div>
        <Link href="/dashboard/connectors" className="text-xs text-teal hover:underline font-medium">
          Manage →
        </Link>
      </div>

      {/* Attention banner */}
      {needsAttention.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
          <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-red-700">
              {needsAttention.length} connector{needsAttention.length > 1 ? "s need" : " needs"} reconnecting
            </p>
            <Link href="/dashboard/connectors" className="text-xs text-red-600 hover:underline">Fix now →</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {STARTER_NAMES.map((name) => {
          const connector = connectorMap[name];
          const status = connector?.status ?? "disconnected";
          const meta = CONNECTOR_META[name];
          const isConnected = status === "connected";
          const isError = ["needs_reconnect", "error", "expired"].includes(status);

          return (
            <div
              key={name}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                isConnected ? "bg-green-50" : isError ? "bg-red-50" : "bg-gray-50"
              }`}
            >
              <span className="text-sm leading-none">{meta?.icon}</span>
              <span className={`font-medium truncate flex-1 ${isConnected ? "text-green-800" : isError ? "text-red-700" : "text-gray-500"}`}>
                {meta?.label}
              </span>
              {isConnected
                ? <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                : isError
                ? <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                : <Circle size={12} className="text-gray-300 flex-shrink-0" />
              }
            </div>
          );
        })}
      </div>

      {connectedCount === 0 && (
        <Link
          href="/dashboard/connectors"
          className="mt-3 block text-center text-xs text-teal font-medium hover:underline"
        >
          Connect your apps to unlock automations →
        </Link>
      )}
    </div>
  );
}
