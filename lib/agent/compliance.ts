// Compliance checker — injected into every agent response pipeline
// Checks State Dept advisories, visa flags, and adds required disclaimers

export interface ComplianceResult {
  advisoryWarning: string | null;
  visaReminder: string | null;
  priceDisclaimer: string;
  fullBlock: string;
}

const ADVISORY_LEVELS: Record<number, { label: string; color: string; action: string }> = {
  1: { label: "Normal Precautions", color: "green", action: "Safe to travel with standard precautions." },
  2: { label: "Exercise Increased Caution", color: "yellow", action: "Advise clients to stay informed and exercise increased caution." },
  3: { label: "Reconsider Travel", color: "orange", action: "Strongly advise clients to reconsider travel. Discuss alternatives." },
  4: { label: "Do Not Travel", color: "red", action: "Do not recommend travel to this destination. This is the highest advisory level." },
};

export function buildComplianceBlock(
  destination: string,
  advisoryLevel: number | null,
  hasVisaInfo: boolean,
  today: string
): ComplianceResult {
  const advisory = advisoryLevel ? ADVISORY_LEVELS[advisoryLevel] : null;

  const advisoryWarning = advisory
    ? `**US State Dept Advisory — ${destination}:** Level ${advisoryLevel} — ${advisory.label}. ${advisory.action}`
    : `**US State Dept Advisory:** Please verify the current advisory for ${destination} at travel.state.gov before advising clients.`;

  const visaReminder = !hasVisaInfo
    ? `**Visa Requirements:** Verify current visa requirements for your client's nationality at travel.state.gov or the ${destination} embassy website.`
    : null;

  const priceDisclaimer = `*Prices, schedules, and availability are estimates as of ${today} and subject to change without notice. Always verify with suppliers before confirming with clients. TripDesk.ai is not responsible for third-party pricing changes.*`;

  const parts = [advisoryWarning];
  if (visaReminder) parts.push(visaReminder);
  parts.push(priceDisclaimer);

  return {
    advisoryWarning,
    visaReminder,
    priceDisclaimer,
    fullBlock: "\n\n---\n**Compliance Notes**\n\n" + parts.join("\n\n"),
  };
}

export function detectDestination(text: string): string | null {
  // Simple destination extraction from user input
  const patterns = [
    /\bto\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:trip|travel|itinerary|tour|holiday|vacation|visit))/i,
    /\b(?:trip|travel|itinerary|tour|holiday|vacation|visit)\s+(?:to\s+)?([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.)/i,
    /\b(Italy|France|Spain|Japan|Thailand|Bali|Mexico|Greece|Portugal|Morocco|Peru|Kenya|Australia|New Zealand|Costa Rica|Caribbean|UAE|Dubai|India|Vietnam|Iceland|Norway|Scotland|Ireland|Turkey|Egypt|Tanzania|South Africa|Brazil|Argentina|Colombia|Croatia|Switzerland|Austria|Czech Republic|Hungary|Poland|Netherlands|Belgium|Denmark|Sweden|Finland|Singapore|Hong Kong|Taiwan|South Korea|Philippines|Indonesia|Malaysia|Cambodia|Laos|Myanmar|Nepal|Sri Lanka|Maldives|Seychelles|Mauritius|Zanzibar|Madagascar|Rwanda|Ghana|Senegal|Morocco|Tunisia|Jordan|Israel|Lebanon|Oman|Bahrain|Qatar|Kuwait|Saudi Arabia|Pakistan|Bhutan|Mongolia|Uzbekistan|Georgia|Armenia|Azerbaijan|Kazakhstan|Canada|Alaska|Hawaii|Puerto Rico|Dominican Republic|Jamaica|Cuba|Bahamas|Barbados|St\. Lucia|Antigua|Turks and Caicos|Cayman Islands|Aruba|Curacao|Bonaire)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

export function requiresComplianceCheck(input: string): boolean {
  const keywords = [
    "itinerary", "trip", "travel", "tour", "holiday", "vacation", "visit",
    "destination", "proposal", "package", "quote", "booking", "fly", "flight",
    "hotel", "resort", "cruise", "safari",
  ];
  const lower = input.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}
