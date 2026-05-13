-- =============================================
-- TripDesk.ai Initial Schema
-- Migration: 001_initial_schema
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'agency', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ,
  referral_code TEXT UNIQUE DEFAULT CONCAT('TD', UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8))),
  referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- BUSINESS PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location TEXT NOT NULL,
  specialty_destinations TEXT[] DEFAULT '{}',
  target_clients TEXT,
  team_size INTEGER DEFAULT 1,
  years_in_business INTEGER DEFAULT 0,
  website TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);

-- =============================================
-- CLIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  preferences TEXT,
  travel_history TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  output TEXT,
  apps_used TEXT[] DEFAULT '{}',
  task_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rolled_back')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  error_message TEXT,
  screenshot_url TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- =============================================
-- TASK STEPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.task_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task steps" ON public.task_steps
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.tasks WHERE id = task_id)
  );

CREATE POLICY "Users can insert own task steps" ON public.task_steps
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.tasks WHERE id = task_id)
  );

CREATE POLICY "Users can update own task steps" ON public.task_steps
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.tasks WHERE id = task_id)
  );

CREATE INDEX idx_task_steps_task_id ON public.task_steps(task_id);

-- =============================================
-- TASK USAGE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.task_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- format: YYYY-MM
  tasks_used INTEGER DEFAULT 0,
  tasks_limit INTEGER NOT NULL DEFAULT 30,
  reset_date DATE NOT NULL,
  UNIQUE(user_id, month)
);

ALTER TABLE public.task_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task usage" ON public.task_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task usage" ON public.task_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task usage" ON public.task_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_task_usage_user_id ON public.task_usage(user_id);

-- =============================================
-- CONNECTORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  connector_name TEXT NOT NULL,
  credentials_encrypted TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'unhealthy', 'expired')),
  connected_at TIMESTAMPTZ,
  last_health_check TIMESTAMPTZ,
  last_health_status BOOLEAN,
  UNIQUE(user_id, connector_name)
);

ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connectors" ON public.connectors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connectors" ON public.connectors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connectors" ON public.connectors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connectors" ON public.connectors
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_connectors_user_id ON public.connectors(user_id);

-- =============================================
-- CUSTOM SKILLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.custom_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  inputs JSONB DEFAULT '{}',
  outputs JSONB DEFAULT '{}',
  connector_ids UUID[] DEFAULT '{}',
  prompt_template TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.custom_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom skills" ON public.custom_skills
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_custom_skills_user_id ON public.custom_skills(user_id);

-- =============================================
-- CUSTOM PLUGINS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.custom_plugins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_base_url TEXT NOT NULL,
  api_credentials_encrypted TEXT,
  permissions TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.custom_plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom plugins" ON public.custom_plugins
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_custom_plugins_user_id ON public.custom_plugins(user_id);

-- =============================================
-- AGENT MEMORY TABLE (DIFFERENTIATOR)
-- =============================================
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'client_insight', 'workflow_pattern', 'destination_knowledge')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.80 CHECK (confidence >= 0 AND confidence <= 1),
  source_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, memory_type, key)
);

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agent memory" ON public.agent_memory
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_agent_memory_user_id ON public.agent_memory(user_id);
CREATE INDEX idx_agent_memory_type ON public.agent_memory(memory_type);

-- =============================================
-- TRAVEL TEMPLATES TABLE (DIFFERENTIATOR)
-- =============================================
CREATE TABLE IF NOT EXISTS public.travel_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('itinerary', 'proposal', 'email', 'invoice', 'social_media', 'report')),
  destination TEXT,
  client_type TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Travel templates are platform-level — all authenticated users can read public ones
ALTER TABLE public.travel_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view public templates" ON public.travel_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_public = TRUE);

CREATE INDEX idx_travel_templates_category ON public.travel_templates(category);
CREATE INDEX idx_travel_templates_destination ON public.travel_templates(destination);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_agent_memory_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- AUTO-CREATE USER RECORD ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW() + INTERVAL '7 days'
  );

  -- Initialize task usage for current month
  INSERT INTO public.task_usage (user_id, month, tasks_limit, reset_date)
  VALUES (
    NEW.id,
    TO_CHAR(NOW(), 'YYYY-MM'),
    30,
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ENABLE REALTIME ON TASKS (for live progress)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_steps;
