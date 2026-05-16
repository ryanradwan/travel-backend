import Link from "next/link";
import { Compass, Clock, DollarSign, Stamp, ArrowRight } from "lucide-react";

const DESTINATIONS = [
  { name: "Japan", emoji: "🗾", tagline: "Ancient temples, neon cities, world-class food", bestTime: "Mar–May, Sep–Nov", visa: "Visa-free (US)", budget: "$150–$350/day", sellingPoints: ["Cherry blossom season", "Bullet trains", "Michelin-starred dining", "Luxury ryokans"], category: "Cultural" },
  { name: "Maldives", emoji: "🏝️", tagline: "Overwater bungalows, crystal lagoons, total seclusion", bestTime: "Nov–Apr", visa: "Visa on arrival (US)", budget: "$300–$1,500/day", sellingPoints: ["Overwater villas", "World-class diving", "All-inclusive resorts", "Private island experiences"], category: "Luxury" },
  { name: "Morocco", emoji: "🕌", tagline: "Ancient medinas, Sahara dunes, vibrant souks", bestTime: "Mar–May, Sep–Nov", visa: "Visa-free (US, 90 days)", budget: "$80–$250/day", sellingPoints: ["Sahara desert camps", "Riad stays in Marrakech", "Atlas Mountains trekking", "Culinary experiences"], category: "Adventure" },
  { name: "Italy", emoji: "🇮🇹", tagline: "World-class art, cuisine, and coastlines", bestTime: "Apr–Jun, Sep–Oct", visa: "Visa-free (US, Schengen)", budget: "$120–$400/day", sellingPoints: ["Amalfi Coast", "Tuscany wine country", "Vatican and Colosseum", "Lake Como luxury"], category: "Cultural" },
  { name: "Bali", emoji: "🌴", tagline: "Temple culture, rice terraces, and world-class wellness", bestTime: "Apr–Oct", visa: "Visa on arrival (US)", budget: "$60–$300/day", sellingPoints: ["Luxury villa rentals", "Ubud wellness retreats", "Seminyak beach clubs", "Private temple tours"], category: "Wellness" },
  { name: "Greece", emoji: "🏛️", tagline: "Island-hopping, ancient ruins, Mediterranean luxury", bestTime: "May–Jun, Sep–Oct", visa: "Visa-free (US, Schengen)", budget: "$100–$400/day", sellingPoints: ["Santorini caldera views", "Mykonos nightlife", "Athens history", "Catamaran charters"], category: "Luxury" },
  { name: "Kenya", emoji: "🦁", tagline: "Big Five safaris, Great Migration, world-class lodges", bestTime: "Jul–Oct, Jan–Feb", visa: "eVisa required (US)", budget: "$250–$800/day", sellingPoints: ["Masai Mara safaris", "Great Migration (Jul–Oct)", "Luxury tented camps", "Maasai cultural experiences"], category: "Adventure" },
  { name: "Peru", emoji: "🏔️", tagline: "Machu Picchu, Amazon rainforest, Andean culture", bestTime: "May–Oct", visa: "Visa-free (US)", budget: "$80–$350/day", sellingPoints: ["Machu Picchu sunrise", "Sacred Valley", "Amazon lodge stays", "Lima food scene"], category: "Adventure" },
  { name: "Portugal", emoji: "🇵🇹", tagline: "Europe's best value, golden coastlines, warm culture", bestTime: "Apr–Jun, Sep–Oct", visa: "Visa-free (US, Schengen)", budget: "$100–$300/day", sellingPoints: ["Lisbon and Porto city breaks", "Algarve beaches", "Douro Valley wine tours", "Azores nature"], category: "Cultural" },
  { name: "Thailand", emoji: "🛕", tagline: "Temples, beaches, street food and luxury resorts", bestTime: "Nov–Apr", visa: "Visa-free (US, 30 days)", budget: "$60–$250/day", sellingPoints: ["Phuket luxury resorts", "Chiang Mai temples", "Bangkok street food", "Island hopping"], category: "Cultural" },
  { name: "Iceland", emoji: "🌋", tagline: "Northern Lights, glaciers, midnight sun", bestTime: "Jun–Aug (midnight sun), Dec–Feb (aurora)", visa: "Visa-free (US, Schengen)", budget: "$200–$500/day", sellingPoints: ["Northern Lights viewing", "Glacier hikes", "Blue Lagoon", "Ring Road road trips"], category: "Adventure" },
  { name: "Seychelles", emoji: "🌊", tagline: "Granite islands, turquoise water, pure luxury", bestTime: "Apr–May, Oct–Nov", visa: "Visitor permit on arrival (US)", budget: "$400–$1,500/day", sellingPoints: ["Private island resorts", "Pristine beaches", "World-class snorkeling", "Honeymoon destination"], category: "Luxury" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: "bg-blue-100 text-blue-700",
  Luxury: "bg-purple-100 text-purple-700",
  Adventure: "bg-orange-100 text-orange-700",
  Wellness: "bg-green-100 text-green-700",
};

export default function DestinationSpotlight() {
  // Rotate daily — use day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dest = DESTINATIONS[dayOfYear % DESTINATIONS.length];

  return (
    <div className="card border-l-4" style={{ borderLeftColor: "#0E7C7B" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-teal" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destination Spotlight</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[dest.category]}`}>
          {dest.category}
        </span>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl leading-none flex-shrink-0">{dest.emoji}</span>
        <div>
          <h3 className="text-lg font-bold text-navy">{dest.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{dest.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={11} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Best time</span>
          </div>
          <p className="text-xs font-medium text-navy leading-snug">{dest.bestTime}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Stamp size={11} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Visa</span>
          </div>
          <p className="text-xs font-medium text-navy leading-snug">{dest.visa}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={11} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Budget</span>
          </div>
          <p className="text-xs font-medium text-navy leading-snug">{dest.budget}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 mb-2">Key selling points</p>
        <div className="flex flex-wrap gap-1.5">
          {dest.sellingPoints.map(pt => (
            <span key={pt} className="text-xs bg-teal/10 text-teal px-2 py-1 rounded-lg">{pt}</span>
          ))}
        </div>
      </div>

      <Link
        href={`/dashboard/workflows/research?destination=${encodeURIComponent(dest.name)}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Research {dest.name} now
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
