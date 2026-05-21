"use client";

import React from "react";

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const bold = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
    // Italic *text* (not **)
    const italic = remaining.match(/^(.*?)(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)(.*)/);
    // Inline code `text`
    const code = remaining.match(/^(.*?)`(.+?)`(.*)/);

    const boldIdx = bold ? bold[1].length : Infinity;
    const italicIdx = italic ? italic[1].length : Infinity;
    const codeIdx = code ? code[1].length : Infinity;

    const first = Math.min(boldIdx, italicIdx, codeIdx);

    if (first === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (first === boldIdx && bold) {
      if (bold[1]) parts.push(<span key={key++}>{bold[1]}</span>);
      parts.push(<strong key={key++} className="font-semibold text-gray-800">{bold[2]}</strong>);
      remaining = bold[3];
    } else if (first === italicIdx && italic) {
      if (italic[1]) parts.push(<span key={key++}>{italic[1]}</span>);
      parts.push(<em key={key++}>{italic[2]}</em>);
      remaining = italic[4];
    } else if (first === codeIdx && code) {
      if (code[1]) parts.push(<span key={key++}>{code[1]}</span>);
      parts.push(
        <code key={key++} className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded font-mono">
          {code[2]}
        </code>
      );
      remaining = code[3];
    }
  }

  return parts;
}

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = "" }: Props) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // H1
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="text-lg font-bold text-navy mt-4 mb-1">
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }
        // H2
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="text-base font-bold text-navy border-b border-border pb-1 mt-5 mb-1">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        // H3
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-semibold text-navy mt-4 mb-0.5">
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }
        // Horizontal rule
        if (trimmed.startsWith("---") && trimmed.replace(/-/g, "").trim() === "") {
          return <hr key={i} className="border-border my-2" />;
        }
        // Table (pass through as preformatted)
        if (trimmed.startsWith("|")) {
          return (
            <pre key={i} className="text-xs bg-gray-50 border border-border rounded-lg p-3 overflow-x-auto">
              {trimmed}
            </pre>
          );
        }
        // Unordered list
        const lines = trimmed.split("\n");
        const isUl = lines.every((l) => /^[-*+]\s/.test(l.trim()) || l.trim() === "");
        if (isUl && lines.some((l) => /^[-*+]\s/.test(l.trim()))) {
          return (
            <ul key={i} className="list-disc ml-5 space-y-1">
              {lines.filter((l) => l.trim()).map((item, j) => (
                <li key={j} className="text-sm text-gray-700 leading-relaxed">
                  {renderInline(item.replace(/^[-*+]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        // Ordered list
        const isOl = lines.every((l) => /^\d+[.)]\s/.test(l.trim()) || l.trim() === "");
        if (isOl && lines.some((l) => /^\d+[.)]\s/.test(l.trim()))) {
          return (
            <ol key={i} className="list-decimal ml-5 space-y-1">
              {lines.filter((l) => l.trim()).map((item, j) => (
                <li key={j} className="text-sm text-gray-700 leading-relaxed">
                  {renderInline(item.replace(/^\d+[.)]\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }
        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-teal/30 pl-4 text-sm text-gray-500 italic">
              {renderInline(trimmed.slice(2))}
            </blockquote>
          );
        }
        // Plain paragraph (may contain inline formatting)
        return (
          <p key={i} className="text-sm text-gray-700 leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
