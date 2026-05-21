"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConnectorCard from "./ConnectorCard";
import {
  CONNECTORS, STARTER_CONNECTORS, PROFESSIONAL_LIBRARY, AGENCY_ONLY,
  getConnectorLimits, type ConnectorId,
} from "@/lib/connectors/registry";
import { CheckCircle2, AlertCircle, Lock, Key, Loader2, X } from "lucide-react";
import Link from "next/link";

type ConnectorStatus = "connected" | "disconnected" | "unhealthy" | "expired";

interface ConnectorData {
  connector_name: string;
  status: ConnectorStatus;
  connected_at: string | null;
}

interface ConnectorsPageProps {
  connectors: ConnectorData[];
  tier: string;
  connectedParam?: string;
  errorParam?: string;
}

export default function ConnectorsPage({ connectors, tier, connectedParam, errorParam }: ConnectorsPageProps) {
  const router = useRouter();
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(
    connectedParam
      ? { type: "success", message: `${CONNECTORS[connectedParam as ConnectorId]?.name ?? connectedParam} connected successfully!` }
      : errorParam
        ? { type: "error", message: "Connection failed. Please try again." }
        : null
  );
  const [apiKeyModal, setApiKeyModal] = useState<{ connectorId: string; connectorName: string; message: string } | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeySaving, setApiKeySaving] = useState(false);

  const limits = getConnectorLimits(tier);
  const connectorMap = Object.fromEntries(connectors.map((c) => [c.connector_name, c]));

  // Count how many Professional library slots are in use
  const usedChoosableSlots = PROFESSIONAL_LIBRARY.filter(
    (id) => connectorMap[id]?.status === "connected"
  ).length;

  const slotsRemaining = limits.choosableLimit !== null
    ? limits.choosableLimit - usedChoosableSlots
    : null;

  const unhealthyCount = connectors.filter(
    (c) => c.status === "unhealthy" || c.status === "expired"
  ).length;

  async function handleConnect(connectorId: string) {
    const res = await fetch("/api/connectors/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId }),
    });
    const data = await res.json();

    if (data.redirectUrl) { window.location.href = data.redirectUrl; return; }
    if (data.success) {
      router.refresh();
      setBanner({ type: "success", message: `${CONNECTORS[connectorId as ConnectorId]?.name} connected.` });
      return;
    }
    if (data.requiresApiKey) {
      setApiKeyValue("");
      setApiKeyModal({ connectorId: data.connectorId, connectorName: data.connectorName, message: data.message });
      return;
    }
    setBanner({ type: "error", message: data.error ?? "Connection failed. Please try again." });
  }

  async function handleApiKeySubmit() {
    if (!apiKeyModal || !apiKeyValue.trim()) return;
    setApiKeySaving(true);
    try {
      const res = await fetch("/api/connectors/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: apiKeyModal.connectorId, apiKey: apiKeyValue.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeyModal(null);
        setApiKeyValue("");
        router.refresh();
        setBanner({ type: "success", message: `${apiKeyModal.connectorName} connected.` });
      } else {
        setBanner({ type: "error", message: data.error ?? "Failed to save API key." });
        setApiKeyModal(null);
      }
    } finally {
      setApiKeySaving(false);
    }
  }

  async function handleDisconnect(connectorId: string) {
    await fetch("/api/connectors/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId }),
    });
    router.refresh();
    setBanner({ type: "success", message: `${CONNECTORS[connectorId as ConnectorId]?.name} disconnected.` });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Connectors</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect your apps so TravelBackend can take action on your behalf.
        </p>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
          banner.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {banner.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {banner.message}
          <button onClick={() => setBanner(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {unhealthyCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-orange-700">
          <AlertCircle size={16} />
          {unhealthyCount} connector{unhealthyCount > 1 ? "s need" : " needs"} reconnecting.
          Tasks that use {unhealthyCount > 1 ? "them" : "it"} will skip until fixed.
        </div>
      )}

      {/* ── SECTION 1: Starter (fixed, always included) ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-navy">Included on all plans</h2>
            <p className="text-xs text-gray-400 mt-0.5">These 8 connectors are always available regardless of your plan.</p>
          </div>
          <span className="text-xs text-gray-400">
            {STARTER_CONNECTORS.filter((id) => connectorMap[id]?.status === "connected").length} / 8 connected
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {STARTER_CONNECTORS.map((id) => (
            <ConnectorCard
              key={id}
              connector={CONNECTORS[id]}
              status={connectorMap[id]?.status ?? "disconnected"}
              connectedAt={connectorMap[id]?.connected_at ?? null}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </section>

      {/* ── SECTION 2: Professional library ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-navy">Choose your connectors</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {tier === "starter"
                ? "Upgrade to Professional to choose up to 14 additional connectors."
                : limits.choosableLimit !== null
                  ? `${usedChoosableSlots} of ${limits.choosableLimit} slots used.`
                  : "Unlimited — connect as many as you need."}
            </p>
          </div>
          {tier === "professional" && slotsRemaining !== null && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              slotsRemaining === 0
                ? "bg-orange-100 text-orange-700"
                : "bg-teal/10 text-teal"
            }`}>
              {slotsRemaining} slot{slotsRemaining !== 1 ? "s" : ""} remaining
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PROFESSIONAL_LIBRARY.map((id) => {
            const isLocked = tier === "starter";
            const isSlotsFull = tier === "professional"
              && slotsRemaining === 0
              && connectorMap[id]?.status !== "connected";

            if (isLocked) {
              return <LockedConnectorCard key={id} connector={CONNECTORS[id]} upgradeTarget="Professional" />;
            }
            if (isSlotsFull) {
              return <LockedConnectorCard key={id} connector={CONNECTORS[id]} reason="No slots remaining. Disconnect another connector first." />;
            }
            return (
              <ConnectorCard
                key={id}
                connector={CONNECTORS[id]}
                status={connectorMap[id]?.status ?? "disconnected"}
                connectedAt={connectorMap[id]?.connected_at ?? null}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            );
          })}
        </div>
      </section>

      {/* API key modal */}
      {apiKeyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-teal" />
                <h3 className="font-semibold text-navy">Connect {apiKeyModal.connectorName}</h3>
              </div>
              <button onClick={() => setApiKeyModal(null)} className="text-gray-400 hover:text-navy">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500">{apiKeyModal.message}</p>
            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApiKeySubmit()}
                className="input mt-1 w-full font-mono text-sm"
                placeholder="Paste your API key here…"
                autoFocus
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApiKeySubmit}
                disabled={!apiKeyValue.trim() || apiKeySaving}
                className="flex items-center gap-2 bg-teal text-white text-sm font-semibold px-4 py-2 rounded hover:bg-teal/90 disabled:opacity-50 transition-colors"
              >
                {apiKeySaving && <Loader2 size={14} className="animate-spin" />}
                {apiKeySaving ? "Saving…" : "Connect"}
              </button>
              <button
                onClick={() => setApiKeyModal(null)}
                className="text-sm text-gray-500 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: Agency-only ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-navy">Agency connectors</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {tier === "agency" || tier === "enterprise"
                ? "All agency connectors are available on your plan."
                : "Available on the Agency plan and above."}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENCY_ONLY.map((id) => {
            const isLocked = tier !== "agency" && tier !== "enterprise";
            if (isLocked) {
              return <LockedConnectorCard key={id} connector={CONNECTORS[id]} upgradeTarget="Agency" />;
            }
            return (
              <ConnectorCard
                key={id}
                connector={CONNECTORS[id]}
                status={connectorMap[id]?.status ?? "disconnected"}
                connectedAt={connectorMap[id]?.connected_at ?? null}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function LockedConnectorCard({
  connector,
  upgradeTarget,
  reason,
}: {
  connector: ConnectorDefinition;
  upgradeTarget?: string;
  reason?: string;
}) {
  return (
    <div className="card opacity-60 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
        <div className="text-center px-4">
          <Lock size={20} className="text-gray-400 mx-auto mb-1.5" />
          {upgradeTarget ? (
            <>
              <p className="text-xs font-medium text-gray-600">Requires {upgradeTarget}</p>
              <Link
                href="/dashboard/settings/billing"
                className="text-xs text-teal hover:underline mt-1 inline-block"
              >
                Upgrade →
              </Link>
            </>
          ) : (
            <p className="text-xs text-gray-500 text-center">{reason}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${connector.color}`}>
          {connector.icon}
        </div>
        <div>
          <h3 className="font-semibold text-navy">{connector.name}</h3>
          <p className="text-xs text-gray-500">{connector.description}</p>
        </div>
      </div>
      <ul className="space-y-1">
        {connector.whatItDoes.slice(0, 3).map((item) => (
          <li key={item} className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-200 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Need to import type here for the LockedConnectorCard
import type { ConnectorDefinition } from "@/lib/connectors/registry";
