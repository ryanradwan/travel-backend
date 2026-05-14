"use client";

import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";

export default function TemplateCopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-1.5 rounded text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors"
      title="Copy template"
    >
      {copied ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}
