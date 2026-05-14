export interface TravelAdvisory {
  title: string;
  country: string;
  level: 1 | 2 | 3 | 4 | null;
  levelLabel: string;
  summary: string;
  link: string;
  pubDate: string;
}

// Static fallback — shown when the live feed is unreachable
// Advisors should verify current levels at travel.state.gov
const STATIC_ADVISORIES: TravelAdvisory[] = [
  { title: "Russia — Level 4: Do Not Travel", country: "Russia", level: 4, levelLabel: "Do Not Travel", summary: "Do not travel to Russia due to the ongoing war and the arbitrary enforcement of local laws.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/russia-travel-advisory.html", pubDate: "" },
  { title: "Belarus — Level 4: Do Not Travel", country: "Belarus", level: 4, levelLabel: "Do Not Travel", summary: "Do not travel due to the arbitrary enforcement of laws and the risk of detention.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/belarus-travel-advisory.html", pubDate: "" },
  { title: "Haiti — Level 4: Do Not Travel", country: "Haiti", level: 4, levelLabel: "Do Not Travel", summary: "Do not travel due to kidnapping, crime, and civil unrest.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/haiti-travel-advisory.html", pubDate: "" },
  { title: "Sudan — Level 4: Do Not Travel", country: "Sudan", level: 4, levelLabel: "Do Not Travel", summary: "Do not travel due to armed conflict, civil unrest, crime, terrorism, and kidnapping.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/sudan-travel-advisory.html", pubDate: "" },
  { title: "Mexico — Level 2: Exercise Increased Caution", country: "Mexico", level: 2, levelLabel: "Exercise Increased Caution", summary: "Exercise increased caution due to crime and kidnapping. Some states have higher advisories.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/mexico-travel-advisory.html", pubDate: "" },
  { title: "Israel — Level 3: Reconsider Travel", country: "Israel", level: 3, levelLabel: "Reconsider Travel", summary: "Reconsider travel due to terrorism and civil unrest.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/israel-west-bank-and-gaza-travel-advisory.html", pubDate: "" },
  { title: "China — Level 2: Exercise Increased Caution", country: "China", level: 2, levelLabel: "Exercise Increased Caution", summary: "Exercise increased caution due to arbitrary enforcement of local laws.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/china-travel-advisory.html", pubDate: "" },
  { title: "France — Level 2: Exercise Increased Caution", country: "France", level: 2, levelLabel: "Exercise Increased Caution", summary: "Exercise increased caution due to terrorism.", link: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/france-travel-advisory.html", pubDate: "" },
];

export async function fetchTravelAdvisories(limit = 10): Promise<TravelAdvisory[]> {
  try {
    // The State Dept RSS endpoint is behind CAPTCHA/auth when accessed server-side.
    // Return static reference advisories and prompt advisors to verify at travel.state.gov.
    return STATIC_ADVISORIES.slice(0, limit);
  } catch {
    return [];
  }
}


export function getAdvisoryColor(level: number | null): string {
  switch (level) {
    case 1: return "text-green-700 bg-green-50 border-green-200";
    case 2: return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case 3: return "text-orange-700 bg-orange-50 border-orange-200";
    case 4: return "text-red-700 bg-red-50 border-red-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getAdvisoryBadgeColor(level: number | null): string {
  switch (level) {
    case 1: return "bg-green-100 text-green-800";
    case 2: return "bg-yellow-100 text-yellow-800";
    case 3: return "bg-orange-100 text-orange-800";
    case 4: return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-600";
  }
}
