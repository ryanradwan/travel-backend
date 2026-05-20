import { createClient } from "@/lib/supabase/server";
import { searchFlights, type FlightSearchParams } from "@/lib/amadeus/flights";
import { isAmadeusConfigured } from "@/lib/amadeus/client";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAmadeusConfigured()) {
    return Response.json(
      { error: "Duffel API key not configured. Add DUFFEL_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const get = (k: string) => url.searchParams.get(k) ?? "";

  const origin = get("origin").toUpperCase();
  const destination = get("destination").toUpperCase();
  const departureDate = get("departureDate");
  const returnDate = get("returnDate") || undefined;
  const adults = Math.max(1, parseInt(get("adults") || "1", 10));
  const cabin = (get("cabin") || "ECONOMY") as FlightSearchParams["cabin"];

  if (!origin || !destination || !departureDate) {
    return Response.json({ error: "origin, destination and departureDate are required" }, { status: 400 });
  }

  try {
    const flights = await searchFlights({ origin, destination, departureDate, returnDate, adults, cabin, max: 15 });
    const isTestMode = process.env.DUFFEL_API_KEY?.startsWith("duffel_test_") ?? true;
    return Response.json({ flights, isTestMode });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Flight search failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
