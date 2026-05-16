import { Sun, TrendingUp, Info } from "lucide-react";

const PEAK_SEASONS: Record<number, { peak: string[]; shoulder: string[]; avoid: string[] }> = {
  1:  { peak: ["Maldives", "Thailand", "Caribbean", "Morocco", "New Zealand"], shoulder: ["Japan", "Peru", "South Africa"], avoid: ["Northern Europe", "UK"] },
  2:  { peak: ["Maldives", "Thailand", "Dubai", "Caribbean", "Jordan"], shoulder: ["Morocco", "Japan", "Vietnam"], avoid: ["Northern Europe"] },
  3:  { peak: ["Japan (cherry blossom)", "Morocco", "Jordan", "Peru"], shoulder: ["Iceland", "Costa Rica", "Vietnam"], avoid: ["Caribbean (off-peak)"] },
  4:  { peak: ["Japan", "Morocco", "Jordan", "Portugal", "Greece"], shoulder: ["Iceland", "Kenya", "Vietnam"], avoid: [] },
  5:  { peak: ["Greece", "Portugal", "Iceland", "Japan", "Peru"], shoulder: ["Bali", "Kenya", "Thailand"], avoid: ["Caribbean (rainy)"] },
  6:  { peak: ["Greece", "Croatia", "Iceland", "South Africa", "Kenya"], shoulder: ["Bali", "Portugal", "Japan"], avoid: ["Thailand", "India (monsoon)"] },
  7:  { peak: ["Greece", "Croatia", "Iceland", "South Africa", "Tanzania"], shoulder: ["Japan", "Vietnam", "Portugal"], avoid: ["Thailand", "India"] },
  8:  { peak: ["Greece", "Croatia", "Iceland", "Tanzania", "Kenya"], shoulder: ["Japan", "Vietnam", "Morocco"], avoid: ["Thailand", "Caribbean"] },
  9:  { peak: ["Bali", "Vietnam", "Morocco", "Greece", "Japan"], shoulder: ["Iceland", "Peru", "Tanzania"], avoid: [] },
  10: { peak: ["Bali", "Vietnam", "Japan (fall foliage)", "Morocco", "Peru"], shoulder: ["Greece", "Caribbean", "South Africa"], avoid: ["Iceland"] },
  11: { peak: ["Maldives", "Thailand", "Caribbean", "Vietnam", "Peru"], shoulder: ["Japan", "Morocco", "Bali"], avoid: [] },
  12: { peak: ["Maldives", "Thailand", "Caribbean", "New Zealand", "Dubai"], shoulder: ["Morocco", "Jordan", "Vietnam"], avoid: ["Northern Europe"] },
};

export default function PeakSeasonCalendar() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const currentData = PEAK_SEASONS[currentMonth];
  const nextData = PEAK_SEASONS[nextMonth];

  const monthName = now.toLocaleString("en-US", { month: "long" });
  const nextMonthName = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toLocaleString("en-US", { month: "long" });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Sun size={15} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-navy">Peak Season Guide</h3>
      </div>

      <div className="space-y-4">
        {/* This month */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white bg-teal px-2 py-0.5 rounded-full">{monthName}</span>
            <span className="text-xs text-gray-400">Peak now</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentData.peak.map(d => (
              <span key={d} className="text-xs bg-teal/10 text-teal px-2 py-1 rounded-lg font-medium">{d}</span>
            ))}
          </div>
          {currentData.shoulder.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentData.shoulder.map(d => (
                <span key={d} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">{d}</span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Next month */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={12} className="text-purple-500" />
            <span className="text-xs font-semibold text-gray-600">Coming up in {nextMonthName}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {nextData.peak.slice(0, 4).map(d => (
              <span key={d} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">{d}</span>
            ))}
          </div>
        </div>

        {currentData.avoid.length > 0 && (
          <>
            <div className="border-t border-border" />
            <div className="flex items-start gap-2">
              <Info size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                <span className="font-medium">Avoid advising this month: </span>
                {currentData.avoid.join(", ")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
