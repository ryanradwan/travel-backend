"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Copy, CheckCheck, Paperclip, X, FileText, Image, File, Globe, Zap, MessageCircle } from "lucide-react";
import { classifyIntent } from "@/lib/agent/intent";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { type ChatMessage } from "@/lib/agent/types";

interface AttachedFile {
  name: string;
  type: string;
  data: string; // base64
  size: number;
}

interface ChatInterfaceProps {
  initialWorkflow?: string;
  businessName?: string;
}

const WORKFLOW_STARTERS: Record<string, string> = {
  itinerary: "Build a client itinerary proposal for ",
  research: "Research the destination ",
  package: "Build and publish a tour package for ",
};

const SUGGESTIONS = [
  "Build a 7-day Italy itinerary for a couple celebrating their anniversary",
  "Research Thailand — best time to visit, visa requirements, and average costs",
  "Write a follow-up email to a client who just returned from Bali",
  "Create a tour package description for a 10-day Morocco adventure",
  "What are the current US State Dept travel advisories for Southeast Asia?",
  "Draft social media posts announcing a new Costa Rica eco-tour",
];

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "text/plain", "text/csv",
].join(",");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <Image size={12} />;
  if (type === "application/pdf") return <FileText size={12} />;
  return <File size={12} />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ChatInterface({ initialWorkflow, businessName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(
    initialWorkflow && WORKFLOW_STARTERS[initialWorkflow]
      ? WORKFLOW_STARTERS[initialWorkflow]
      : ""
  );
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    if (attachedFiles.length + selected.length > 5) {
      setFileError("Maximum 5 files at a time.");
      return;
    }

    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setFileError(`${oversized.name} is too large. Maximum 5MB per file.`);
      return;
    }

    const newFiles: AttachedFile[] = await Promise.all(
      selected.map(async (f) => ({
        name: f.name,
        type: f.type,
        data: await readFileAsBase64(f),
        size: f.size,
      }))
    );

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    // Reset input so same file can be re-attached
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if ((!userText && attachedFiles.length === 0) || isStreaming) return;

    const filesToSend = [...attachedFiles];
    setInput("");
    setAttachedFiles([]);
    setFileError(null);
    setError(null);

    const displayContent = userText || `[${filesToSend.map((f) => f.name).join(", ")}]`;
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: displayContent, files: filesToSend },
    ];
    setMessages(newMessages);
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          workflow: initialWorkflow ?? "general",
          files: filesToSend.length > 0 ? filesToSend : undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "searching") {
              setIsSearching(true);
            } else if (event.type === "text") {
              setIsSearching(false);
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + event.text,
                };
                return updated;
              });
            } else if (event.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  isTask: event.isTask ?? false,
                };
                return updated;
              });
            } else if (event.type === "error") {
              setError(event.error);
              setMessages((prev) => prev.slice(0, -1));
            }
          } catch {
            // partial chunk
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
      setIsSearching(false);
    }
  }, [input, attachedFiles, messages, isStreaming, initialWorkflow]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content: string, idx: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stopStreaming = () => { abortRef.current?.abort(); setIsStreaming(false); };
  const clearChat = () => { if (isStreaming) stopStreaming(); setMessages([]); setError(null); setAttachedFiles([]); };
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen businessName={businessName} onSuggestion={(s) => sendMessage(s)} />
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                message={msg}
                isCopied={copiedId === i}
                onCopy={() => copyMessage(msg.content, i)}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            {isSearching && (
              <div className="flex items-center gap-2 text-xs text-teal bg-teal/5 border border-teal/20 rounded-lg px-3 py-2 w-fit">
                <Globe size={13} className="animate-pulse" />
                Searching the web for live information…
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {!isEmpty && (
            <div className="flex justify-end mb-2">
              <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors">
                <RotateCcw size={12} /> New chat
              </button>
            </div>
          )}

          {/* File attachment previews */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-border rounded-lg px-2.5 py-1.5 text-xs text-navy">
                  {fileIcon(f.type)}
                  <span className="max-w-[140px] truncate">{f.name}</span>
                  <span className="text-gray-400">{formatBytes(f.size)}</span>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors ml-0.5">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fileError && (
            <p className="text-xs text-red-500 mb-2">{fileError}</p>
          )}

          <div className="flex gap-2 items-end">
            {/* File attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || attachedFiles.length >= 5}
              className="flex-shrink-0 mb-0.5 p-2 text-gray-400 hover:text-navy hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40"
              title="Attach file (PDF, image, or text — max 5MB)"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={attachedFiles.length > 0 ? "Add a message about your file(s)…" : "Ask a question or run a task…"}
                className="w-full px-4 py-3 border border-border rounded-card bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none text-sm leading-relaxed"
                rows={1}
                disabled={isStreaming}
              />
            </div>

            {isStreaming ? (
              <Button variant="danger" size="md" onClick={stopStreaming} className="flex-shrink-0 mb-0.5">
                Stop
              </Button>
            ) : (
              <Button
                variant="teal"
                size="md"
                onClick={() => sendMessage()}
                disabled={!input.trim() && attachedFiles.length === 0}
                className="flex-shrink-0 mb-0.5"
              >
                <Send size={16} />
              </Button>
            )}
          </div>

          {/* Intent indicator */}
          {input.trim() && !isStreaming && (
            <div className="flex items-center gap-1.5 mt-2">
              {classifyIntent(input) === "task" ? (
                <>
                  <Zap size={11} className="text-teal" />
                  <span className="text-xs text-teal font-medium">Task — uses AI usage</span>
                </>
              ) : (
                <>
                  <MessageCircle size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Question — free</span>
                </>
              )}
            </div>
          )}

          {!input.trim() && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Questions are free · Tasks draw from your monthly AI usage · Press Enter to send
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ businessName, onSuggestion }: { businessName?: string; onSuggestion: (s: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-teal font-bold text-lg">TD</span>
      </div>
      <h2 className="text-xl font-bold text-navy mb-2">
        What can I help you with{businessName ? `, ${businessName.split(" ")[0]}` : ""}?
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        I can build itineraries, research destinations, write proposals, check visa requirements, and more. You can also attach PDFs, images, or documents.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="p-3.5 border border-border rounded-card text-sm text-navy hover:border-teal hover:bg-teal/5 transition-all text-left leading-snug"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, isCopied, onCopy, isStreaming }: {
  message: ChatMessage; isCopied: boolean; onCopy: () => void; isStreaming: boolean;
}) {
  const isUser = message.role === "user";
  const files = (message as ChatMessage & { files?: AttachedFile[] }).files ?? [];

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] group", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded bg-teal/10 flex items-center justify-center">
              <span className="text-teal text-xs font-bold">TD</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">TravelBackend</span>
          </div>
        )}

        {/* File attachment indicators on user messages */}
        {isUser && files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end mb-1.5">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-navy/10 text-navy text-xs px-2 py-1 rounded-lg">
                {fileIcon(f.type)}
                <span className="max-w-[120px] truncate">{f.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className={cn(
          "rounded-card px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-navy text-white" : "bg-white border border-border text-gray-800"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} isStreaming={isStreaming} />
          )}
        </div>

        {!isUser && message.content && (
          <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onCopy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors">
              {isCopied ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
              {isCopied ? "Copied" : "Copy"}
            </button>
            {message.isTask !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${message.isTask ? "bg-teal/10 text-teal" : "bg-gray-100 text-gray-400"}`}>
                {message.isTask ? "1 task used" : "Free question"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MarkdownContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="font-semibold text-navy mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-navy mt-4 mb-1 text-base">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="font-bold text-navy mt-4 mb-2 text-lg">{line.slice(2)}</h1>;
        if (line.startsWith("---")) return <hr key={i} className="border-border my-3" />;
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <li key={i} className="ml-4 list-disc text-sm leading-relaxed"><InlineMarkdown text={line.slice(2)} /></li>;
        }
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed"><InlineMarkdown text={numberedMatch[2]} /></li>;
        }
        if (line.startsWith("|")) {
          return <div key={i} className="font-mono text-xs border-b border-gray-100 py-0.5 overflow-x-auto">{line}</div>;
        }
        if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
          return <p key={i} className="text-xs text-gray-500 italic">{line.slice(1, -1)}</p>;
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed"><InlineMarkdown text={line} /></p>;
      })}
      {isStreaming && <span className="inline-block w-2 h-4 bg-teal animate-pulse rounded-sm ml-0.5" />}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
