"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConnectorCard from "./ConnectorCard";
import { CONNECTORS, STARTER_CONNECTORS } from "@/lib/connectors/registry";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ConnectorStatus = "connected" | "disconnected" | "unhealthy" | "expired";

interface ConnectorData {
  connector_name: string;
  status: ConnectorStatus;
  connected_at: string | null;
  last_health_status: boolean | null;
}

interface ConnectorsPageProps {
  connectors: ConnectorData[];
  connectedParam?: string;
  errorParam?: string;
}

export default function ConnectorsPage({ connectors, connectedParam, errorParam }: ConnectorsPageProps) {
  const router = useRouter();
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(
    connectedParam
      ? { type: "success", message: `${CONNECTORS[connectedParam as keyof typeof CONNECTORS]?.name ?? connectedParam} connected successfully!` }
      : errorParam
        ? { type: "error", message: "Connection failed. Please try again." }
        : null
  );

  const connectorMap = Object.fromEntries(connectors.map((c) => [c.connector_name, c]));

  const connectedCount = connectors.filter((c) => c.status === "connected").length;
  const unhealthyCount = connectors.filter((c) => c.status === "unhealthy" || c.status === "expired").length;

  async function handleConnect(connectorId: string) {
    const res = await fetch("/api/connectors/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId }),
    });
    const data = await res.json();

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }
    if (data.success) {
      router.refresh();
      setBanner({ type: "success", message: `${CONNECTORS[connectorId as keyof typeof CONNECTORS]?.name} connected.` });
      return;
    }
    if (data.requiresApiKey) {
      setBanner({ type: "error", message: data.message });
      return;
    }
    throw new Error(data.error ?? "Connection failed");
  }

  async function handleDisconnect(connectorId: string) {
    await fetch("/api/connectors/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId }),
    });
    router.refresh();
    setBanner({ type: "success", message: `${CONNECTORS[connectorId as keyof typeof CONNECTORS]?.name} disconnected.` });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Connectors</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect your apps so TripDesk can take action on your behalf.
        </p>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
          banner.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {banner.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {banner.message}
          <button onClick={() => setBanner(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Health summary */}
      {unhealthyCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-orange-700">
          <AlertCircle size={16} />
          {unhealthyCount} connector{unhealthyCount > 1 ? "s need" : " needs"} reconnecting. Tasks that use {unhealthyCount > 1 ? "them" : "it"} will be skipped until fixed.
        </div>
      )}

      {/* Stats bar */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-navy">{connectedCount} of {STARTER_CONNECTORS.length} connected</p>
            <p className="text-xs text-gray-400 mt-0.5">Connect more apps to unlock more workflow steps</p>
          </div>
          <div className="flex gap-1">
            {STARTER_CONNECTORS.map((id) => {
              const c = connectorMap[id];
              const status = c?.status ?? "disconnected";
              return (
                <div
                  key={id}
                  title={CONNECTORS[id].name}
                  className={`w-2 h-6 rounded-full ${
                    status === "connected" ? "bg-teal" :
                    status === "unhealthy" || status === "expired" ? "bg-orange-400" :
                    "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Connector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STARTER_CONNECTORS.map((connectorId) => {
          const def = CONNECTORS[connectorId];
          const data = connectorMap[connectorId];
          return (
            <ConnectorCard
              key={connectorId}
              connector={def}
              status={data?.status ?? "disconnected"}
              connectedAt={data?.connected_at ?? null}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        More connectors (Notion, WordPress, Viator, and more) available on Professional and Agency plans.
      </p>
    </div>
  );
}
