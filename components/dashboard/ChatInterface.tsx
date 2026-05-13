"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Copy, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { type ChatMessage } from "@/lib/agent/types";

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

export default function ChatInterface({ initialWorkflow, businessName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(
    initialWorkflow && WORKFLOW_STARTERS[initialWorkflow]
      ? WORKFLOW_STARTERS[initialWorkflow]
      : ""
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isStreaming) return;

    setInput("");
    setError(null);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setIsStreaming(true);

    // Add empty assistant message to stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          workflow: initialWorkflow ?? "general",
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
          const json = line.slice(6);
          try {
            const event = JSON.parse(json);
            if (event.type === "text") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + event.text,
                };
                return updated;
              });
            } else if (event.type === "error") {
              setError(event.error);
              setMessages((prev) => prev.slice(0, -1)); // remove empty assistant msg
            }
          } catch {
            // partial chunk, ignore
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, initialWorkflow]);

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

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const clearChat = () => {
    if (isStreaming) stopStreaming();
    setMessages([]);
    setError(null);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen
            businessName={businessName}
            onSuggestion={(s) => sendMessage(s)}
          />
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
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors"
              >
                <RotateCcw size={12} />
                New chat
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TripDesk anything about your travel business…"
                className="w-full px-4 py-3 pr-12 border border-border rounded-card bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none text-sm leading-relaxed"
                rows={1}
                disabled={isStreaming}
              />
            </div>

            {isStreaming ? (
              <Button
                variant="danger"
                size="md"
                onClick={stopStreaming}
                className="flex-shrink-0 mb-0.5"
              >
                Stop
              </Button>
            ) : (
              <Button
                variant="teal"
                size="md"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="flex-shrink-0 mb-0.5"
              >
                <Send size={16} />
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line · TripDesk may make mistakes — verify all travel advisories and visa info
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  businessName,
  onSuggestion,
}: {
  businessName?: string;
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-teal font-bold text-lg">TD</span>
      </div>
      <h2 className="text-xl font-bold text-navy mb-2">
        What can I help you with{businessName ? `, ${businessName.split(" ")[0]}` : ""}?
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        I can build itineraries, research destinations, write proposals, check visa requirements, and more.
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

function MessageBubble({
  message,
  isCopied,
  onCopy,
  isStreaming,
}: {
  message: ChatMessage;
  isCopied: boolean;
  onCopy: () => void;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] group", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded bg-teal/10 flex items-center justify-center">
              <span className="text-teal text-xs font-bold">TD</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">TripDesk</span>
          </div>
        )}

        <div
          className={cn(
            "rounded-card px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-navy text-white"
              : "bg-white border border-border text-gray-800"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} isStreaming={isStreaming} />
          )}
        </div>

        {!isUser && message.content && (
          <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onCopy}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
            >
              {isCopied ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkdownContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  // Simple markdown renderer — handles the most common patterns TripDesk outputs
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith("### ")) return <h3 key={i} className="font-semibold text-navy mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-navy mt-4 mb-1 text-base">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="font-bold text-navy mt-4 mb-2 text-lg">{line.slice(2)}</h1>;

        // Horizontal rule
        if (line.startsWith("---")) return <hr key={i} className="border-border my-3" />;

        // Bullet list
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
              <InlineMarkdown text={line.slice(2)} />
            </li>
          );
        }

        // Numbered list
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          return (
            <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">
              <InlineMarkdown text={numberedMatch[2]} />
            </li>
          );
        }

        // Table row (simplified)
        if (line.startsWith("|")) {
          return (
            <div key={i} className="font-mono text-xs border-b border-gray-100 py-0.5 overflow-x-auto">
              {line}
            </div>
          );
        }

        // Blockquote / italics note
        if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
          return <p key={i} className="text-xs text-gray-500 italic">{line.slice(1, -1)}</p>;
        }

        // Empty line
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Normal paragraph
        return (
          <p key={i} className="text-sm leading-relaxed">
            <InlineMarkdown text={line} />
          </p>
        );
      })}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-teal animate-pulse rounded-sm ml-0.5" />
      )}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  // Handle **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
