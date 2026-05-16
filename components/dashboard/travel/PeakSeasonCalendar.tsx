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
        <span className="text-xs text-gray-400 ml-1">— what to be selling right now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peak now */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white bg-teal px-2.5 py-0.5 rounded-full">{monthName} — Peak</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentData.peak.map(d => (
              <span key={d} className="text-xs bg-teal/10 text-teal px-2 py-1 rounded-lg font-medium">{d}</span>
            ))}
          </div>
        </div>

        {/* Shoulder */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full">Shoulder season</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentData.shoulder.length > 0
              ? currentData.shoulder.map(d => (
                  <span key={d} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">{d}</span>
                ))
              : <span className="text-xs text-gray-400">None this month</span>
            }
          </div>
          {currentData.avoid.length > 0 && (
            <div className="flex items-start gap-1.5 mt-3">
              <Info size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                <span className="font-medium">Avoid: </span>{currentData.avoid.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Coming up */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={12} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">Coming up — {nextMonthName}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {nextData.peak.slice(0, 5).map(d => (
              <span key={d} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
