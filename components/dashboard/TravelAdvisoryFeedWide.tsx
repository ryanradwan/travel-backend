import { fetchTravelAdvisories, getAdvisoryBadgeColor } from "@/lib/feeds/state-dept";
import { ExternalLink, ShieldAlert } from "lucide-react";

const LEVEL_BG: Record<number, string> = {
  1: "bg-green-50 border-green-200",
  2: "bg-yellow-50 border-yellow-200",
  3: "bg-orange-50 border-orange-200",
  4: "bg-red-50 border-red-200",
};

export default async function TravelAdvisoryFeedWide() {
  const advisories = await fetchTravelAdvisories(8);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-navy" />
          <div>
            <h3 className="text-sm font-semibold text-navy">US State Dept Travel Advisories</h3>
            <p className="text-xs text-gray-400 mt-0.5">Reference only — verify at travel.state.gov before advising clients</p>
          </div>
        </div>
        <a
          href="https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-teal hover:underline flex-shrink-0"
        >
          View all <ExternalLink size={10} />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {advisories.map((advisory, i) => (
          <a
            key={i}
            href={advisory.link || "https://travel.state.gov"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-opacity hover:opacity-80 ${LEVEL_BG[advisory.level ?? 1] ?? "bg-gray-50 border-gray-200"}`}
          >
            <span className="text-sm font-medium text-navy truncate">{advisory.country}</span>
            {advisory.level && (
              <span className={`flex-shrink-0 ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${getAdvisoryBadgeColor(advisory.level)}`}>
                L{advisory.level}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
