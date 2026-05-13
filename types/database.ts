export type SubscriptionTier = "starter" | "professional" | "agency" | "enterprise";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "rolled_back";
export type ConnectorStatus = "connected" | "disconnected" | "unhealthy" | "expired";
export type ConnectorName =
  | "gmail"
  | "google_drive"
  | "google_calendar"
  | "whatsapp"
  | "canva"
  | "skyscanner"
  | "notion"
  | "wordpress"
  | "stripe"
  | "booking_com"
  | "mailchimp"
  | "instagram"
  | "facebook"
  | "viator"
  | "tripadvisor"
  | "airbnb"
  | "google_docs"
  | "trello"
  | "whatsapp_business"
  | "rome2rio";

export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  subscription_status: "trialing" | "active" | "past_due" | "canceled" | "paused";
  stripe_subscription_id: string | null;
  referral_code: string | null;
  referred_by: string | null;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  location: string;
  specialty_destinations: string[];
  target_clients: string;
  team_size: number;
  years_in_business: number;
  website: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  preferences: string | null;
  travel_history: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  input: string;
  output: string | null;
  apps_used: string[];
  task_type: string;
  status: TaskStatus;
  current_step: number;
  total_steps: number;
  error_message: string | null;
  screenshot_url: string | null;
  tokens_used: number;
  created_at: string;
  completed_at: string | null;
}

export interface TaskStep {
  id: string;
  task_id: string;
  step_number: number;
  step_name: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

export interface TaskUsage {
  id: string;
  user_id: string;
  month: string;
  tasks_used: number;
  tasks_limit: number;
  reset_date: string;
}

export interface Connector {
  id: string;
  user_id: string;
  connector_name: ConnectorName;
  credentials_encrypted: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  status: ConnectorStatus;
  connected_at: string | null;
  last_health_check: string | null;
  last_health_status: boolean | null;
}

export interface CustomSkill {
  id: string;
  user_id: string;
  name: string;
  description: string;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  connector_ids: string[];
  prompt_template: string;
  created_at: string;
}

export interface CustomPlugin {
  id: string;
  user_id: string;
  name: string;
  api_base_url: string;
  api_credentials_encrypted: string | null;
  permissions: string[];
  status: "active" | "inactive";
  created_at: string;
}

export interface AgentMemory {
  id: string;
  user_id: string;
  memory_type: "preference" | "client_insight" | "workflow_pattern" | "destination_knowledge";
  key: string;
  value: string;
  confidence: number;
  source_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelTemplate {
  id: string;
  name: string;
  category: "itinerary" | "proposal" | "email" | "invoice" | "social_media" | "report";
  destination: string | null;
  client_type: string | null;
  content: string;
  variables: string[];
  is_public: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, "id" | "created_at">; Update: Partial<User> };
      business_profiles: { Row: BusinessProfile; Insert: Omit<BusinessProfile, "id" | "created_at" | "updated_at">; Update: Partial<BusinessProfile> };
      clients: { Row: Client; Insert: Omit<Client, "id" | "created_at" | "updated_at">; Update: Partial<Client> };
      tasks: { Row: Task; Insert: Omit<Task, "id" | "created_at">; Update: Partial<Task> };
      task_steps: { Row: TaskStep; Insert: Omit<TaskStep, "id">; Update: Partial<TaskStep> };
      task_usage: { Row: TaskUsage; Insert: Omit<TaskUsage, "id">; Update: Partial<TaskUsage> };
      connectors: { Row: Connector; Insert: Omit<Connector, "id">; Update: Partial<Connector> };
      custom_skills: { Row: CustomSkill; Insert: Omit<CustomSkill, "id" | "created_at">; Update: Partial<CustomSkill> };
      custom_plugins: { Row: CustomPlugin; Insert: Omit<CustomPlugin, "id" | "created_at">; Update: Partial<CustomPlugin> };
      agent_memory: { Row: AgentMemory; Insert: Omit<AgentMemory, "id" | "created_at" | "updated_at">; Update: Partial<AgentMemory> };
      travel_templates: { Row: TravelTemplate; Insert: Omit<TravelTemplate, "id" | "created_at">; Update: Partial<TravelTemplate> };
    };
  };
}
