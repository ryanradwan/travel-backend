// Duffel API client — replaces Amadeus (Self-Service decommissioned July 2025)
// Duffel uses simple Bearer token auth — no OAuth2 dance needed

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

export function getDuffelHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
    "Duffel-Version": DUFFEL_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function duffelPost<T = unknown>(path: string, body: unknown): Promise<T> {
  if (!process.env.DUFFEL_API_KEY) {
    throw new Error("DUFFEL_API_KEY is not configured.");
  }

  const res = await fetch(`${DUFFEL_BASE}${path}`, {
    method: "POST",
    headers: getDuffelHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Duffel API error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json() as Promise<T>;
}

// Keep this export name so the rest of the codebase doesn't need changes
export function isAmadeusConfigured(): boolean {
  return !!process.env.DUFFEL_API_KEY;
}
