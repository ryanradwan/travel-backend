export type ConnectorId =
  // Starter (6 fixed)
  | "gmail" | "google_drive" | "google_calendar" | "whatsapp" | "canva" | "skyscanner"
  // Professional library (choose up to 14)
  | "notion" | "wordpress" | "stripe" | "booking_com" | "mailchimp" | "instagram"
  | "facebook" | "viator" | "tripadvisor" | "airbnb" | "google_docs" | "trello"
  | "whatsapp_business" | "rome2rio" | "rezdy" | "getyourguide" | "klook"
  | "hubspot" | "calendly" | "docusign" | "quickbooks" | "google_sheets"
  | "slack" | "typeform" | "zoom" | "expedia" | "hostelworld"
  // Agency only
  | "travefy" | "travel_joy" | "peek_pro" | "tourradar"
  | "salesforce" | "monday" | "xero" | "airtable" | "zapier"
  // Agency only — travel-specific
  | "amadeus" | "sabre" | "fareharbor" | "bokun" | "checkfront" | "trekksoft"
  | "viator_supplier" | "getyourguide_supplier" | "musement" | "civitatis"
  | "sherpa" | "allianz_travel" | "global_rescue" | "virtuoso" | "signature_travel"
  | "sojern" | "umapped" | "tourplan" | "tourcms" | "headout";

export type ConnectorTier = "starter" | "professional" | "agency";

