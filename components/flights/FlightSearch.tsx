"use client";

import { useState } from "react";
import { Search, Loader2, Copy, Check, Plane, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { type FlightOffer, formatFlightsForProposal } from "@/lib/amadeus/flights";
import AirportInput from "./AirportInput";

const CABINS = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First Class" },
];

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

export default function FlightSearch() {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [form, setForm] = useState({
    origin: "", destination: "", departureDate: "", returnDate: "", adults: "1", cabin: "ECONOMY",
  });
  const [markupPct, setMarkupPct] = useState(10);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function swapAirports() {
    setForm((f) => ({ ...f, origin: f.destination, destination: f.origin }));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
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
    const isRoundTrip = !!f.returnDeparture;
    const dep = fmtTime(f.departure);
    const arr = fmtTime(f.arrival);
    const stops = stopsLabel(f.stops);
    let text = `${f.airline} — $${markedUp.toLocaleString()}/person\n`;
    text += `Outbound: ${dep} → ${arr} · ${f.duration} · ${stops}`;
    if (isRoundTrip && f.returnDeparture && f.returnArrival) {
      text += `\nReturn: ${fmtTime(f.returnDeparture)} → ${fmtTime(f.returnArrival)} · ${f.returnDuration} · ${stopsLabel(f.returnStops ?? 0)}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(f.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const hasMarkup = markupPct > 0;

  return (
    <div className="space-y-6">
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
        {/* Origin / Destination with swap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          <AirportInput
            label="From"
            value={form.origin}
            onChange={(v) => set("origin", v)}
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
            value={form.destination}
            onChange={(v) => set("destination", v)}
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
          <span><strong>Test mode:</strong> Prices shown are Duffel sandbox data, not live fares. Switch to a live Duffel API key to see real prices.</span>
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">{flights.length} options found</p>
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 text-xs font-medium text-navy border border-border px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              {copied === "all" ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
              {copied === "all" ? "Copied!" : "Copy all to proposal"}
            </button>
          </div>

          {/* Markup legend */}
          {hasMarkup && (
            <div className="bg-teal/5 border border-teal/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-teal">
              <span className="font-semibold">Markup active: {markupPct}%</span>
              <span className="text-gray-400">· Net fare shown in gray · Client price shown in navy</span>
            </div>
          )}

          {flights.map((f) => {
            const clientPricePerPerson = applyMarkup(f.pricePerPerson, markupPct);
            const clientTotal = applyMarkup(f.price, markupPct);
            return (
              <div key={f.id} className="card border border-border hover:border-teal/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-navy">{f.airline}</span>
                      <span className="text-xs text-gray-400">{f.airlineCode}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {f.cabin.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>

                    {/* Outbound */}
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Out</span>
                      <span className="font-semibold text-gray-800">{fmtTime(f.departure)}</span>
                      <span className="text-gray-300">→</span>
                      <span className="font-semibold text-gray-800">{fmtTime(f.arrival)}</span>
                      <span className="text-xs text-gray-400">{fmtDate(f.arrival)}</span>
                      <span className="text-xs text-gray-400">· {f.duration}</span>
                      <span className={`text-xs font-medium ${f.stops === 0 ? "text-teal" : "text-gray-500"}`}>
                        {stopsLabel(f.stops)}
                      </span>
                    </div>

                    {/* Return leg */}
                    {f.returnDeparture && (
                      <div className="flex items-center gap-3 text-sm mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Ret</span>
                        <span className="font-semibold text-gray-800">{fmtTime(f.returnDeparture)}</span>
                        <span className="text-gray-300">→</span>
                        <span className="font-semibold text-gray-800">{fmtTime(f.returnArrival!)}</span>
                        <span className="text-xs text-gray-400">{fmtDate(f.returnArrival!)}</span>
                        <span className="text-xs text-gray-400">· {f.returnDuration}</span>
                        <span className={`text-xs font-medium ${(f.returnStops ?? 0) === 0 ? "text-teal" : "text-gray-500"}`}>
                          {stopsLabel(f.returnStops ?? 0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price + copy */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div>
                      <p className="text-xl font-bold text-navy">${clientPricePerPerson.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">per person {hasMarkup ? "(client price)" : ""}</p>
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
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-1">
            Live fares from Duffel · Subject to availability · Lock in promptly
          </p>
        </div>
      )}
    </div>
  );
}
