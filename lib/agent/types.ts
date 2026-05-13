export interface BusinessProfile {
  business_name: string;
  business_type: string;
  location: string;
  specialty_destinations: string[];
  target_clients: string | null;
  team_size: number;
  years_in_business: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type WorkflowType = "itinerary" | "research" | "package" | "general";

export interface TaskContext {
  userId: string;
  taskId: string;
  workflowType: WorkflowType;
  businessProfile: BusinessProfile | null;
}

export interface ComplianceCheck {
  visaInfo: string | null;
  advisoryLevel: string | null;
  disclaimer: string;
}
