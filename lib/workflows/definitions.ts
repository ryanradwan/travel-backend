export type WorkflowId = "itinerary" | "research" | "package";

export interface WorkflowStep {
  number: number;
  name: string;
  description: string;
  requiresConnector?: string; // connector needed — null means AI-only step
}

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  outputType: "itinerary_proposal" | "destination_report" | "tour_package";
  steps: WorkflowStep[];
  inputPrompt: string; // what to ask the user before starting
}

export const WORKFLOWS: Record<WorkflowId, WorkflowDefinition> = {
  itinerary: {
    id: "itinerary",
    name: "Client Itinerary Proposal",
    description: "Turn a client request into a complete, ready-to-send proposal",
    outputType: "itinerary_proposal",
    inputPrompt: "Tell me about the client request. Include: destination, travel dates, number of travelers, budget range, and any special requests or preferences.",
    steps: [
      { number: 1, name: "Analysing client request", description: "Understanding client needs, preferences, and constraints" },
      { number: 2, name: "Researching destination", description: "Best time to visit, top activities, local logistics" },
      { number: 3, name: "Checking visa requirements", description: "Verifying visa requirements for client nationality" },
      { number: 4, name: "Researching pricing", description: "Realistic estimates for flights, hotels, and activities" },
      { number: 5, name: "Building day-by-day itinerary", description: "Creating detailed daily plan with timings and recommendations" },
      { number: 6, name: "Writing proposal document", description: "Formatting complete client-ready proposal" },
      { number: 7, name: "Saving to Google Drive", description: "Storing proposal document", requiresConnector: "google_drive" },
      { number: 8, name: "Creating Notion client entry", description: "Adding client and trip to your Notion database", requiresConnector: "notion" },
      { number: 9, name: "Drafting reply email", description: "Writing email to send proposal to client", requiresConnector: "gmail" },
      { number: 10, name: "Logging task", description: "Recording completed task in history" },
    ],
  },

  research: {
    id: "research",
    name: "Destination Research Report",
    description: "Compile a complete reference report on any destination",
    outputType: "destination_report",
    inputPrompt: "Which destination would you like me to research? You can also specify the nationalities of clients you typically send there (for visa requirements).",
    steps: [
      { number: 1, name: "Pulling destination overview", description: "Geography, culture, key facts" },
      { number: 2, name: "Checking State Dept advisory", description: "Current US travel advisory level from travel.state.gov" },
      { number: 3, name: "Researching best travel seasons", description: "Month-by-month weather, crowds, and pricing patterns" },
      { number: 4, name: "Compiling visa requirements", description: "Entry requirements for US passport holders and other nationalities" },
      { number: 5, name: "Researching average pricing", description: "Budget, mid-range, and luxury daily cost estimates" },
      { number: 6, name: "Identifying top experiences", description: "Must-sees, hidden gems, and advisor selling points" },
      { number: 7, name: "Checking current events", description: "Local holidays, festivals, and events this year" },
      { number: 8, name: "Compiling full report", description: "Formatting complete destination reference document" },
      { number: 9, name: "Saving to Google Drive", description: "Storing report for your team", requiresConnector: "google_drive" },
      { number: 10, name: "Creating Notion reference page", description: "Adding destination to your Notion knowledge base", requiresConnector: "notion" },
    ],
  },

  package: {
    id: "package",
    name: "Tour Package Builder",
    description: "Build a tour package and publish it ready to sell",
    outputType: "tour_package",
    inputPrompt: "Describe the tour package you want to create. Include: destination, duration, what's included, target travelers, and your selling price.",
    steps: [
      { number: 1, name: "Structuring package", description: "Defining inclusions, exclusions, and pricing tiers" },
      { number: 2, name: "Writing package description", description: "Compelling copy that sells the experience" },
      { number: 3, name: "Building day-by-day itinerary", description: "Detailed daily plan for the tour" },
      { number: 4, name: "Creating Canva graphic", description: "Promotional image for the tour", requiresConnector: "canva" },
      { number: 5, name: "Publishing to WordPress", description: "Creating product page on your website", requiresConnector: "wordpress" },
      { number: 6, name: "Setting up pricing & SEO", description: "Adding pricing, meta description, and SEO fields", requiresConnector: "wordpress" },
      { number: 7, name: "Saving draft for review", description: "Storing all assets ready for your approval" },
      { number: 8, name: "Creating Notion entry", description: "Adding package to your product database", requiresConnector: "notion" },
      { number: 9, name: "Drafting launch email", description: "Email announcement for your list", requiresConnector: "gmail" },
      { number: 10, name: "Drafting social announcement", description: "Social media posts to announce the package" },
    ],
  },
};
