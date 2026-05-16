"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const BUDGET_OPTIONS = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $20,000",
  "$20,000+",
  "Flexible / Not sure yet",
];

export default function InquiryForm({
  token,
  businessName,
  brandColor,
}: {
  token: string;
  businessName: string;
  brandColor?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const data = {
      token,
      client_name: (form.elements.namedItem("client_name") as HTMLInputElement).value,
      client_email: (form.elements.namedItem("client_email") as HTMLInputElement).value,
      client_phone: (form.elements.namedItem("client_phone") as HTMLInputElement).value,
      destination: (form.elements.namedItem("destination") as HTMLInputElement).value,
      travel_dates: (form.elements.namedItem("travel_dates") as HTMLInputElement).value,
      travelers: (form.elements.namedItem("travelers") as HTMLInputElement).value,
      budget: (form.elements.namedItem("budget") as HTMLSelectElement).value,
      inquiry_text: (form.elements.namedItem("inquiry_text") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/inquiries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
      setStatus("error");
    }
  }

  const accent = brandColor ?? "#0E7C7B";

  if (status === "success") {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">✈️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">We received your inquiry!</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Thank you for reaching out to <strong>{businessName}</strong>. We will review your trip details
          and be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Contact details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
          <input
            name="client_name"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Sarah Johnson"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            name="client_email"
            type="email"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="sarah@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
        <input
          name="client_phone"
          type="tel"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {/* Trip details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Where do you want to go? *</label>
          <input
            name="destination"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Italy, Japan, anywhere..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">When are you thinking?</label>
          <input
            name="travel_dates"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="October 2026, flexible..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of travelers</label>
          <input
            name="travelers"
            type="number"
            min="1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget range</label>
          <select
            name="budget"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Select a range...</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about your dream trip *</label>
        <textarea
          name="inquiry_text"
          required
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          placeholder="Share any details about the kind of trip you have in mind — activities, accommodation style, special occasions, dietary requirements, anything that matters to you..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{ backgroundColor: accent }}
        className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {status === "loading" ? (
          <><Loader2 size={16} className="animate-spin" /> Sending inquiry…</>
        ) : (
          <><Send size={16} /> Send Inquiry</>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your information is handled securely and never shared with third parties.
      </p>
    </form>
  );
}