export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  description: string;
  category: "google" | "communication" | "design" | "travel" | "booking" | "marketing" | "social" | "finance" | "productivity" | "gds";
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
    availability: "starter",
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
    availability: "starter",
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
  hubspot: {
    id: "hubspot", name: "HubSpot", description: "CRM to track leads, clients, and your sales pipeline",
    category: "productivity", authType: "oauth2",
    icon: "🔶", color: "bg-orange-50",
    whatItDoes: ["Log new client enquiries automatically", "Track deals from lead to booking", "Sync contact details from proposals"],
    availability: "professional",
  },
  calendly: {
    id: "calendly", name: "Calendly", description: "Let clients book consultations directly from proposals",
    category: "productivity", authType: "oauth2",
    icon: "📆", color: "bg-blue-50",
    whatItDoes: ["Add booking links to client proposals", "Create consultation scheduling pages", "Sync appointments to your calendar"],
    availability: "professional",
  },
  docusign: {
    id: "docusign", name: "DocuSign", description: "Send booking agreements and contracts for e-signature",
    category: "finance", authType: "oauth2",
    icon: "✍️", color: "bg-yellow-50",
    whatItDoes: ["Send booking agreements to clients", "Get signed contracts in minutes", "Store signed documents automatically"],
    availability: "professional",
  },
  quickbooks: {
    id: "quickbooks", name: "QuickBooks", description: "Sync invoices and payments to your accounting",
    category: "finance", authType: "oauth2",
    icon: "📊", color: "bg-green-50",
    whatItDoes: ["Create invoices in QuickBooks from proposals", "Sync payments automatically", "Track revenue by client or trip type"],
    availability: "professional",
  },
  google_sheets: {
    id: "google_sheets", name: "Google Sheets", description: "Export client lists, bookings, and data to spreadsheets",
    category: "google", authType: "oauth2", oauthProvider: "google",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    icon: "📈", color: "bg-green-50",
    whatItDoes: ["Export client databases to Sheets", "Track bookings in a spreadsheet", "Build custom reports"],
    availability: "professional",
  },
  slack: {
    id: "slack", name: "Slack", description: "Get team notifications when tasks and workflows complete",
    category: "communication", authType: "oauth2",
    icon: "💬", color: "bg-purple-50",
    whatItDoes: ["Notify your team when a proposal is ready", "Alert on new client enquiries", "Post workflow completion updates"],
    availability: "professional",
  },
  typeform: {
    id: "typeform", name: "Typeform", description: "Create client intake forms that feed into TripDesk",
    category: "productivity", authType: "api_key",
    icon: "📋", color: "bg-pink-50",
    whatItDoes: ["Build client travel preference forms", "Auto-create client profiles from responses", "Collect trip requirements before calls"],
    availability: "professional",
  },
  zoom: {
    id: "zoom", name: "Zoom", description: "Auto-create meeting links for client consultations",
    category: "communication", authType: "oauth2",
    icon: "🎥", color: "bg-blue-50",
    whatItDoes: ["Add Zoom links to client proposals", "Schedule consultation calls automatically", "Send meeting reminders to clients"],
    availability: "professional",
  },
  expedia: {
    id: "expedia", name: "Expedia Partner Central", description: "Research hotel pricing and packages via Expedia",
    category: "booking", authType: "api_key",
    icon: "🏨", color: "bg-yellow-50",
    whatItDoes: ["Look up hotel availability and pricing", "Compare package deals", "Find flight + hotel combinations"],
    availability: "professional",
  },
  hostelworld: {
    id: "hostelworld", name: "Hostelworld", description: "Research budget and boutique accommodation options",
    category: "booking", authType: "api_key",
    icon: "🛏️", color: "bg-orange-50",
    whatItDoes: ["Find budget accommodation for adventure clients", "Compare hostel and guesthouse options", "Check real-time availability"],
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
  salesforce: {
    id: "salesforce", name: "Salesforce", description: "Enterprise CRM for larger travel agencies and teams",
    category: "productivity", authType: "oauth2",
    icon: "☁️", color: "bg-blue-50",
    whatItDoes: ["Sync all client and booking data to Salesforce", "Track enterprise sales pipelines", "Automate client follow-up workflows"],
    availability: "agency",
  },
  monday: {
    id: "monday", name: "Monday.com", description: "Project management for complex group tours and events",
    category: "productivity", authType: "api_key",
    icon: "📅", color: "bg-red-50",
    whatItDoes: ["Track group tour production timelines", "Manage team tasks per departure", "Monitor booking milestones"],
    availability: "agency",
  },
  xero: {
    id: "xero", name: "Xero", description: "Accounting and invoicing for agencies with complex billing",
    category: "finance", authType: "oauth2",
    icon: "💰", color: "bg-teal-50",
    whatItDoes: ["Sync invoices and payments to Xero", "Reconcile bookings with bank feeds", "Generate financial reports by tour"],
    availability: "agency",
  },
  airtable: {
    id: "airtable", name: "Airtable", description: "Build custom databases for tour inventory and operations",
    category: "productivity", authType: "api_key",
    icon: "🗃️", color: "bg-yellow-50",
    whatItDoes: ["Build custom tour inventory databases", "Track supplier contacts and contracts", "Manage complex multi-departure schedules"],
    availability: "agency",
  },
  zapier: {
    id: "zapier", name: "Zapier", description: "Connect TripDesk to any app not natively supported",
    category: "productivity", authType: "api_key",
    icon: "⚡", color: "bg-orange-50",
    whatItDoes: ["Connect TripDesk to 6,000+ apps", "Build custom automation flows", "Trigger actions in any tool when tasks complete"],
    availability: "agency",
  },

  // ── AGENCY TRAVEL-SPECIFIC ───────────────────────────────────────────────
  amadeus: {
    id: "amadeus", name: "Amadeus GDS", description: "Live flight, hotel, and car inventory from the world's largest GDS",
    category: "gds", authType: "api_key",
    icon: "🌐", color: "bg-blue-50",
    whatItDoes: [
      "Search live flight inventory across all airlines",
      "Book hotels with real-time availability and net rates",
      "Pull accurate pricing into client proposals instantly",
      "Access car rental and rail inventory worldwide",
    ],
    availability: "agency",
  },
  sabre: {
    id: "sabre", name: "Sabre GDS", description: "Flight, hotel, and package booking via the Sabre global distribution system",
    category: "gds", authType: "api_key",
    icon: "✈️", color: "bg-red-50",
    whatItDoes: [
      "Book flights and hotels directly in Sabre",
      "Access negotiated corporate and leisure fares",
      "Pull PNR data into client itineraries automatically",
      "Manage group bookings and seat blocks",
    ],
    availability: "agency",
  },
  fareharbor: {
    id: "fareharbor", name: "FareHarbor", description: "Tour and activity booking management for operators",
    category: "booking", authType: "api_key",
    icon: "⛵", color: "bg-cyan-50",
    whatItDoes: [
      "Check real-time tour availability for client proposals",
      "Create bookings and send confirmation emails",
      "Manage waivers and customer documents",
      "Sync capacity and pricing with your TripDesk packages",
    ],
    availability: "agency",
  },
  bokun: {
    id: "bokun", name: "Bókun", description: "Viator-owned tour operator platform for inventory and distribution",
    category: "booking", authType: "api_key",
    icon: "🎡", color: "bg-green-50",
    whatItDoes: [
      "Manage your tour product inventory in Bókun",
      "Distribute products to Viator, GetYourGuide, and OTAs",
      "Pull live availability into TripDesk proposals",
      "Process bookings and payments automatically",
    ],
    availability: "agency",
  },
  checkfront: {
    id: "checkfront", name: "Checkfront", description: "Booking and reservation management for tour operators",
    category: "booking", authType: "api_key",
    icon: "📋", color: "bg-indigo-50",
    whatItDoes: [
      "Sync your tour inventory and availability",
      "Create bookings from TripDesk proposals",
      "Send automated booking confirmations",
      "Manage customer waivers and documents",
    ],
    availability: "agency",
  },
  trekksoft: {
    id: "trekksoft", name: "TrekkSoft", description: "Adventure and activity booking platform for tour operators",
    category: "booking", authType: "api_key",
    icon: "🏔️", color: "bg-green-50",
    whatItDoes: [
      "Manage adventure tour bookings and capacity",
      "Distribute to global OTA channels",
      "Handle guide assignments and resource management",
      "Pull live pricing into client proposals",
    ],
    availability: "agency",
  },
  viator_supplier: {
    id: "viator_supplier", name: "Viator Supplier", description: "Manage and optimise your listings on Viator",
    category: "booking", authType: "api_key",
    icon: "🗺️", color: "bg-orange-50",
    whatItDoes: [
      "Publish new tour products directly to Viator",
      "Update pricing, photos, and descriptions",
      "Monitor reviews and respond to feedback",
      "Track bookings and revenue from Viator channel",
    ],
    availability: "agency",
  },
  getyourguide_supplier: {
    id: "getyourguide_supplier", name: "GetYourGuide Supplier", description: "Manage your experience listings on GetYourGuide",
    category: "booking", authType: "api_key",
    icon: "🎯", color: "bg-red-50",
    whatItDoes: [
      "Publish and update tour products on GetYourGuide",
      "Sync availability calendars automatically",
      "Manage pricing and capacity in real time",
      "Track performance and booking analytics",
    ],
    availability: "agency",
  },
  musement: {
    id: "musement", name: "Musement", description: "European tours and museum experiences — TUI Group platform",
    category: "booking", authType: "api_key",
    icon: "🏛️", color: "bg-purple-50",
    whatItDoes: [
      "Source curated European cultural experiences",
      "Add museum skip-the-line tickets to itineraries",
      "Access exclusive TUI Group inventory",
      "Book guided city tours across Europe",
    ],
    availability: "agency",
  },
  civitatis: {
    id: "civitatis", name: "Civitatis", description: "Spanish-language tour marketplace — dominant in Latin America",
    category: "booking", authType: "api_key",
    icon: "🌎", color: "bg-yellow-50",
    whatItDoes: [
      "Source experiences for Spanish-speaking clients",
      "Find tours across Latin America and Spain",
      "Add Spanish-language options to proposals",
      "Access exclusive inventory for LATAM destinations",
    ],
    availability: "agency",
  },
  sherpa: {
    id: "sherpa", name: "Sherpa° (Entry Requirements)", description: "Real-time visa, entry, and health requirement data for every country",
    category: "travel", authType: "api_key",
    icon: "🛂", color: "bg-teal-50",
    whatItDoes: [
      "Get live visa requirements for any passport + destination",
      "Check health certificates, COVID requirements, and entry rules",
      "Auto-populate visa sections of every client proposal",
      "Receive alerts when entry requirements change",
    ],
    availability: "agency",
  },
  allianz_travel: {
    id: "allianz_travel", name: "Allianz Travel Insurance", description: "Embed travel insurance quotes directly into client proposals",
    category: "travel", authType: "api_key",
    icon: "🛡️", color: "bg-blue-50",
    whatItDoes: [
      "Generate travel insurance quotes from within TripDesk",
      "Embed insurance options in client proposals",
      "Track which clients have purchased coverage",
      "Earn commission on policies sold",
    ],
    availability: "agency",
  },
  global_rescue: {
    id: "global_rescue", name: "Global Rescue", description: "Emergency evacuation and rescue membership for high-risk destinations",
    category: "travel", authType: "api_key",
    icon: "🚁", color: "bg-red-50",
    whatItDoes: [
      "Add emergency evacuation options to adventure proposals",
      "Recommend memberships for remote or high-risk itineraries",
      "Track which clients have active Global Rescue memberships",
      "Include rescue coverage details in pre-departure documents",
    ],
    availability: "agency",
  },
  virtuoso: {
    id: "virtuoso", name: "Virtuoso Network", description: "Access exclusive luxury amenities, upgrades, and preferred rates",
    category: "travel", authType: "manual",
    icon: "💎", color: "bg-yellow-50",
    whatItDoes: [
      "Access Virtuoso preferred rates and amenity programs",
      "Add hotel upgrades and inclusions to luxury proposals",
      "Pull Virtuoso-exclusive itineraries into TripDesk",
      "Track VIP amenities confirmed at each property",
    ],
    availability: "agency",
  },
  signature_travel: {
    id: "signature_travel", name: "Signature Travel Network", description: "Preferred partner program with exclusive hotel and cruise amenities",
    category: "travel", authType: "manual",
    icon: "🏆", color: "bg-amber-50",
    whatItDoes: [
      "Access Signature preferred rates and amenities",
      "Add exclusive onboard credits and upgrades to proposals",
      "Track Signature partner bookings and commissions",
      "Pull preferred supplier inventory into TripDesk",
    ],
    availability: "agency",
  },
  sojern: {
    id: "sojern", name: "Sojern", description: "Travel intent data and digital advertising for tour operators",
    category: "marketing", authType: "api_key",
    icon: "📡", color: "bg-purple-50",
    whatItDoes: [
      "Target travellers actively searching your destinations",
      "Retarget website visitors with tour package ads",
      "Track which marketing channels drive bookings",
      "Build lookalike audiences from your best clients",
    ],
    availability: "agency",
  },
  umapped: {
    id: "umapped", name: "Umapped", description: "Beautiful shareable itineraries your clients can access on any device",
    category: "travel", authType: "api_key",
    icon: "🗺️", color: "bg-teal-50",
    whatItDoes: [
      "Publish TripDesk itineraries as interactive client-facing documents",
      "Share real-time updates with clients during their trip",
      "Add maps, photos, and supplier details",
      "Clients can access their trip offline on mobile",
    ],
    availability: "agency",
  },
  tourplan: {
    id: "tourplan", name: "Tourplan", description: "Enterprise tour operator software for complex FIT and group operations",
    category: "booking", authType: "api_key",
    icon: "🏢", color: "bg-gray-50",
    whatItDoes: [
      "Sync bookings between TripDesk and Tourplan",
      "Manage FIT and group costing automatically",
      "Pull supplier contracts and net rates into proposals",
      "Handle complex multi-component tour operations",
    ],
    availability: "agency",
  },
  tourcms: {
    id: "tourcms", name: "TourCMS", description: "Channel management and booking system for tour operators",
    category: "booking", authType: "api_key",
    icon: "📡", color: "bg-blue-50",
    whatItDoes: [
      "Distribute your tours to 250+ OTA channels",
      "Sync availability and pricing across all channels",
      "Manage bookings from all channels in one place",
      "Pull live availability into TripDesk proposals",
    ],
    availability: "agency",
  },
  headout: {
    id: "headout", name: "Headout", description: "Last-minute experiences and tickets for major global cities",
    category: "booking", authType: "api_key",
    icon: "🎭", color: "bg-pink-50",
    whatItDoes: [
      "Find last-minute show and experience tickets",
      "Add city experiences to itineraries with real-time pricing",
      "Source hard-to-get attraction tickets",
      "Offer flexible no-cancellation-fee options to clients",
    ],
    availability: "agency",
  },
};

