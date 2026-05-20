import { duffelPost } from "./client";

export interface FlightSegment {
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
}

export interface Layover {
  airport: string;
  durationMins: number;
  durationLabel: string;
}

export interface FlightOffer {
  id: string;
  airlineCode: string;
  airline: string;
  price: number;
  currency: string;
  pricePerPerson: number;
  departure: string;
  arrival: string;
  returnDeparture?: string;
  returnArrival?: string;
  duration: string;
  returnDuration?: string;
  stops: number;
  returnStops?: number;
  cabin: string;
  segments: FlightSegment[];
  layovers: Layover[];
  returnSegments?: FlightSegment[];
  returnLayovers?: Layover[];
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabin?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  max?: number;
}

// Duffel cabin class mapping
const CABIN_MAP: Record<string, string> = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium_economy",
  BUSINESS: "business",
  FIRST: "first",
};

export function formatDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  return [m[1] ? `${m[1]}h` : "", m[2] ? `${m[2]}m` : ""].filter(Boolean).join(" ");
}

function layoversBetween(segs: unknown[]): Layover[] {
  const out: Layover[] = [];
  for (let i = 0; i < segs.length - 1; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const curr = segs[i] as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = segs[i + 1] as any;
    const airport: string = curr.destination?.iata_code ?? "?";
    const durationMins = Math.round(
      (new Date(next.departing_at).getTime() - new Date(curr.arriving_at).getTime()) / 60000
    );
    const h = Math.floor(durationMins / 60);
    const m = durationMins % 60;
    out.push({
      airport,
      durationMins,
      durationLabel: [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ") || "0m",
    });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSegments(segs: any[]): FlightSegment[] {
  return segs.map((s) => ({
    flightNumber: `${s.marketing_carrier?.iata_code ?? ""}${s.marketing_carrier_flight_number ?? ""}`,
    airlineCode: s.marketing_carrier?.iata_code ?? "",
    origin: s.origin?.iata_code ?? "",
    destination: s.destination?.iata_code ?? "",
    departure: s.departing_at,
    arrival: s.arriving_at,
    duration: formatDuration(s.duration ?? ""),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOffer(offer: any, adults: number): FlightOffer {
  const outSlice = offer.slices[0];
  const outSegs = outSlice.segments;
  const firstSeg = outSegs[0];
  const lastSeg = outSegs[outSegs.length - 1];

  const carrier = firstSeg.marketing_carrier;
  const totalPrice = parseFloat(offer.total_amount);

  const result: FlightOffer = {
    id: offer.id,
    airlineCode: carrier.iata_code,
    airline: carrier.name,
    price: totalPrice,
    currency: offer.total_currency,
    pricePerPerson: Math.round(totalPrice / adults),
    departure: firstSeg.departing_at,
    arrival: lastSeg.arriving_at,
    duration: formatDuration(outSlice.duration),
    stops: outSegs.length - 1,
    cabin: firstSeg.passengers?.[0]?.cabin_class_marketing_name ?? "Economy",
    segments: parseSegments(outSegs),
    layovers: layoversBetween(outSegs),
  };

  // Return leg
  if (offer.slices[1]) {
    const retSlice = offer.slices[1];
    const retSegs = retSlice.segments;
    result.returnDeparture = retSegs[0].departing_at;
    result.returnArrival = retSegs[retSegs.length - 1].arriving_at;
    result.returnDuration = formatDuration(retSlice.duration);
    result.returnStops = retSegs.length - 1;
    result.returnSegments = parseSegments(retSegs);
    result.returnLayovers = layoversBetween(retSegs);
  }

  return result;
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const passengers = Array.from({ length: params.adults }, () => ({ type: "adult" }));
  const cabinClass = CABIN_MAP[params.cabin ?? "ECONOMY"] ?? "economy";

  // Build slices — outbound always, return only if returnDate provided
  const slices = [
    {
      origin: params.origin.toUpperCase(),
      destination: params.destination.toUpperCase(),
      departure_date: params.departureDate,
    },
  ];

  if (params.returnDate) {
    slices.push({
      origin: params.destination.toUpperCase(),
      destination: params.origin.toUpperCase(),
      departure_date: params.returnDate,
    });
  }

  const response = await duffelPost<{ data: { offers: unknown[] } }>(
    "/air/offer_requests?return_offers=true",
    {
      data: {
        slices,
        passengers,
        cabin_class: cabinClass,
      },
    }
  );

  const offers = response.data?.offers ?? [];
  // Sort by price and take top results
  const max = params.max ?? 6;
  return (offers as unknown[])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => parseFloat(a.total_amount) - parseFloat(b.total_amount))
    .slice(0, max)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((o: any) => parseOffer(o, params.adults));
}

export function formatFlightsForProposal(
  flights: FlightOffer[],
  origin: string,
  destination: string
): string {
  if (!flights.length) return "";

  const isRoundTrip = !!flights[0].returnDeparture;
  const date = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const lines = flights.slice(0, 3).map((f, i) => {
    const dep = new Date(f.departure).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const arr = new Date(f.arrival).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const stops = f.stops === 0 ? "Nonstop" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`;
    const perPerson = `$${f.pricePerPerson.toLocaleString()}/person`;
    const total = `$${f.price.toLocaleString()} total`;

    let line = `${i + 1}. **${f.airline}** — ${perPerson} (${total})\n`;
    line += `   Outbound: ${dep} → ${arr} · ${f.duration} · ${stops}`;

    if (isRoundTrip && f.returnDeparture && f.returnArrival) {
      const rdep = new Date(f.returnDeparture).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const rarr = new Date(f.returnArrival).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const rstops = (f.returnStops ?? 0) === 0 ? "Nonstop" : `${f.returnStops} stop${(f.returnStops ?? 0) > 1 ? "s" : ""}`;
      line += `\n   Return:   ${rdep} → ${rarr} · ${f.returnDuration} · ${rstops}`;
    }

    return line;
  });

  return [
    `**Live Flight Prices — ${origin.toUpperCase()} → ${destination.toUpperCase()}** *(${date})*`,
    "",
    ...lines,
    "",
    "*Prices sourced from Duffel in real time. Fares are subject to availability — lock in by booking promptly.*",
  ].join("\n");
}
