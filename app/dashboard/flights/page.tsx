import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plane } from "lucide-react";
import FlightSearch from "@/components/flights/FlightSearch";
import { isAmadeusConfigured } from "@/lib/amadeus/client";

export const metadata = { title: "Flight Search — TripDesk.ai" };

export default async function FlightsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const configured = isAmadeusConfigured();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Flight Search</h1>
          <p className="text-gray-500 text-sm mt-1">
            Live prices from Amadeus GDS — real fares you can quote to clients
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs border border-border rounded-lg px-3 py-2">
          <Plane size={13} className={configured ? "text-teal" : "text-gray-300"} />
          <span className={configured ? "text-teal font-medium" : "text-gray-400"}>
            {configured
              ? (process.env.DUFFEL_API_KEY?.startsWith("duffel_test_") ? "Test mode" : "Live mode")
              : "Not configured"}
          </span>
        </div>
      </div>

      {!configured ? (
        <div className="card border-yellow-200 border bg-yellow-50 space-y-3">
          <p className="text-sm font-semibold text-yellow-800">Duffel API key required</p>
          <p className="text-sm text-yellow-700">
            To enable live flight pricing, add your Duffel API key to your environment variables:
          </p>
          <div className="bg-white border border-yellow-200 rounded-lg p-4 font-mono text-xs text-gray-700">
            <p>DUFFEL_API_KEY=duffel_test_...</p>
          </div>
          <p className="text-sm text-yellow-700">
            Sign up free at{" "}
            <span className="font-medium">duffel.com</span>
            {" "}— get your test key instantly, switch to a live key when ready for production.
          </p>
        </div>
      ) : (
        <FlightSearch />
      )}
    </div>
  );
}
