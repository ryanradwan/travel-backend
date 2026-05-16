"use client";

import { useState } from "react";
import { Search, Loader2, Copy, Check, Plane, AlertTriangle } from "lucide-react";
import { type FlightOffer, formatFlightsForProposal } from "@/lib/amadeus/flights";

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

export default function FlightSearch() {
  const [form, setForm] = useState({
    origin: "", destination: "", departureDate: "", returnDate: "", adults: "1", cabin: "ECONOMY",
  });
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
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
    if (form.returnDate) params.set("returnDate", form.returnDate);

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

  function copyToProposal() {
    if (!flights?.length) return;
    const text = formatFlightsForProposal(flights, form.origin, form.destination);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleSearch} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Origin airport (IATA)</label>
            <input
              value={form.origin}
              onChange={(e) => set("origin", e.target.value.toUpperCase())}
              required maxLength={3}
              className="input mt-1 uppercase"
              placeholder="JFK"
            />
          </div>
          <div>
            <label className="label">Destination airport (IATA)</label>
            <input
              value={form.destination}
              onChange={(e) => set("destination", e.target.value.toUpperCase())}
              required maxLength={3}
              className="input mt-1 uppercase"
              placeholder="FCO"
            />
          </div>
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
          <div>
            <label className="label">Return date <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="date"
              value={form.returnDate}
              onChange={(e) => set("returnDate", e.target.value)}
              min={form.departureDate || new Date().toISOString().slice(0, 10)}
              className="input mt-1"
            />
          </div>
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

      {/* IATA hint */}
      <p className="text-xs text-gray-400">
        Use 3-letter IATA codes — e.g. JFK, LAX, LHR, CDG, DXB, SIN, NRT.
      </p>

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
          <span><strong>Test mode:</strong> Prices shown are Duffel sandbox data, not live fares. Switch to a live Duffel API key in your environment variables to see real prices.</span>
        </div>
      )}

      {/* Results */}
      {flights && flights.length === 0 && (
        <div className="card text-center py-10">
          <Plane size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No flights found</p>
          <p className="text-gray-400 text-sm mt-1">Try different dates or airports.</p>
        </div>
      )}

      {flights && flights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">{flights.length} options found</p>
            <button
              onClick={copyToProposal}
              className="flex items-center gap-1.5 text-xs font-medium text-navy border border-border px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy to proposal"}
            </button>
          </div>

          {flights.map((f) => (
            <div key={f.id} className="card border border-border hover:border-teal/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-navy">{f.airline}</span>
                    <span className="text-xs text-gray-400">{f.airlineCode}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {f.cabin.replace("_", " ").toLowerCase()}
                    </span>
                  </div>

                  {/* Outbound */}
                  <div className="flex items-center gap-3 text-sm">
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
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="font-semibold text-gray-800">{fmtTime(f.returnDeparture)}</span>
                      <span className="text-gray-300">→</span>
                      <span className="font-semibold text-gray-800">{fmtTime(f.returnArrival!)}</span>
                      <span className="text-xs text-gray-400">{fmtDate(f.returnArrival!)}</span>
                      <span className="text-xs text-gray-400">· {f.returnDuration}</span>
                      <span className={`text-xs font-medium ${(f.returnStops ?? 0) === 0 ? "text-teal" : "text-gray-500"}`}>
                        {stopsLabel(f.returnStops ?? 0)}
                      </span>
                      <span className="text-xs text-gray-300">Return</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-navy">${f.pricePerPerson.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per person</p>
                  <p className="text-xs text-gray-400">${f.price.toLocaleString()} total</p>
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-gray-400 text-center pt-1">
            Prices sourced from Amadeus GDS in real time · Fares subject to availability
          </p>
        </div>
      )}
    </div>
  );
}
