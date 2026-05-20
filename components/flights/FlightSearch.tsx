"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Copy, Check, Plane, AlertTriangle, ArrowLeftRight, Clock, UserCircle, BookmarkCheck, ChevronDown, ChevronUp } from "lucide-react";
import { type FlightOffer, type FlightSegment, type Layover, formatFlightsForProposal } from "@/lib/amadeus/flights";
import AirportInput from "./AirportInput";

const CABINS = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First Class" },
];

interface RecentSearch {
  origin: string;
  originLabel: string;
  destination: string;
  destinationLabel: string;
  departureDate: string;
  returnDate: string;
  adults: string;
  cabin: string;
  tripType: "roundtrip" | "oneway";
}

interface Client {
  id: string;
  name: string;
}

interface FlightSearchProps {
  clients?: Client[];
}

function stopsLabel(n: number) {
  return n === 0 ? "Nonstop" : n === 1 ? "1 stop" : `${n} stops`;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function applyMarkup(price: number, markupPct: number) {
  return Math.ceil(price * (1 + markupPct / 100));
}

const STORAGE_KEY = "tb_recent_flights";

function loadRecent(): RecentSearch[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(search: RecentSearch) {
  const existing = loadRecent().filter(
    (r) => !(r.origin === search.origin && r.destination === search.destination)
  );
  const updated = [search, ...existing].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function FlightSearch({ clients = [] }: FlightSearchProps) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [form, setForm] = useState({
    origin: "", originLabel: "",
    destination: "", destinationLabel: "",
    departureDate: "", returnDate: "", adults: "1", cabin: "ECONOMY",
  });
  const [markupPct, setMarkupPct] = useState(10);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedClient, setSavedClient] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setRecentSearches(loadRecent());
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function swapAirports() {
    setForm((f) => ({
      ...f,
      origin: f.destination, originLabel: f.destinationLabel,
      destination: f.origin, destinationLabel: f.originLabel,
    }));
  }

  function applyRecent(r: RecentSearch) {
    setTripType(r.tripType);
    setForm({
      origin: r.origin, originLabel: r.originLabel,
      destination: r.destination, destinationLabel: r.destinationLabel,
      departureDate: r.departureDate, returnDate: r.returnDate,
      adults: r.adults, cabin: r.cabin,
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!form.origin || !form.destination) {
      setError("Please select both origin and destination airports.");
      return;
    }
    setLoading(true);
    setError(null);
    setFlights(null);
    setSavedClient(null);

    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      departureDate: form.departureDate,
      adults: form.adults,
      cabin: form.cabin,
    });
    if (tripType === "roundtrip" && form.returnDate) params.set("returnDate", form.returnDate);

    try {
      const res = await fetch(`/api/amadeus/flights?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setFlights(data.flights);
      setIsTestMode(data.isTestMode);

      const recent: RecentSearch = {
        origin: form.origin,
        originLabel: form.originLabel || form.origin,
        destination: form.destination,
        destinationLabel: form.destinationLabel || form.destination,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        adults: form.adults,
        cabin: form.cabin,
        tripType,
      };
      saveRecent(recent);
      setRecentSearches(loadRecent());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToClient() {
    if (!flights?.length || !selectedClientId) return;
    setSaving(true);
    try {
      const summary = formatFlightsForProposal(flights, form.origin, form.destination);
      const res = await fetch("/api/flights/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          flightSummary: summary,
          searchParams: {
            origin: form.origin,
            destination: form.destination,
            departureDate: form.departureDate,
            returnDate: form.returnDate,
            adults: form.adults,
            cabin: form.cabin,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedClient(data.clientName);
    } catch {
      setError("Failed to save to client. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function copyAll() {
    if (!flights?.length) return;
    const text = formatFlightsForProposal(flights, form.origin, form.destination);
    navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  function copySingle(f: FlightOffer) {
    const markedUp = applyMarkup(f.pricePerPerson, markupPct);
    const dep = fmtTime(f.departure);
    const arr = fmtTime(f.arrival);
    let text = `${f.airline} — $${markedUp.toLocaleString()}/person\n`;
    text += `Outbound: ${dep} → ${arr} · ${f.duration} · ${stopsLabel(f.stops)}`;
    if (f.returnDeparture && f.returnArrival) {
      text += `\nReturn: ${fmtTime(f.returnDeparture)} → ${fmtTime(f.returnArrival)} · ${f.returnDuration} · ${stopsLabel(f.returnStops ?? 0)}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(f.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const hasMarkup = markupPct > 0;

  return (
    <div className="space-y-6">
      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5">
            <Clock size={12} /> Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyRecent(r)}
                className="text-xs bg-white border border-border rounded-full px-3 py-1.5 hover:border-teal/50 hover:bg-teal/5 transition-colors text-gray-600 flex items-center gap-1.5"
              >
                <Plane size={11} className="text-gray-400" />
                {r.originLabel} → {r.destinationLabel}
                <span className="text-gray-300">·</span>
                <span className="text-gray-400">{r.departureDate}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trip type toggle */}
      <div className="flex gap-2">
        {(["roundtrip", "oneway"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              tripType === t
                ? "bg-navy text-white border-navy"
                : "bg-white text-gray-500 border-border hover:border-navy/40"
            }`}
          >
            {t === "roundtrip" ? "Round trip" : "One way"}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="card space-y-4">
        {/* Origin / Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          <AirportInput
            label="From"
            value={form.originLabel || form.origin}
            onChange={(iata, label) => setForm((f) => ({ ...f, origin: iata, originLabel: label }))}
            placeholder="New York, JFK…"
            required
          />
          <div className="absolute left-1/2 top-7 -translate-x-1/2 z-10 hidden sm:block">
            <button
              type="button"
              onClick={swapAirports}
              className="bg-white border border-border rounded-full p-1.5 hover:bg-gray-50 shadow-sm transition-colors"
              title="Swap airports"
            >
              <ArrowLeftRight size={13} className="text-gray-400" />
            </button>
          </div>
          <AirportInput
            label="To"
            value={form.destinationLabel || form.destination}
            onChange={(iata, label) => setForm((f) => ({ ...f, destination: iata, destinationLabel: label }))}
            placeholder="Rome, FCO…"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Departure date</label>
            <input
              type="date"
              value={form.departureDate}
              onChange={(e) => set("departureDate", e.target.value)}
              required
              min={new Date().toISOString().slice(0, 10)}
              className="input mt-1"
            />
          </div>
          {tripType === "roundtrip" && (
            <div>
              <label className="label">Return date</label>
              <input
                type="date"
                value={form.returnDate}
                onChange={(e) => set("returnDate", e.target.value)}
                min={form.departureDate || new Date().toISOString().slice(0, 10)}
                className="input mt-1"
              />
            </div>
          )}
        </div>

        {/* Passengers, cabin, markup */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Passengers</label>
            <input
              type="number" min="1" max="9"
              value={form.adults}
              onChange={(e) => set("adults", e.target.value)}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="label">Cabin class</label>
            <select value={form.cabin} onChange={(e) => set("cabin", e.target.value)} className="input mt-1">
              {CABINS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Your markup %</label>
            <div className="relative mt-1">
              <input
                type="number" min="0" max="100"
                value={markupPct}
                onChange={(e) => setMarkupPct(Math.max(0, parseInt(e.target.value) || 0))}
                className="input pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Client selector */}
        {clients.length > 0 && (
          <div>
            <label className="label flex items-center gap-1.5">
              <UserCircle size={13} className="text-gray-400" />
              Searching for client <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="input mt-1"
            >
              <option value="">— Select a client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? "Searching live fares…" : "Search flights"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Test mode banner */}
      {flights && isTestMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span><strong>Test mode:</strong> Prices shown are Duffel sandbox data, not live fares.</span>
        </div>
      )}

      {/* No results */}
      {flights && flights.length === 0 && (
        <div className="card text-center py-10">
          <Plane size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No flights found</p>
          <p className="text-gray-400 text-sm mt-1">Try different dates or airports.</p>
        </div>
      )}

      {/* Results */}
      {flights && flights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-navy">{flights.length} options found</p>
            <div className="flex items-center gap-2">
              {/* Save to client */}
              {clients.length > 0 && (
                savedClient ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-teal border border-teal/30 bg-teal/5 px-3 py-1.5 rounded">
                    <BookmarkCheck size={13} />
                    Saved to {savedClient}
                  </span>
                ) : (
                  <button
                    onClick={handleSaveToClient}
                    disabled={!selectedClientId || saving}
                    className="flex items-center gap-1.5 text-xs font-medium text-navy border border-border px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!selectedClientId ? "Select a client above first" : "Save this quote to the client"}
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <UserCircle size={13} />}
                    {saving ? "Saving…" : selectedClientId ? "Save to client" : "Select client to save"}
                  </button>
                )
              )}
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 text-xs font-medium text-navy border border-border px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                {copied === "all" ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
                {copied === "all" ? "Copied!" : "Copy all"}
              </button>
            </div>
          </div>

          {/* Markup legend */}
          {hasMarkup && (
            <div className="bg-teal/5 border border-teal/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-teal">
              <span className="font-semibold">Markup: {markupPct}%</span>
              <span className="text-gray-400">· Client price shown in navy · Net fare in gray</span>
            </div>
          )}

          {(() => {
            const prices = flights.map((f) => f.pricePerPerson);
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            return flights.map((f) => {
              const clientPricePerPerson = applyMarkup(f.pricePerPerson, markupPct);
              const clientTotal = applyMarkup(f.price, markupPct);
              const isExpanded = expandedId === f.id;
              const pricePct = maxP === minP ? 0 : ((f.pricePerPerson - minP) / (maxP - minP)) * 100;
              const hasDetail = f.stops > 0 || (f.returnStops ?? 0) > 0;
              return (
                <div key={f.id} className="card border border-border hover:border-teal/40 transition-colors overflow-hidden p-0">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-bold text-navy">{f.airline}</span>
                          <span className="text-xs text-gray-400">{f.airlineCode}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                            {f.cabin.replace(/_/g, " ").toLowerCase()}
                          </span>
                          <PriceBadge pct={pricePct} isOnly={minP === maxP} />
                        </div>

                        <div className="flex items-center gap-3 text-sm flex-wrap">
                          <span className="text-xs font-semibold text-gray-400 uppercase w-6">Out</span>
                          <span className="font-semibold text-gray-800">{fmtTime(f.departure)}</span>
                          <span className="text-gray-300">→</span>
                          <span className="font-semibold text-gray-800">{fmtTime(f.arrival)}</span>
                          <span className="text-xs text-gray-400">{fmtDate(f.arrival)}</span>
                          <span className="text-xs text-gray-400">· {f.duration}</span>
                          <span className={`text-xs font-medium ${f.stops === 0 ? "text-teal" : "text-gray-500"}`}>
                            {stopsLabel(f.stops)}
                          </span>
                          {f.segments[0]?.flightNumber && (
                            <span className="text-xs text-gray-300">{f.segments[0].flightNumber}</span>
                          )}
                        </div>

                        {f.returnDeparture && (
                          <div className="flex items-center gap-3 text-sm mt-1 flex-wrap">
                            <span className="text-xs font-semibold text-gray-400 uppercase w-6">Ret</span>
                            <span className="font-semibold text-gray-800">{fmtTime(f.returnDeparture)}</span>
                            <span className="text-gray-300">→</span>
                            <span className="font-semibold text-gray-800">{fmtTime(f.returnArrival!)}</span>
                            <span className="text-xs text-gray-400">{fmtDate(f.returnArrival!)}</span>
                            <span className="text-xs text-gray-400">· {f.returnDuration}</span>
                            <span className={`text-xs font-medium ${(f.returnStops ?? 0) === 0 ? "text-teal" : "text-gray-500"}`}>
                              {stopsLabel(f.returnStops ?? 0)}
                            </span>
                            {f.returnSegments?.[0]?.flightNumber && (
                              <span className="text-xs text-gray-300">{f.returnSegments[0].flightNumber}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        <div>
                          <p className="text-xl font-bold text-navy">${clientPricePerPerson.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">per person{hasMarkup ? " (client)" : ""}</p>
                          <p className="text-xs text-gray-400">${clientTotal.toLocaleString()} total</p>
                          {hasMarkup && (
                            <p className="text-xs text-gray-300 mt-0.5">Net: ${f.pricePerPerson.toLocaleString()}/pp</p>
                          )}
                        </div>
                        <button
                          onClick={() => copySingle(f)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
                        >
                          {copied === f.id ? <Check size={12} className="text-teal" /> : <Copy size={12} />}
                          {copied === f.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Price bar */}
                    <PriceBar pct={pricePct} isOnly={minP === maxP} />
                  </div>

                  {/* Segment detail toggle — only on connecting flights */}
                  {hasDetail && (
                    <>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : f.id)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-navy hover:bg-gray-50 transition-colors py-2 border-t border-border"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? "Hide" : "Show"} flight details &amp; layovers
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border bg-gray-50 px-5 py-4 space-y-4">
                          <SegmentDetails label="Outbound" segments={f.segments} layovers={f.layovers} />
                          {f.returnSegments && f.returnSegments.length > 0 && (
                            <SegmentDetails label="Return" segments={f.returnSegments} layovers={f.returnLayovers ?? []} />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            });
          })()}

          <p className="text-xs text-gray-400 text-center pt-1">
            Live fares from Duffel · Subject to availability · Lock in promptly
          </p>
        </div>
      )}
    </div>
  );
}

function PriceBadge({ pct, isOnly }: { pct: number; isOnly: boolean }) {
  if (isOnly) return null;
  if (pct <= 33) return <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Best price</span>;
  if (pct <= 66) return <span className="text-xs font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">Mid range</span>;
  return <span className="text-xs font-medium text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Highest</span>;
}

function PriceBar({ pct, isOnly }: { pct: number; isOnly: boolean }) {
  if (isOnly) return null;
  const color = pct <= 33 ? "bg-green-400" : pct <= 66 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(4, pct)}%` }} />
    </div>
  );
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function SegmentDetails({ label, segments, layovers }: { label: string; segments: FlightSegment[]; layovers: Layover[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-navy w-10">{seg.flightNumber || "—"}</span>
              <span className="font-medium text-gray-700">{seg.origin}</span>
              <span className="text-gray-300">→</span>
              <span className="font-medium text-gray-700">{seg.destination}</span>
              <span className="text-gray-400">{fmtDateTime(seg.departure)} – {fmtDateTime(seg.arrival)}</span>
              <span className="text-gray-400">· {seg.duration}</span>
            </div>
            {layovers[i] && (
              <div className="ml-10 mt-1 flex items-center gap-1.5 text-xs text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Layover in <span className="font-semibold">{layovers[i].airport}</span>
                <span className="text-amber-500">· {layovers[i].durationLabel}</span>
                {layovers[i].durationMins < 60 && (
                  <span className="text-red-500 font-medium">(tight connection)</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
