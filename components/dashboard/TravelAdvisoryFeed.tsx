import { fetchTravelAdvisories, getAdvisoryBadgeColor } from "@/lib/feeds/state-dept";
import { ExternalLink, AlertTriangle } from "lucide-react";

export default async function TravelAdvisoryFeed() {
  const advisories = await fetchTravelAdvisories(8);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-navy">Travel Advisories</h3>
          <p className="text-xs text-gray-400 mt-0.5">US State Dept · Updated hourly</p>
        </div>
        <a
          href="https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-teal hover:underline"
        >
          View all <ExternalLink size={10} />
        </a>
      </div>

      {advisories.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
          <AlertTriangle size={16} />
          <span>Advisory feed unavailable — check travel.state.gov directly</span>
        </div>
      ) : (
        <div className="space-y-2">
          {advisories.map((advisory, i) => (
            <a
              key={i}
              href={advisory.link || "https://travel.state.gov"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-1 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-navy font-medium truncate group-hover:text-teal transition-colors">
                  {advisory.country}
                </span>
              </div>
              {advisory.level && (
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${getAdvisoryBadgeColor(advisory.level)}`}>
                  L{advisory.level}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
