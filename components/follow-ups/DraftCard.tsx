"use client";

import { useTransition, useState } from "react";
import { Send, X, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { approveEmailDraft, skipEmailDraft } from "@/app/dashboard/follow-ups/actions";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  follow_up_day3:    { label: "Day 3 Follow-Up",   color: "bg-blue-100 text-blue-700" },
  follow_up_day7:    { label: "Day 7 Follow-Up",   color: "bg-yellow-100 text-yellow-700" },
  follow_up_day14:   { label: "Day 14 Follow-Up",  color: "bg-orange-100 text-orange-700" },
  post_trip_checkin: { label: "Post-Trip Check-In", color: "bg-teal/10 text-teal" },
  post_trip_review:  { label: "Review Request",    color: "bg-purple-100 text-purple-700" },
};

interface Draft {
  id: string;
  draft_type: string;
  client_name: string;
  client_email: string;
  destination: string | null;
  subject: string;
  body: string;
  created_at: string;
}

export default function DraftCard({ draft }: { draft: Draft }) {
  const [isPendingApprove, startApprove] = useTransition();
  const [isPendingSkip, startSkip] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(draft.body);

  const type = TYPE_LABELS[draft.draft_type] ?? { label: draft.draft_type, color: "bg-gray-100 text-gray-600" };
  const preview = draft.body.slice(0, 160) + (draft.body.length > 160 ? "…" : "");

  return (
    <div className="card border border-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${type.color}`}>
            {type.label}
          </span>
          {draft.destination && (
            <span className="text-xs text-gray-400">· {draft.destination}</span>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(draft.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Client */}
      <p className="text-sm font-semibold text-navy mb-0.5">{draft.client_name}</p>
      <p className="text-xs text-gray-400 mb-3">{draft.client_email}</p>

      {/* Subject */}
      <p className="text-sm font-medium text-gray-700 mb-2">{draft.subject}</p>

      {/* Body — collapsed/expanded/edit */}
      {editing ? (
        <textarea
          className="w-full text-sm text-gray-600 border border-border rounded p-3 min-h-[180px] resize-y focus:outline-none focus:ring-1 focus:ring-teal"
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
        />
      ) : expanded ? (
        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed mb-1">{draft.body}</p>
      ) : (
        <p className="text-sm text-gray-500 leading-relaxed mb-1">{preview}</p>
      )}

      {/* Expand / edit toggles */}
      <div className="flex items-center gap-3 mt-1 mb-4">
        {!editing && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Show less" : "Show full email"}
          </button>
        )}
        <button
          onClick={() => { setEditing((e) => !e); setExpanded(false); }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
        >
          <Pencil size={12} />
          {editing ? "Cancel edit" : "Edit"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          disabled={isPendingApprove || isPendingSkip}
          onClick={() => startApprove(() => approveEmailDraft(draft.id, editing ? editedBody : undefined))}
          className="flex items-center gap-2 bg-teal text-white text-sm font-medium px-4 py-2 rounded hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
          {isPendingApprove ? "Sending…" : "Approve & Send"}
        </button>
        <button
          disabled={isPendingApprove || isPendingSkip}
          onClick={() => startSkip(() => skipEmailDraft(draft.id))}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-navy px-3 py-2 rounded border border-border transition-colors disabled:opacity-50"
        >
          <X size={14} />
          {isPendingSkip ? "Skipping…" : "Skip"}
        </button>
      </div>
    </div>
  );
}