// Fixed 6 — always included regardless of tier
export const STARTER_CONNECTORS: ConnectorId[] = [
  "gmail", "google_drive", "google_calendar", "google_docs",
  "whatsapp", "canva", "skyscanner", "mailchimp",
];

// Available to pick from on Professional (choose up to 14 from this list)
export const PROFESSIONAL_LIBRARY: ConnectorId[] = [
  // Travel & booking
  "notion", "wordpress", "booking_com", "viator", "tripadvisor", "airbnb",
  "getyourguide", "klook", "rezdy", "expedia", "hostelworld", "rome2rio",
  // Marketing & social
  "instagram", "facebook",
  // Productivity & CRM
  "google_sheets", "trello", "hubspot", "typeform",
  // Communication
  "whatsapp_business", "slack", "zoom", "calendly",
  // Finance & legal
  "stripe", "quickbooks", "docusign",
];

// Agency-only connectors (not available on lower tiers)
export const AGENCY_ONLY: ConnectorId[] = [
  // General business (carried over)
  "travefy", "travel_joy", "peek_pro", "tourradar",
  "salesforce", "monday", "xero", "airtable", "zapier",
  // Travel-specific agency tools
  "amadeus", "sabre",                           // GDS
  "fareharbor", "bokun", "checkfront", "trekksoft", "tourplan", "tourcms", // Tour ops
  "viator_supplier", "getyourguide_supplier",   // OTA supplier portals
  "musement", "civitatis", "headout",           // Experience sourcing
  "sherpa", "allianz_travel", "global_rescue",  // Travel services
  "virtuoso", "signature_travel",               // Luxury consortia
  "sojern",                                     // Travel marketing
  "umapped",                                    // Client-facing itineraries
];

export const PROFESSIONAL_SLOT_LIMIT = 12; // 8 Starter fixed + 12 chosen = 20 total

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
