export type ConnectorId =
  | "gmail" | "google_drive" | "google_calendar" | "whatsapp" | "canva" | "skyscanner"
  | "notion" | "wordpress" | "stripe" | "booking_com" | "mailchimp" | "instagram"
  | "facebook" | "viator" | "tripadvisor" | "airbnb" | "google_docs" | "trello"
  | "whatsapp_business" | "rome2rio" | "rezdy" | "getyourguide" | "klook"
  | "travefy" | "travel_joy" | "peek_pro" | "tourradar";

export type ConnectorTier = "starter" | "professional" | "agency";

export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  description: string;
  category: "google" | "communication" | "design" | "travel" | "booking" | "marketing" | "social" | "finance" | "productivity";
  authType: "oauth2" | "api_key" | "manual";
  oauthProvider?: "google";
  scopes?: string[];
  icon: string;
  color: string;
  whatItDoes: string[];
  // "starter" = fixed/included for all tiers
  // "professional" = choosable by Professional+ (counts toward 14-slot limit)
  // "agency" = only available on Agency (unlimited)
  availability: ConnectorTier;
}

export const CONNECTORS: Record<ConnectorId, ConnectorDefinition> = {
  // ── STARTER (6 fixed, always included) ──────────────────────────────────
  gmail: {
    id: "gmail", name: "Gmail", description: "Send and draft emails directly from TripDesk",
    category: "google", authType: "oauth2", oauthProvider: "google",
    scopes: ["https://www.googleapis.com/auth/gmail.compose", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"],
    icon: "✉️", color: "bg-red-50",
    whatItDoes: ["Draft client proposal emails", "Send booking confirmations", "Read client inquiries", "Send payment reminders"],
    availability: "starter",
  },
  google_drive: {
    id: "google_drive", name: "Google Drive", description: "Save itineraries, proposals, and reports to your Drive",
    category: "google", authType: "oauth2", oauthProvider: "google",
    scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly"],
    icon: "📁", color: "bg-yellow-50",
    whatItDoes: ["Save itinerary proposals as Google Docs", "Store destination research reports", "Organise client documents by folder"],
    availability: "starter",
  },
  google_calendar: {
    id: "google_calendar", name: "Google Calendar", description: "Create travel reminders and booking deadlines",
    category: "google", authType: "oauth2", oauthProvider: "google",
    scopes: ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"],
    icon: "📅", color: "bg-blue-50",
    whatItDoes: ["Create payment deadline reminders", "Add client travel dates", "Set document delivery reminders"],
    availability: "starter",
  },
  whatsapp: {
    id: "whatsapp", name: "WhatsApp", description: "Send client updates and proposals via WhatsApp",
    category: "communication", authType: "manual",
    icon: "💬", color: "bg-green-50",
    whatItDoes: ["Send itinerary summaries to clients", "Share quick travel updates", "Draft WhatsApp messages"],
    availability: "starter",
  },
  canva: {
    id: "canva", name: "Canva", description: "Create tour graphics and promotional materials",
    category: "design", authType: "oauth2",
    icon: "🎨", color: "bg-purple-50",
    whatItDoes: ["Create tour package promotional graphics", "Design social media posts", "Build branded itinerary covers"],
    availability: "starter",
  },
  skyscanner: {
    id: "skyscanner", name: "Skyscanner", description: "Research live flight prices for client proposals",
    category: "travel", authType: "api_key",
    icon: "✈️", color: "bg-sky-50",
    whatItDoes: ["Look up current flight prices", "Compare routes for client proposals", "Find cheapest travel months"],
    availability: "starter",
  },

  // ── PROFESSIONAL LIBRARY (choose 14 from these) ─────────────────────────
  notion: {
    id: "notion", name: "Notion", description: "Sync clients, itineraries, and packages to Notion",
    category: "productivity", authType: "oauth2",
    icon: "📋", color: "bg-gray-50",
    whatItDoes: ["Create client profile pages", "Build destination knowledge base", "Track tour packages in database"],
    availability: "professional",
  },
  wordpress: {
    id: "wordpress", name: "WordPress", description: "Publish tour packages directly to your website",
    category: "productivity", authType: "api_key",
    icon: "🌐", color: "bg-blue-50",
    whatItDoes: ["Publish tour product pages", "Update pricing and availability", "Add SEO fields automatically"],
    availability: "professional",
  },
  stripe: {
    id: "stripe", name: "Stripe", description: "Create payment links and check booking status",
    category: "finance", authType: "api_key",
    icon: "💳", color: "bg-indigo-50",
    whatItDoes: ["Generate payment links for proposals", "Check payment status", "Create invoices"],
    availability: "professional",
  },
  booking_com: {
    id: "booking_com", name: "Booking.com", description: "Research hotel pricing and availability",
    category: "booking", authType: "api_key",
    icon: "🏨", color: "bg-blue-50",
    whatItDoes: ["Look up hotel prices", "Compare accommodation options", "Check availability for client dates"],
    availability: "professional",
  },
  mailchimp: {
    id: "mailchimp", name: "Mailchimp", description: "Draft and send tour launch email campaigns",
    category: "marketing", authType: "api_key",
    icon: "📧", color: "bg-yellow-50",
    whatItDoes: ["Draft tour launch campaigns", "Send to subscriber segments", "Track open rates"],
    availability: "professional",
  },
  instagram: {
    id: "instagram", name: "Instagram", description: "Schedule and post tour announcements",
    category: "social", authType: "oauth2",
    icon: "📸", color: "bg-pink-50",
    whatItDoes: ["Post tour package announcements", "Schedule content", "Draft captions with hashtags"],
    availability: "professional",
  },
  facebook: {
    id: "facebook", name: "Facebook", description: "Post tour deals and destination content",
    category: "social", authType: "oauth2",
    icon: "👍", color: "bg-blue-50",
    whatItDoes: ["Post tour deals to your page", "Share destination content", "Draft promotional posts"],
    availability: "professional",
  },
  viator: {
    id: "viator", name: "Viator", description: "Research and compare tour experiences for clients",
    category: "booking", authType: "api_key",
    icon: "🗺️", color: "bg-orange-50",
    whatItDoes: ["Find tours and experiences", "Compare pricing", "Add to client itineraries"],
    availability: "professional",
  },
  tripadvisor: {
    id: "tripadvisor", name: "TripAdvisor", description: "Pull reviews and ratings for hotels and tours",
    category: "booking", authType: "api_key",
    icon: "⭐", color: "bg-green-50",
    whatItDoes: ["Check hotel and tour ratings", "Pull reviews for proposals", "Find top-rated experiences"],
    availability: "professional",
  },
  airbnb: {
    id: "airbnb", name: "Airbnb", description: "Research unique accommodation options",
    category: "booking", authType: "api_key",
    icon: "🏡", color: "bg-red-50",
    whatItDoes: ["Find unique accommodation options", "Compare pricing", "Research villa rentals"],
    availability: "professional",
  },
  google_docs: {
    id: "google_docs", name: "Google Docs", description: "Create and format documents in Google Docs",
    category: "google", authType: "oauth2", oauthProvider: "google",
    scopes: ["https://www.googleapis.com/auth/documents"],
    icon: "📝", color: "bg-blue-50",
    whatItDoes: ["Create formatted itinerary documents", "Build proposal templates", "Generate client-ready PDFs"],
    availability: "professional",
  },
  trello: {
    id: "trello", name: "Trello", description: "Track bookings and client progress on Trello boards",
    category: "productivity", authType: "api_key",
    icon: "📌", color: "bg-blue-50",
    whatItDoes: ["Create booking tracking cards", "Move clients through pipeline stages", "Set task reminders"],
    availability: "professional",
  },
  whatsapp_business: {
    id: "whatsapp_business", name: "WhatsApp Business", description: "Send automated messages via WhatsApp Business API",
    category: "communication", authType: "api_key",
    icon: "💼", color: "bg-green-50",
    whatItDoes: ["Send booking confirmations automatically", "Broadcast tour announcements", "Template message campaigns"],
    availability: "professional",
  },
  rome2rio: {
    id: "rome2rio", name: "Rome2Rio", description: "Research multi-modal transport options for itineraries",
    category: "travel", authType: "api_key",
    icon: "🚂", color: "bg-teal-50",
    whatItDoes: ["Find transport options between destinations", "Compare train, bus, flight routes", "Estimate journey times"],
    availability: "professional",
  },
  rezdy: {
    id: "rezdy", name: "Rezdy", description: "Manage tour bookings and inventory in Rezdy",
    category: "booking", authType: "api_key",
    icon: "🎫", color: "bg-orange-50",
    whatItDoes: ["Check tour availability", "Create bookings", "Sync product inventory"],
    availability: "professional",
  },
  getyourguide: {
    id: "getyourguide", name: "GetYourGuide", description: "Source and book tours and experiences",
    category: "booking", authType: "api_key",
    icon: "🎯", color: "bg-red-50",
    whatItDoes: ["Find experiences for client itineraries", "Check real-time availability", "Compare pricing"],
    availability: "professional",
  },
  klook: {
    id: "klook", name: "Klook", description: "Research Asia-Pacific experiences and activities",
    category: "booking", authType: "api_key",
    icon: "🌏", color: "bg-red-50",
    whatItDoes: ["Find Asia-Pacific activities", "Compare tour prices", "Check availability"],
    availability: "professional",
  },

  // ── AGENCY ONLY ──────────────────────────────────────────────────────────
  travefy: {
    id: "travefy", name: "Travefy", description: "Build and share itineraries in Travefy",
    category: "travel", authType: "api_key",
    icon: "🗂️", color: "bg-teal-50",
    whatItDoes: ["Export itineraries to Travefy", "Share with clients via Travefy portal", "Sync bookings"],
    availability: "agency",
  },
  travel_joy: {
    id: "travel_joy", name: "Travel Joy", description: "CRM and client portal via Travel Joy",
    category: "productivity", authType: "api_key",
    icon: "😊", color: "bg-yellow-50",
    whatItDoes: ["Sync client profiles", "Share itineraries via client portal", "Collect payments"],
    availability: "agency",
  },
  peek_pro: {
    id: "peek_pro", name: "Peek Pro", description: "Tour operator booking and scheduling via Peek Pro",
    category: "booking", authType: "api_key",
    icon: "👁️", color: "bg-purple-50",
    whatItDoes: ["Manage tour bookings", "Handle scheduling", "Process payments"],
    availability: "agency",
  },
  tourradar: {
    id: "tourradar", name: "TourRadar", description: "List and sell tours on the TourRadar marketplace",
    category: "booking", authType: "api_key",
    icon: "📡", color: "bg-blue-50",
    whatItDoes: ["List tours on TourRadar", "Manage bookings", "Sync availability"],
    availability: "agency",
  },
};

// Fixed 6 — always included regardless of tier
export const STARTER_CONNECTORS: ConnectorId[] = [
  "gmail", "google_drive", "google_calendar", "whatsapp", "canva", "skyscanner",
];

// Available to pick from on Professional (choose up to 14)
export const PROFESSIONAL_LIBRARY: ConnectorId[] = [
  "notion", "wordpress", "stripe", "booking_com", "mailchimp", "instagram",
  "facebook", "viator", "tripadvisor", "airbnb", "google_docs", "trello",
  "whatsapp_business", "rome2rio", "rezdy", "getyourguide", "klook",
];

// Agency-only connectors (not available on lower tiers)
export const AGENCY_ONLY: ConnectorId[] = [
  "travefy", "travel_joy", "peek_pro", "tourradar",
];

export const PROFESSIONAL_SLOT_LIMIT = 14;

export function getConnectorLimits(tier: string): {
  starterFixed: ConnectorId[];
  choosableLimit: number | null; // null = unlimited
  canChooseFrom: ConnectorId[];
  canSeeAgencyOnly: boolean;
} {
  switch (tier) {
    case "starter":
      return {
        starterFixed: STARTER_CONNECTORS,
        choosableLimit: 0,
        canChooseFrom: [],
        canSeeAgencyOnly: false,
      };
    case "professional":
      return {
        starterFixed: STARTER_CONNECTORS,
        choosableLimit: PROFESSIONAL_SLOT_LIMIT,
        canChooseFrom: PROFESSIONAL_LIBRARY,
        canSeeAgencyOnly: false,
      };
    case "agency":
    case "enterprise":
      return {
        starterFixed: STARTER_CONNECTORS,
        choosableLimit: null,
        canChooseFrom: [...PROFESSIONAL_LIBRARY, ...AGENCY_ONLY],
        canSeeAgencyOnly: true,
      };
    default:
      return {
        starterFixed: STARTER_CONNECTORS,
        choosableLimit: 0,
        canChooseFrom: [],
        canSeeAgencyOnly: false,
      };
  }
}
