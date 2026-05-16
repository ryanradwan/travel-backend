"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 text-xs font-medium text-navy border border-border px-3 py-2 rounded hover:bg-gray-50 transition-colors shrink-0"
    >
      {copied ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
