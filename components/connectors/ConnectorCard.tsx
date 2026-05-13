"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { type ConnectorDefinition } from "@/lib/connectors/registry";

type ConnectorStatus = "connected" | "disconnected" | "unhealthy" | "expired";

interface ConnectorCardProps {
  connector: ConnectorDefinition;
  status: ConnectorStatus;
  connectedAt: string | null;
  onConnect: (id: string) => Promise<void>;
  onDisconnect: (id: string) => Promise<void>;
}

const STATUS_CONFIG = {
  connected: {
    icon: CheckCircle2,
    iconClass: "text-green-500",
    label: "Connected",
    labelClass: "text-green-700 bg-green-50",
  },
  disconnected: {
    icon: XCircle,
    iconClass: "text-gray-300",
    label: "Not connected",
    labelClass: "text-gray-500 bg-gray-50",
  },
  unhealthy: {
    icon: AlertCircle,
    iconClass: "text-orange-500",
    label: "Needs reconnecting",
    labelClass: "text-orange-700 bg-orange-50",
  },
  expired: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    label: "Token expired",
    labelClass: "text-red-700 bg-red-50",
  },
};

export default function ConnectorCard({
  connector,
  status,
  connectedAt,
  onConnect,
  onDisconnect,
}: ConnectorCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = STATUS_CONFIG[status];
  const isConnected = status === "connected";
  const needsReconnect = status === "unhealthy" || status === "expired";

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      await onConnect(connector.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    setError(null);
    try {
      await onDisconnect(connector.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn(
      "card transition-all",
      needsReconnect && "border-orange-200 bg-orange-50/30",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", connector.color)}>
            {connector.icon}
          </div>
          <div>
            <h3 className="font-semibold text-navy">{connector.name}</h3>
            <p className="text-xs text-gray-500">{connector.description}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", config.labelClass)}>
          <config.icon size={12} className={config.iconClass} />
          {config.label}
        </div>
      </div>

      {/* What it does */}
      <ul className="space-y-1 mb-4">
        {connector.whatItDoes.slice(0, 3).map((item) => (
          <li key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-xs text-red-600 mb-3 bg-red-50 rounded px-2 py-1.5">{error}</p>
      )}

      {needsReconnect && (
        <p className="text-xs text-orange-600 mb-3">
          This connector needs to be reconnected to continue working.
        </p>
      )}

      {/* Action */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <span className="text-xs text-gray-400 flex-1">
              {connectedAt ? `Connected ${new Date(connectedAt).toLocaleDateString()}` : "Connected"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={loading}
              onClick={handleDisconnect}
              className="text-gray-400 hover:text-red-500"
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant={needsReconnect ? "danger" : "teal"}
            size="sm"
            loading={loading}
            onClick={handleConnect}
            className="w-full"
          >
            {needsReconnect ? "Reconnect" : "Connect"} {connector.name}
          </Button>
        )}
      </div>
    </div>
  );
}
