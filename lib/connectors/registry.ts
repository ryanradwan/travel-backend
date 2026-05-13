export type ConnectorId =
  | "gmail"
  | "google_drive"
  | "google_calendar"
  | "whatsapp"
  | "canva"
  | "skyscanner";

export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  description: string;
  category: "google" | "communication" | "design" | "travel";
  authType: "oauth2" | "api_key" | "manual";
  oauthProvider?: "google";
  scopes?: string[];
  icon: string; // emoji fallback
  color: string; // tailwind bg class
  whatItDoes: string[];
  tier: "starter";
  docsUrl?: string;
}

export const CONNECTORS: Record<ConnectorId, ConnectorDefinition> = {
  gmail: {
    id: "gmail",
    name: "Gmail",
    description: "Send and draft emails directly from TripDesk",
    category: "google",
    authType: "oauth2",
    oauthProvider: "google",
    scopes: [
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    icon: "✉️",
    color: "bg-red-50",
    whatItDoes: [
      "Draft client proposal emails",
      "Send booking confirmations",
      "Read client inquiries",
      "Send payment reminders",
    ],
    tier: "starter",
  },
  google_drive: {
    id: "google_drive",
    name: "Google Drive",
    description: "Save itineraries, proposals, and reports to your Drive",
    category: "google",
    authType: "oauth2",
    oauthProvider: "google",
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    icon: "📁",
    color: "bg-yellow-50",
    whatItDoes: [
      "Save itinerary proposals as Google Docs",
      "Store destination research reports",
      "Organise client documents by folder",
      "Share documents with clients",
    ],
    tier: "starter",
  },
  google_calendar: {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Create travel reminders and booking deadlines",
    category: "google",
    authType: "oauth2",
    oauthProvider: "google",
    scopes: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
    icon: "📅",
    color: "bg-blue-50",
    whatItDoes: [
      "Create payment deadline reminders",
      "Add client travel dates",
      "Set document delivery reminders",
      "Block out FAM trip dates",
    ],
    tier: "starter",
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Send client updates and proposals via WhatsApp",
    category: "communication",
    authType: "manual",
    icon: "💬",
    color: "bg-green-50",
    whatItDoes: [
      "Send itinerary summaries to clients",
      "Share quick travel updates",
      "Draft WhatsApp messages for client comms",
    ],
    tier: "starter",
  },
  canva: {
    id: "canva",
    name: "Canva",
    description: "Create tour graphics and promotional materials",
    category: "design",
    authType: "oauth2",
    icon: "🎨",
    color: "bg-purple-50",
    whatItDoes: [
      "Create tour package promotional graphics",
      "Design social media posts",
      "Build branded itinerary covers",
      "Generate destination mood boards",
    ],
    tier: "starter",
  },
  skyscanner: {
    id: "skyscanner",
    name: "Skyscanner",
    description: "Research live flight prices for client proposals",
    category: "travel",
    authType: "api_key",
    icon: "✈️",
    color: "bg-sky-50",
    whatItDoes: [
      "Look up current flight prices",
      "Compare routes for client proposals",
      "Find cheapest travel months",
      "Research airline options",
    ],
    tier: "starter",
  },
};

export const STARTER_CONNECTORS: ConnectorId[] = [
  "gmail",
  "google_drive",
  "google_calendar",
  "whatsapp",
  "canva",
  "skyscanner",
];
