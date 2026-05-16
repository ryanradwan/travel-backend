"use client";

import { useTransition, useState } from "react";
import { Send, Archive, RefreshCw, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { sendInquiryResponse, archiveInquiry, retriageInquiry } from "@/app/dashboard/inbox/actions";

const CATEGORY_STYLES: Record<string, string> = {
  honeymoon:  "bg-pink-100 text-pink-700",
  family:     "bg-blue-100 text-blue-700",
  adventure:  "bg-orange-100 text-orange-700",
  corporate:  "bg-gray-100 text-gray-700",
  solo:       "bg-purple-100 text-purple-700",
  group:      "bg-yellow-100 text-yellow-700",
  luxury:     "bg-amber-100 text-amber-700",
  budget:     "bg-green-100 text-green-700",
  other:      "bg-gray-100 text-gray-600",
};

interface Inquiry {
  id: string;
  source: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  inquiry_text: string;
  category: string | null;
  destination: string | null;
  travel_dates: string | null;
  budget: string | null;
  group_size: string | null;
  ai_summary: string | null;
  draft_response: string | null;
  status: string;
  created_at: string;
}

export default function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [pendingSend, startSend] = useTransition();
  const [pendingArchive, startArchive] = useTransition();
  const [pendingRetriage, startRetriage] = useTransition();
  const [showFull, setShowFull] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(inquiry.draft_response ?? "");

  const isPending = pendingSend || pendingArchive || pendingRetriage;
  const categoryStyle = inquiry.category ? (CATEGORY_STYLES[inquiry.category] ?? CATEGORY_STYLES.other) : "";

  return (
    <div className="card border border-border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-navy">{inquiry.client_name}</span>
            {inquiry.category && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${categoryStyle}`}>
                {inquiry.category}
              </span>
            )}
            {inquiry.status === "new" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                Triage pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{inquiry.client_email}
            {inquiry.client_phone && <span className="ml-2">· {inquiry.client_phone}</span>}
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(inquiry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Extracted details */}
      {(inquiry.destination || inquiry.travel_dates || inquiry.budget || inquiry.group_size) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {inquiry.destination && <Detail label="Destination" value={inquiry.destination} />}
          {inquiry.travel_dates && <Detail label="Dates" value={inquiry.travel_dates} />}
          {inquiry.group_size && <Detail label="Travelers" value={inquiry.group_size} />}
          {inquiry.budget && <Detail label="Budget" value={inquiry.budget} />}
        </div>
      )}

      {/* AI summary */}
      {inquiry.ai_summary && (
        <div className="bg-navy/5 border border-navy/10 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-navy mb-1">AI Summary</p>
          <p className="text-sm text-gray-600 leading-relaxed">{inquiry.ai_summary}</p>
        </div>
      )}

      {/* Original inquiry */}
      <div>
        <button
          onClick={() => setShowFull((s) => !s)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors mb-2"
        >
          {showFull ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showFull ? "Hide" : "Show"} original inquiry
        </button>
        {showFull && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 leading-relaxed">
            {inquiry.inquiry_text}
          </p>
        )}
      </div>

      {/* Draft response */}
      {inquiry.status !== "new" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-navy">Draft Response</p>
            <button
              onClick={() => setEditing((e) => !e)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
            >
              <Pencil size={11} /> {editing ? "Done editing" : "Edit"}
            </button>
          </div>
          {editing ? (
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={8}
              className="w-full text-sm text-gray-600 border border-border rounded-lg p-3 resize-y focus:outline-none focus:ring-1 focus:ring-teal"
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">
              {draftBody || <span className="text-gray-400 italic">No draft yet.</span>}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border">
        {inquiry.status !== "responded" && draftBody && (
          <button
            disabled={isPending}
            onClick={() => startSend(() => sendInquiryResponse(inquiry.id, draftBody))}
            className="flex items-center gap-2 bg-teal text-white text-sm font-medium px-4 py-2 rounded hover:bg-teal/90 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
            {pendingSend ? "Sending…" : "Approve & Send"}
          </button>
        )}
        {inquiry.status === "new" && (
          <button
            disabled={isPending}
            onClick={() => startRetriage(() => retriageInquiry(inquiry.id))}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 border border-blue-200 px-3 py-2 rounded hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={pendingRetriage ? "animate-spin" : ""} />
            {pendingRetriage ? "Triaging…" : "Run AI Triage"}
          </button>
        )}
        <button
          disabled={isPending}
          onClick={() => startArchive(() => archiveInquiry(inquiry.id))}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 border border-border px-3 py-2 rounded hover:text-navy disabled:opacity-50 transition-colors ml-auto"
        >
          <Archive size={14} />
          {pendingArchive ? "Archiving…" : "Archive"}
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-navy truncate">{value}</p>
    </div>
  );
}
