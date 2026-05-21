"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, User, TrendingUp, Clock, Loader2, X } from "lucide-react";

interface SearchResults {
  clients: { id: string; name: string; email: string | null; nationality: string | null }[];
  bookings: { id: string; client_name: string; destination: string; status: string; gross_value: number }[];
  tasks: { id: string; input: string; task_type: string; status: string; created_at: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  itinerary: "Itinerary",
  research: "Report",
  package: "Package",
  general: "Chat",
  custom_skill: "Skill",
  flight_quote: "Flight",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-600",
  failed: "text-red-500",
  confirmed: "text-teal",
  proposal_sent: "text-blue-500",
  cancelled: "text-gray-400",
};

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalResults = results
    ? results.clients.length + results.bookings.length + results.tasks.length
    : 0;

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json() as SearchResults;
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setResults(null); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(val), 300);
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  }

  function clear() {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      {/* Search trigger */}
      <div
        className="flex items-center gap-2 bg-gray-50 border border-border rounded-lg px-3 py-2 cursor-text hover:border-gray-300 transition-colors"
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search clients, pipeline, tasks…"
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0"
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {loading && <Loader2 size={13} className="text-gray-400 animate-spin" />}
          {query && !loading && (
            <button onClick={clear} className="text-gray-400 hover:text-navy">
              <X size={13} />
            </button>
          )}
          {!query && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {results && totalResults === 0 && !loading && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">Try a client name, destination, or task description</p>
            </div>
          )}

          {results && results.clients.length > 0 && (
            <ResultSection label="Clients" icon={<User size={12} />}>
              {results.clients.map((c) => (
                <ResultRow
                  key={c.id}
                  primary={c.name}
                  secondary={[c.email, c.nationality].filter(Boolean).join(" · ") || "No details"}
                  onClick={() => navigate(`/dashboard/clients/${c.id}`)}
                />
              ))}
            </ResultSection>
          )}

          {results && results.bookings.length > 0 && (
            <ResultSection label="Pipeline" icon={<TrendingUp size={12} />}>
              {results.bookings.map((b) => (
                <ResultRow
                  key={b.id}
                  primary={`${b.client_name} — ${b.destination}`}
                  secondary={
                    <span className="flex items-center gap-2">
                      <span className={`capitalize ${STATUS_COLORS[b.status] ?? "text-gray-400"}`}>
                        {b.status.replace(/_/g, " ")}
                      </span>
                      {b.gross_value > 0 && (
                        <span className="text-gray-400">· ${Number(b.gross_value).toLocaleString()}</span>
                      )}
                    </span>
                  }
                  onClick={() => navigate("/dashboard/pipeline")}
                />
              ))}
            </ResultSection>
          )}

          {results && results.tasks.length > 0 && (
            <ResultSection label="Task History" icon={<Clock size={12} />}>
              {results.tasks.map((t) => (
                <ResultRow
                  key={t.id}
                  primary={t.input.slice(0, 80) + (t.input.length > 80 ? "…" : "")}
                  secondary={
                    <span className="flex items-center gap-2">
                      <span className="text-gray-400">{TYPE_LABEL[t.task_type] ?? t.task_type}</span>
                      <span className={`capitalize ${STATUS_COLORS[t.status] ?? "text-gray-400"}`}>
                        · {t.status}
                      </span>
                    </span>
                  }
                  onClick={() => navigate(`/dashboard/tasks/${t.id}`)}
                />
              ))}
            </ResultSection>
          )}

          {!results && loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
              <Loader2 size={15} className="animate-spin" />
              Searching…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({ label, icon, children }: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border-b border-border">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );
}

function ResultRow({ primary, secondary, onClick }: {
  primary: string;
  secondary: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-border last:border-0 group"
    >
      <p className="text-sm font-medium text-navy group-hover:text-teal transition-colors truncate">
        {primary}
      </p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{secondary}</p>
    </button>
  );
}
