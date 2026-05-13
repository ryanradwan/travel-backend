export interface TravelAdvisory {
  title: string;
  country: string;
  level: 1 | 2 | 3 | 4 | null;
  levelLabel: string;
  summary: string;
  link: string;
  pubDate: string;
}

const ADVISORY_RSS_URL = "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/_jcr_content/adobeMainParsys/traveladvisorylist/traveladvisorylistpar/advisorylist.rss";

const LEVEL_LABELS: Record<number, string> = {
  1: "Normal Precautions",
  2: "Exercise Increased Caution",
  3: "Reconsider Travel",
  4: "Do Not Travel",
};

export async function fetchTravelAdvisories(limit = 10): Promise<TravelAdvisory[]> {
  try {
    const res = await fetch(ADVISORY_RSS_URL, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();
    return parseAdvisoryRSS(xml, limit);
  } catch {
    // Return empty array gracefully — dashboard still loads
    return [];
  }
}

function parseAdvisoryRSS(xml: string, limit: number): TravelAdvisory[] {
  const items: TravelAdvisory[] = [];

  // Extract <item> blocks
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  for (const item of itemMatches.slice(0, limit)) {
    const title = extractTag(item, "title") ?? "";
    const link = extractTag(item, "link") ?? "";
    const description = extractTag(item, "description") ?? "";
    const pubDate = extractTag(item, "pubDate") ?? "";

    // Parse advisory level from title e.g. "Italy - Level 1: Normal Precautions"
    const levelMatch = title.match(/Level\s+(\d)/i);
    const level = levelMatch ? (parseInt(levelMatch[1]) as 1 | 2 | 3 | 4) : null;

    // Extract country name (before the dash)
    const countryMatch = title.match(/^([^-]+)/);
    const country = countryMatch ? countryMatch[1].trim() : title;

    const levelLabel = level ? LEVEL_LABELS[level] : "Unknown";

    // Clean description (strip HTML tags)
    const summary = description.replace(/<[^>]+>/g, "").trim().slice(0, 200);

    items.push({ title, country, level, levelLabel, summary, link, pubDate });
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? (match[1] ?? match[2] ?? "").trim() : null;
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
