"use client";

import { useState } from "react";
import { Download, Share2, CheckCheck, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface ProposalActionsProps {
  content: string;
  taskId?: string;
}

export default function ProposalActions({ content, taskId }: ProposalActionsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", title: "Travel Proposal" });

  async function downloadPdf() {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/proposals/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title: form.title, clientName: form.clientName || undefined }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function createShareLink() {
    if (!form.clientName.trim()) return;
    setShareLoading(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          clientName: form.clientName,
          clientEmail: form.clientEmail || undefined,
          title: form.title,
          content,
        }),
      });
      const data = await res.json();
      if (!data.shareToken) throw new Error("Failed");
      const link = `${window.location.origin}/portal/${data.shareToken}`;
      setShareLink(link);
    } catch {
      alert("Failed to create share link. Please try again.");
    } finally {
      setShareLoading(false);
    }
  }

  async function copyLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 size={14} className="mr-1.5" />
          Share with client
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadPdf}
          loading={pdfLoading}
        >
          {!pdfLoading && <Download size={14} className="mr-1.5" />}
          Download PDF
        </Button>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-navy">Share proposal with client</h3>
              <button onClick={() => { setShowShareModal(false); setShareLink(null); }} className="text-gray-400 hover:text-navy">
                <X size={18} />
              </button>
            </div>

            {!shareLink ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Proposal title</label>
                  <input
                    className="input mt-1"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. 7-Day Italy Itinerary — Johnson Family"
                  />
                </div>
                <div>
                  <label className="label">Client name <span className="text-red-400">*</span></label>
                  <input
                    className="input mt-1"
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="label">Client email (optional)</label>
                  <input
                    className="input mt-1"
                    type="email"
                    value={form.clientEmail}
                    onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                    placeholder="sarah@example.com"
                  />
                  <p className="text-xs text-gray-400 mt-1">If provided, client will see their name on the portal.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="teal"
                    size="md"
                    onClick={createShareLink}
                    loading={shareLoading}
                    disabled={!form.clientName.trim()}
                    className="flex-1"
                  >
                    Generate share link
                  </Button>
                  <Button variant="outline" size="md" onClick={() => setShowShareModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  Link created! Share this with {form.clientName} — they can view the proposal and approve it.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareLink}
                    className="input text-sm flex-1 bg-gray-50 font-mono text-xs"
                  />
                  <button
                    onClick={copyLink}
                    className="flex-shrink-0 p-2 border border-border rounded hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <CheckCheck size={16} className="text-green-500" /> : <Share2 size={16} className="text-gray-500" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400">Link is valid for 30 days. You can track approval status in Task History.</p>
                <Button variant="teal" size="md" onClick={copyLink} className="w-full">
                  {copied ? "Copied!" : "Copy link"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
