"use client";

import { useState, useRef, useEffect } from "react";
import { searchAirports, type Airport } from "@/lib/data/airports";

interface AirportInputProps {
  value: string;
  onChange: (iata: string, label: string) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
}

export default function AirportInput({ value, onChange, placeholder = "JFK", label, required }: AirportInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Airport | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    setSelected(null);
    onChange("", "");
    const matches = searchAirports(val);
    setResults(matches);
    setOpen(matches.length > 0);
  }

  function handleSelect(airport: Airport) {
    setSelected(airport);
    const label = `${airport.city} (${airport.iata})`;
    setQuery(label);
    onChange(airport.iata, label);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="label">{label}</label>
      <input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        required={required}
        className="input mt-1 w-full"
        placeholder={placeholder}
        autoComplete="off"
      />
      {selected && (
        <p className="text-xs text-teal mt-1 font-medium">{selected.iata} · {selected.name}</p>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg overflow-hidden">
          {results.map((airport) => (
            <button
              key={airport.iata}
              type="button"
              onMouseDown={() => handleSelect(airport)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-semibold text-navy text-sm">{airport.city}</span>
                  <span className="text-gray-400 text-xs ml-1">({airport.country})</span>
                  <p className="text-xs text-gray-400 truncate">{airport.name}</p>
                </div>
                <span className="shrink-0 font-bold text-teal text-sm">{airport.iata}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
