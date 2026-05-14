"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Props { token: string; brandColor: string; clientName: string }

export default function PortalApprovalButton({ token, brandColor, clientName }: Props) {
  const [phase, setPhase] = useState<"idle" | "confirming" | "done" | "declined">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function approve() {
    setSubmitting(true);
    const res = await fetch(`/api/portal/${token}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    if (res.ok) setPhase("done");
    setSubmitting(false);
  }

  async function decline() {
    setSubmitting(true);
    const res = await fetch(`/api/portal/${token}/decline`, { method: "POST" });
    if (res.ok) setPhase("declined");
    setSubmitting(false);
  }

  if (phase === "done") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-green-700">Proposal approved!</p>
        <p className="text-green-600 text-sm mt-1">Your advisor has been notified and will be in touch shortly.</p>
      </div>
    );
  }

  if (phase === "declined") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="font-semibold text-gray-600">You&apos;ve declined this proposal.</p>
        <p className="text-gray-400 text-sm mt-1">Your advisor has been notified.</p>
      </div>
    );
  }

  if (phase === "confirming") {
    return (
      <div className="bg-white border-2 border-green-400 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Confirm approval</h3>
        <p className="text-sm text-gray-500">By approving, you confirm you&apos;d like to proceed with this proposal. Your advisor will be in touch to confirm availability and arrange the deposit.</p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-green-400"
          rows={3}
          placeholder="Optional message to your advisor..."
        />
        <div className="flex gap-3">
          <button
            onClick={approve}
            disabled={submitting}
            className="flex-1 py-3 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: brandColor }}
          >
            <CheckCircle2 size={16} />
            Yes, I approve this proposal
          </button>
          <button onClick={() => setPhase("idle")} className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-1">Ready to proceed?</h3>
      <p className="text-sm text-gray-500 mb-4">Let {clientName?.split(" ")[0] ? "your advisor" : "us"} know you&apos;d like to move forward with this proposal.</p>
      <div className="flex gap-3">
        <button
          onClick={() => setPhase("confirming")}
          className="flex-1 py-3 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: brandColor }}
        >
          <CheckCircle2 size={16} />
          Approve this proposal
        </button>
        <button
          onClick={decline}
          className="px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
        >
          <X size={14} />
          Decline
        </button>
      </div>
    </div>
  );
}
