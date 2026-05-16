import Link from "next/link";
import { Compass, Clock, DollarSign, Stamp, ArrowRight } from "lucide-react";

const DESTINATIONS = [
  { name: "Japan", emoji: "🗾", tagline: "Ancient temples, neon cities, world-class food", bestTime: "Mar–May, Sep–Nov", visa: "Visa-free (US)", budget: "$150–$350/day", sellingPoints: ["Cherry blossom season", "Bullet trains", "Luxury ryokans", "Michelin dining"], category: "Cultural" },
  { name: "Maldives", emoji: "🏝️", tagline: "Overwater bungalows, crystal lagoons, total seclusion", bestTime: "Nov–Apr", visa: "Visa on arrival", budget: "$300–$1,500/day", sellingPoints: ["Overwater villas", "World-class diving", "Private islands", "All-inclusive resorts"], category: "Luxury" },
  { name: "Morocco", emoji: "🕌", tagline: "Sahara dunes, ancient medinas, vibrant souks", bestTime: "Mar–May, Sep–Nov", visa: "Visa-free (US)", budget: "$80–$250/day", sellingPoints: ["Sahara desert camps", "Riad stays", "Atlas trekking", "Culinary experiences"], category: "Adventure" },
  { name: "Italy", emoji: "🇮🇹", tagline: "World-class art, cuisine, and coastlines", bestTime: "Apr–Jun, Sep–Oct", visa: "Visa-free (Schengen)", budget: "$120–$400/day", sellingPoints: ["Amalfi Coast", "Tuscany wine country", "Colosseum", "Lake Como"], category: "Cultural" },
  { name: "Bali", emoji: "🌴", tagline: "Temple culture, rice terraces, and world-class wellness", bestTime: "Apr–Oct", visa: "Visa on arrival", budget: "$60–$300/day", sellingPoints: ["Luxury villa rentals", "Ubud wellness retreats", "Seminyak beach clubs", "Private temple tours"], category: "Wellness" },
  { name: "Greece", emoji: "🏛️", tagline: "Island-hopping, ancient ruins, Mediterranean luxury", bestTime: "May–Jun, Sep–Oct", visa: "Visa-free (Schengen)", budget: "$100–$400/day", sellingPoints: ["Santorini views", "Mykonos nightlife", "Athens history", "Catamaran charters"], category: "Luxury" },
  { name: "Kenya", emoji: "🦁", tagline: "Big Five safaris, Great Migration, world-class lodges", bestTime: "Jul–Oct, Jan–Feb", visa: "eVisa required", budget: "$250–$800/day", sellingPoints: ["Masai Mara safaris", "Great Migration", "Luxury tented camps", "Maasai culture"], category: "Adventure" },
  { name: "Peru", emoji: "🏔️", tagline: "Machu Picchu, Amazon rainforest, Andean culture", bestTime: "May–Oct", visa: "Visa-free (US)", budget: "$80–$350/day", sellingPoints: ["Machu Picchu sunrise", "Sacred Valley", "Amazon lodges", "Lima food scene"], category: "Adventure" },
  { name: "Portugal", emoji: "🇵🇹", tagline: "Europe's best value, golden coastlines, warm culture", bestTime: "Apr–Jun, Sep–Oct", visa: "Visa-free (Schengen)", budget: "$100–$300/day", sellingPoints: ["Lisbon city breaks", "Algarve beaches", "Douro wine tours", "Azores nature"], category: "Cultural" },
  { name: "Thailand", emoji: "🛕", tagline: "Temples, beaches, street food and luxury resorts", bestTime: "Nov–Apr", visa: "Visa-free (30 days)", budget: "$60–$250/day", sellingPoints: ["Phuket resorts", "Chiang Mai temples", "Bangkok food scene", "Island hopping"], category: "Cultural" },
  { name: "Iceland", emoji: "🌋", tagline: "Northern Lights, glaciers, midnight sun", bestTime: "Jun–Aug or Dec–Feb", visa: "Visa-free (Schengen)", budget: "$200–$500/day", sellingPoints: ["Northern Lights", "Glacier hikes", "Blue Lagoon", "Ring Road"], category: "Adventure" },
  { name: "Seychelles", emoji: "🌊", tagline: "Granite islands, turquoise water, pure luxury", bestTime: "Apr–May, Oct–Nov", visa: "Permit on arrival", budget: "$400–$1,500/day", sellingPoints: ["Private islands", "Pristine beaches", "Snorkeling", "Honeymoon ideal"], category: "Luxury" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: "bg-blue-100 text-blue-700",
  Luxury: "bg-purple-100 text-purple-700",
  Adventure: "bg-orange-100 text-orange-700",
  Wellness: "bg-green-100 text-green-700",
};

export default function DestinationSpotlight() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dest = DESTINATIONS[dayOfYear % DESTINATIONS.length];

  return (
    <div className="card border-l-4 border-l-teal">
      <div className="flex items-center gap-2 mb-3">
        <Compass size={13} className="text-teal" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destination Spotlight · Rotates daily</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[dest.category]}`}>{dest.category}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Name + tagline */}
        <div className="flex items-center gap-3 md:col-span-1">
          <span className="text-3xl leading-none flex-shrink-0">{dest.emoji}</span>
          <div>
            <h3 className="text-base font-bold text-navy">{dest.name}</h3>
            <p className="text-xs text-gray-500 leading-snug mt-0.5">{dest.tagline}</p>
          </div>
        </div>

        {/* Key facts */}
        <div className="flex gap-3 md:col-span-1">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock size={10} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400">Best time</span>
            </div>
            <p className="text-xs font-medium text-navy">{dest.bestTime}</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <Stamp size={10} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400">Visa</span>
            </div>
            <p className="text-xs font-medium text-navy">{dest.visa}</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign size={10} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400">Budget</span>
            </div>
            <p className="text-xs font-medium text-navy">{dest.budget}</p>
          </div>
        </div>

        {/* Selling points */}
        <div className="flex flex-wrap gap-1.5 md:col-span-1">
          {dest.sellingPoints.map(pt => (
            <span key={pt} className="text-xs bg-teal/10 text-teal px-2 py-1 rounded-lg">{pt}</span>
          ))}
        </div>

        {/* CTA */}
        <div className="md:col-span-1">
          <Link
            href={`/dashboard/workflows/research?destination=${encodeURIComponent(dest.name)}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Research {dest.name}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
