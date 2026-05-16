// Tavily web search — used to inject live data into Claude's context before responding

const TAVILY_URL = "https://api.tavily.com/search";

// Triggers that indicate the query needs live web data
const SEARCH_TRIGGERS = [
  /\bcurrent(ly)?\b/i,
  /\blatest\b/i,
  /\brecent(ly)?\b/i,
  /\bright now\b/i,
  /\btoday\b/i,
  /\bthis (week|month|year)\b/i,
  /\b202[5-9]\b/,
  /\bvisa\b/i,
  /\bpassport\b/i,
  /\bentry (requirements?|rules?)\b/i,
  /\btravel advisory\b/i,
  /\btravel (warning|alert)\b/i,
  /\bsafe to (travel|visit)\b/i,
  /\bis it safe\b/i,
  /\bflight (price|cost|fare)\b/i,
  /\bhotel (price|cost|rate)\b/i,
  /\bhow much (does|is|are|do)\b/i,
  /\bexchange rate\b/i,
  /\bcurrency\b/i,
  /\bweather\b/i,
  /\bforecast\b/i,
  /\bnews\b/i,
  /\bwhat('s| is) happening\b/i,
  /\bopen(ed|ing)?\b/i,
  /\bclosed?\b/i,
  /\bavailab(le|ility)\b/i,
  /\bcovid\b/i,
  /\brestrictions?\b/i,
  /\brequirements?\b/i,
  /\btourist (season|attractions?)\b/i,
  /\bbest time to (visit|go|travel)\b/i,
];

export function needsWebSearch(query: string): boolean {
  if (!process.env.TAVILY_API_KEY) return false;
  return SEARCH_TRIGGERS.some((r) => r.test(query));
}

export async function searchWeb(query: string): Promise<string | null> {
  if (!process.env.TAVILY_API_KEY) return null;

  try {
    const res = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
      }),
      signal: AbortSignal.timeout(8000), // 8s max
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      answer?: string;
      results?: { title: string; url: string; content: string; score: number }[];
    };

    const parts: string[] = [];

    if (data.answer) {
      parts.push(`**Direct answer:** ${data.answer}`);
    }

    const results = (data.results ?? []).slice(0, 4);
    for (const r of results) {
      parts.push(`**${r.title}** (${r.url})\n${r.content.slice(0, 400)}${r.content.length > 400 ? "…" : ""}`);
    }

    return parts.length > 0 ? parts.join("\n\n") : null;
  } catch {
    return null;
  }
}

// Format search results for injection into Claude's system context
export function buildSearchContext(query: string, results: string): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return `\n\n---\n## Live Web Search Results\n*Searched: "${query}" on ${date}*\n\n${results}\n\n*Always cite that prices, visa rules, and advisories should be verified before advising clients.*\n---`;
}
